#!/usr/bin/env bash
set -euo pipefail

: "${HARNESS_APK:?}"
: "${HARNESS_TEST_APK:?}"
: "${LEGACY_APK:?}"
: "${PERMANENT_APK:?}"

mkdir -p synthetic-diagnostics/multi-fixtures

cleanup() {
  set +e
  adb logcat -d > synthetic-diagnostics/multi-logcat.txt
  adb shell uiautomator dump /sdcard/window-multi-final.xml >/dev/null 2>&1
  adb pull /sdcard/window-multi-final.xml synthetic-diagnostics/window-multi-final.xml >/dev/null 2>&1
  adb pull /sdcard/Android/data/com.cactusbyte.synthetictransition/files/diagnostics synthetic-diagnostics/multi-harness >/dev/null 2>&1
  adb shell ls -la /sdcard/Download > synthetic-diagnostics/multi-downloads-listing.txt 2>&1
  adb shell content query --uri content://media/external/audio/media --projection _display_name > synthetic-diagnostics/multi-media-audio-index.txt 2>&1
  set -e
}
trap cleanup EXIT

adb wait-for-device
adb uninstall com.cactusbyte.acelynnpro >/dev/null 2>&1 || true
adb install -r "$HARNESS_APK"
adb install -r "$HARNESS_TEST_APK"
adb install "$LEGACY_APK"

echo '=== Multi-snapshot precondition: generate four deterministic band fingerprints ==='
python3 - synthetic-diagnostics/multi-fixtures <<'PY'
import hashlib, math, struct, sys, wave
from pathlib import Path

root = Path(sys.argv[1])
root.mkdir(parents=True, exist_ok=True)
sample_rate = 16000
duration_seconds = 90
amplitude = 0.35
specs = [
    ('01-sub.wav', 45.0),
    ('02-bass.wav', 120.0),
    ('03-mids.wav', 1000.0),
    ('04-presence.wav', 4000.0),
]
manifest = []
for name, frequency in specs:
    path = root / name
    peak = int(32767 * amplitude)
    frames = bytearray()
    for i in range(sample_rate * duration_seconds):
        value = int(round(peak * math.sin(2.0 * math.pi * frequency * i / sample_rate)))
        frames.extend(struct.pack('<h', value))
    with wave.open(str(path), 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(sample_rate)
        wav.writeframes(bytes(frames))
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    manifest.append(f'{name} frequency_hz={frequency:g} sha256={digest} bytes={path.stat().st_size}')
(root / 'manifest.txt').write_text('\n'.join(manifest) + '\n', encoding='utf-8')
print('\n'.join(manifest))
PY

adb shell rm -f \
  /sdcard/Download/01-sub.wav \
  /sdcard/Download/02-bass.wav \
  /sdcard/Download/03-mids.wav \
  /sdcard/Download/04-presence.wav \
  /sdcard/Download/acelynn-session-report.json || true

for file in 01-sub.wav 02-bass.wav 03-mids.wav 04-presence.wav; do
  adb push "synthetic-diagnostics/multi-fixtures/$file" "/sdcard/Download/$file"
  adb shell test -s "/sdcard/Download/$file"
  adb shell am broadcast \
    -a android.intent.action.MEDIA_SCANNER_SCAN_FILE \
    -d "file:///sdcard/Download/$file" >/dev/null
  indexed=0
  for _ in $(seq 1 20); do
    if adb shell content query --uri content://media/external/audio/media --projection _display_name 2>/dev/null | grep -Fq "$file"; then
      indexed=1
      break
    fi
    sleep 1
  done
  if [ "$indexed" -ne 1 ]; then
    echo "HARNESS PRECONDITION RED: $file exists but Android did not index it as audio." >&2
    exit 40
  fi
done
echo 'Multi-snapshot media precondition GREEN: all four WAV fingerprints are physical and indexed.'

echo '=== Multi Phase 1: legacy four-snapshot real-user export ==='
set +e
adb shell am instrument -w -r \
  -e class com.cactusbyte.synthetictransition.AcelynnMultiSnapshotTest#testLegacyMultiSnapshotExport \
  com.cactusbyte.synthetictransition.test/androidx.test.runner.AndroidJUnitRunner \
  | tee synthetic-diagnostics/multi-legacy-instrumentation.txt
legacy_instrument_rc=${PIPESTATUS[0]}
set -e

if [ "$legacy_instrument_rc" -ne 0 ] \
  || grep -Fq 'FAILURES!!!' synthetic-diagnostics/multi-legacy-instrumentation.txt \
  || grep -Fq 'INSTRUMENTATION_STATUS_CODE: -2' synthetic-diagnostics/multi-legacy-instrumentation.txt; then
  if grep -Fq 'LEGACY_BRIDGE_FAILURE:' synthetic-diagnostics/multi-legacy-instrumentation.txt; then
    echo 'MULTI LEGACY BRIDGE GATE RED: the literal legacy app did not reach the HTTPS migration handoff.' >&2
    exit 41
  fi
  if grep -Fq 'LEGACY_BROWSER_FAILURE:' synthetic-diagnostics/multi-legacy-instrumentation.txt; then
    echo 'MULTI TEST ENVIRONMENT GATE RED: the emulator could not complete the external-browser migration handoff.' >&2
    exit 42
  fi
  echo 'MULTI HARNESS/UI GATE RED: UiAutomator failed before a valid four-snapshot export could be evaluated.' >&2
  exit 43
fi

found=0
for _ in $(seq 1 30); do
  if adb shell test -s /sdcard/Download/acelynn-session-report.json; then
    found=1
    break
  fi
  sleep 1
done
if [ "$found" -ne 1 ]; then
  echo 'MULTI LEGACY EXPORT GATE RED: no JSON backup appeared in /sdcard/Download/.' >&2
  exit 44
fi

adb pull /sdcard/Download/acelynn-session-report.json synthetic-diagnostics/multi-legacy-export.json
python3 - synthetic-diagnostics/multi-legacy-export.json <<'PY'
import json, sys
path = sys.argv[1]
payload = json.load(open(path, encoding='utf-8'))
assert payload.get('app') == 'Acelynn Pro', payload.get('app')
snapshots = payload.get('snapshots')
assert isinstance(snapshots, list) and len(snapshots) == 4, snapshots
expected_focus = ['Sub', 'Bass', 'Mids', 'Presence']
expected_dominant_index = [0, 1, 2, 3]
actual_focus = [snap.get('focus') for snap in snapshots]
assert actual_focus == expected_focus, (actual_focus, expected_focus)
for index, (snap, expected_band) in enumerate(zip(snapshots, expected_dominant_index)):
    assert snap.get('profile') == 'Balanced mix', (index, snap)
    assert snap.get('perspective') == 'mix', (index, snap)
    bands = snap.get('bands')
    assert isinstance(bands, list) and len(bands) == 5, (index, bands)
    dominant = max(range(len(bands)), key=lambda i: bands[i])
    assert dominant == expected_band, (index, bands, dominant, expected_band)
print('Multi-snapshot export is valid: 4 retained snapshots in exact Sub -> Bass -> Mids -> Presence insertion order.')
PY

before_hash="$(sha256sum synthetic-diagnostics/multi-legacy-export.json | awk '{print $1}')"
printf '%s\n' "$before_hash" > synthetic-diagnostics/multi-legacy-export.sha256

echo '=== Multi Phase 2: synthetic uninstall boundary ==='
adb uninstall com.cactusbyte.acelynnpro
if adb shell pm list packages | grep -Fq 'package:com.cactusbyte.acelynnpro'; then
  echo 'Legacy package still installed after synthetic uninstall.' >&2
  exit 45
fi
adb shell test -s /sdcard/Download/acelynn-session-report.json
adb pull /sdcard/Download/acelynn-session-report.json synthetic-diagnostics/multi-export-after-uninstall.json
after_hash="$(sha256sum synthetic-diagnostics/multi-export-after-uninstall.json | awk '{print $1}')"
test "$before_hash" = "$after_hash" || { echo 'Multi-snapshot backup changed across synthetic uninstall.' >&2; exit 46; }

echo '=== Multi Phase 3: certified permanent four-snapshot restore ==='
adb install "$PERMANENT_APK"
adb shell pm list packages | grep -Fq 'package:com.cactusbyte.acelynnpro'
set +e
adb shell am instrument -w -r \
  -e class com.cactusbyte.synthetictransition.AcelynnMultiSnapshotTest#testPermanentMultiSnapshotRestore \
  com.cactusbyte.synthetictransition.test/androidx.test.runner.AndroidJUnitRunner \
  | tee synthetic-diagnostics/multi-permanent-instrumentation.txt
permanent_instrument_rc=${PIPESTATUS[0]}
set -e

if [ "$permanent_instrument_rc" -ne 0 ] \
  || grep -Fq 'FAILURES!!!' synthetic-diagnostics/multi-permanent-instrumentation.txt \
  || grep -Fq 'INSTRUMENTATION_STATUS_CODE: -2' synthetic-diagnostics/multi-permanent-instrumentation.txt; then
  echo 'MULTI PERMANENT RESTORE GATE RED: the certified permanent APK did not restore all four snapshots and remain writable.' >&2
  exit 47
fi

echo 'ACELYNN MULTI-SNAPSHOT TRANSITION GATE GREEN.'
