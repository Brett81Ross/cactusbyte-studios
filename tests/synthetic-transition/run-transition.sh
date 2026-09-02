#!/usr/bin/env bash
set -euo pipefail

: "${HARNESS_APK:?}"
: "${HARNESS_TEST_APK:?}"
: "${LEGACY_APK:?}"
: "${PERMANENT_APK:?}"
: "${FIXTURE_WAV:?}"

mkdir -p synthetic-diagnostics

cleanup() {
  set +e
  adb logcat -d > synthetic-diagnostics/logcat.txt
  adb shell uiautomator dump /sdcard/window-final.xml >/dev/null 2>&1
  adb pull /sdcard/window-final.xml synthetic-diagnostics/window-final.xml >/dev/null 2>&1
  adb pull /sdcard/Android/data/com.cactusbyte.synthetictransition/files/diagnostics synthetic-diagnostics/harness >/dev/null 2>&1
  adb shell ls -la /sdcard/Download > synthetic-diagnostics/downloads-listing.txt 2>&1
  adb shell content query --uri content://media/external/audio/media --projection _display_name > synthetic-diagnostics/media-audio-index.txt 2>&1
  adb shell content query --uri content://media/external_primary/downloads --projection _display_name:_size:mime_type:relative_path > synthetic-diagnostics/media-downloads-index.txt 2>&1
  set -e
}
trap cleanup EXIT

adb wait-for-device
adb install -r "$HARNESS_APK"
adb install -r "$HARNESS_TEST_APK"
adb install -r "$LEGACY_APK"

echo '=== Harness precondition: seed deterministic WAV and index it as audio ==='
adb shell rm -f /sdcard/Download/check.wav || true
adb push "$FIXTURE_WAV" /sdcard/Download/check.wav
adb shell test -s /sdcard/Download/check.wav || {
  echo 'HARNESS PRECONDITION RED: check.wav was not copied to shared storage.' >&2
  exit 10
}

adb shell am broadcast \
  -a android.intent.action.MEDIA_SCANNER_SCAN_FILE \
  -d file:///sdcard/Download/check.wav \
  | tee synthetic-diagnostics/media-scan-broadcast.txt

indexed=0
for _ in $(seq 1 20); do
  if adb shell content query --uri content://media/external/audio/media --projection _display_name 2>/dev/null | grep -Fq 'check.wav'; then
    indexed=1
    break
  fi
  sleep 1
done
if [ "$indexed" -ne 1 ]; then
  echo 'HARNESS PRECONDITION RED: check.wav exists but Android did not index it as audio.' >&2
  exit 10
fi
echo 'Harness media precondition GREEN: check.wav is physical and indexed in MediaStore Audio.'

echo '=== Phase 1: legacy real-user export ==='
set +e
adb shell am instrument -w -r \
  -e class com.cactusbyte.synthetictransition.AcelynnTransitionTest#testLegacyExport \
  com.cactusbyte.synthetictransition.test/androidx.test.runner.AndroidJUnitRunner \
  | tee synthetic-diagnostics/legacy-instrumentation.txt
legacy_instrument_rc=${PIPESTATUS[0]}
set -e

if [ "$legacy_instrument_rc" -ne 0 ] \
  || grep -Fq 'FAILURES!!!' synthetic-diagnostics/legacy-instrumentation.txt \
  || grep -Fq 'INSTRUMENTATION_STATUS_CODE: -2' synthetic-diagnostics/legacy-instrumentation.txt; then
  if grep -Fq 'LEGACY_BRIDGE_FAILURE:' synthetic-diagnostics/legacy-instrumentation.txt; then
    echo 'LEGACY BRIDGE GATE RED: the literal legacy app did not reach the HTTPS migration handoff.' >&2
    exit 20
  fi
  if grep -Fq 'LEGACY_BROWSER_FAILURE:' synthetic-diagnostics/legacy-instrumentation.txt; then
    echo 'TEST ENVIRONMENT GATE RED: the emulator could not complete the external-browser migration handoff.' >&2
    exit 12
  fi
  echo 'HARNESS/UI GATE RED: UiAutomator failed before a valid legacy-export result could be evaluated. This is not classified as an Acelynn Export failure.' >&2
  exit 11
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
  echo 'LEGACY EXPORT GATE RED: the real migration page was exercised but no JSON backup appeared in /sdcard/Download/.' >&2
  exit 21
fi

adb pull /sdcard/Download/acelynn-session-report.json synthetic-diagnostics/legacy-export.json
python3 - synthetic-diagnostics/legacy-export.json <<'PY'
import json, sys
path=sys.argv[1]
payload=json.load(open(path,encoding='utf-8'))
assert payload.get('app') == 'Acelynn Pro', payload.get('app')
snapshots=payload.get('snapshots')
assert isinstance(snapshots,list) and len(snapshots) == 1, snapshots
snap=snapshots[0]
assert snap.get('profile') == 'Balanced mix', snap
assert snap.get('focus') == 'Mids', snap
assert isinstance(snap.get('bands'),list) and len(snap['bands']) == 5, snap
print('Legacy export JSON is valid and contains the expected real UI-created snapshot.')
PY
before_hash="$(sha256sum synthetic-diagnostics/legacy-export.json | awk '{print $1}')"
printf '%s\n' "$before_hash" > synthetic-diagnostics/legacy-export.sha256

echo '=== Phase 2: uninstall boundary ==='
adb uninstall com.cactusbyte.acelynnpro
if adb shell pm list packages | grep -Fq 'package:com.cactusbyte.acelynnpro'; then
  echo 'Legacy package still installed after uninstall.' >&2
  exit 22
fi
adb shell test -s /sdcard/Download/acelynn-session-report.json
adb pull /sdcard/Download/acelynn-session-report.json synthetic-diagnostics/legacy-export-after-uninstall.json
after_hash="$(sha256sum synthetic-diagnostics/legacy-export-after-uninstall.json | awk '{print $1}')"
test "$before_hash" = "$after_hash" || { echo 'Backup changed across uninstall.' >&2; exit 23; }

echo '=== Phase 3: certified permanent restore ==='
adb install "$PERMANENT_APK"
adb shell pm list packages | grep -Fq 'package:com.cactusbyte.acelynnpro'
set +e
adb shell am instrument -w -r \
  -e class com.cactusbyte.synthetictransition.AcelynnTransitionTest#testPermanentRestore \
  com.cactusbyte.synthetictransition.test/androidx.test.runner.AndroidJUnitRunner \
  | tee synthetic-diagnostics/permanent-instrumentation.txt
permanent_instrument_rc=${PIPESTATUS[0]}
set -e

if [ "$permanent_instrument_rc" -ne 0 ] \
  || grep -Fq 'FAILURES!!!' synthetic-diagnostics/permanent-instrumentation.txt \
  || grep -Fq 'INSTRUMENTATION_STATUS_CODE: -2' synthetic-diagnostics/permanent-instrumentation.txt; then
  echo 'PERMANENT RESTORE GATE RED: the certified permanent APK did not complete the expected restore flow on the emulator.' >&2
  exit 31
fi

echo 'ACELYNN SYNTHETIC TRANSITION GATE GREEN.'
