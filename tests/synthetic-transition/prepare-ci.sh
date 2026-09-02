#!/usr/bin/env bash
set -euo pipefail

: "${RUNNER_TEMP:?}"
: "${GITHUB_ENV:?}"
: "${GITHUB_REPOSITORY:?}"
: "${GH_TOKEN:?}"
: "${PERMANENT_ARTIFACT_ID:?}"
: "${CERTIFIED_ARTIFACT_NAME:?}"
: "${CERTIFIED_SIGNING_RUN_ID:?}"
: "${CERTIFIED_FOUNDATION_SHA:?}"

python3 -m pip install --disable-pip-version-check pillow cairosvg

echo '=== Build external UiAutomator harness ==='
gradle -p tests/synthetic-transition assembleDebug assembleDebugAndroidTest --stacktrace
mapfile -t app_apks < <(find tests/synthetic-transition/build/outputs/apk -type f -name '*.apk' ! -path '*/androidTest/*' | sort)
mapfile -t test_apks < <(find tests/synthetic-transition/build/outputs/apk -type f -name '*.apk' -path '*/androidTest/*' | sort)
test "${#app_apks[@]}" -eq 1
test "${#test_apks[@]}" -eq 1
HARNESS_APK="$(realpath "${app_apks[0]}")"
HARNESS_TEST_APK="$(realpath "${test_apks[0]}")"

echo '=== Build exact legacy Acelynn baseline ==='
python3 legacy-source/android-packager/fetch_icons.py
gradle -p legacy-source/android-packager :app:assembleAcelynnproDebug --stacktrace
mapfile -t legacy_apks < <(find legacy-source/android-packager/app/build/outputs/apk -type f -iname '*acelynnpro*debug*.apk' | sort)
test "${#legacy_apks[@]}" -eq 1
LEGACY_APK="$(realpath "${legacy_apks[0]}")"

echo '=== Download exact certified signing artifact ==='
mkdir -p "$RUNNER_TEMP/permanent-artifact" "$RUNNER_TEMP/signed-apks"
meta="$RUNNER_TEMP/permanent-artifact/metadata.json"
gh api "repos/${GITHUB_REPOSITORY}/actions/artifacts/${PERMANENT_ARTIFACT_ID}" > "$meta"
python3 - "$meta" "$PERMANENT_ARTIFACT_ID" "$CERTIFIED_ARTIFACT_NAME" "$CERTIFIED_SIGNING_RUN_ID" "$CERTIFIED_FOUNDATION_SHA" <<'PY'
import json, sys
path, expected_id, expected_name, expected_run, expected_sha = sys.argv[1:]
data = json.load(open(path, encoding='utf-8'))
assert str(data.get('id')) == expected_id, (data.get('id'), expected_id)
assert data.get('name') == expected_name, (data.get('name'), expected_name)
assert not data.get('expired'), 'Certified signing artifact has expired.'
run = data.get('workflow_run') or {}
assert str(run.get('id')) == expected_run, (run.get('id'), expected_run)
assert run.get('head_sha') == expected_sha, (run.get('head_sha'), expected_sha)
print('Certified artifact metadata matches the protected signing run and foundation SHA.')
PY
gh api "repos/${GITHUB_REPOSITORY}/actions/artifacts/${PERMANENT_ARTIFACT_ID}/zip" > "$RUNNER_TEMP/permanent-artifact/artifact.zip"
unzip -q "$RUNNER_TEMP/permanent-artifact/artifact.zip" -d "$RUNNER_TEMP/signed-apks"

APKSIGNER="$(find "$ANDROID_HOME/build-tools" -type f -name apksigner | sort -V | tail -1)"
AAPT="$(find "$ANDROID_HOME/build-tools" -type f -name aapt | sort -V | tail -1)"
test -x "$APKSIGNER"
test -x "$AAPT"

mapfile -t permanent_candidates < <(find "$RUNNER_TEMP/signed-apks" -type f -iname '*.apk' | grep -Ei 'acelynnpro.*direct.*release|acelynnpro-direct-release' | sort)
printf 'Acelynn Direct candidates:\n%s\n' "${permanent_candidates[*]}"
test "${#permanent_candidates[@]}" -eq 1
PERMANENT_APK="$(realpath "${permanent_candidates[0]}")"

extract_cert_digest() {
  sed -nE 's/^.*certificate SHA-256 digest: ([0-9a-fA-F]+)$/\1/p' "$1" | head -1 | tr '[:lower:]' '[:upper:]'
}

expected="$(python3 - <<'PY'
import json
data=json.load(open('android-packager/signing-manifest.json',encoding='utf-8'))
app=next(x for x in data['apps'] if x['flavor']=='acelynnpro')
print(app['expectedSha256Fingerprint'].replace(':','').upper())
PY
)"

"$APKSIGNER" verify --verbose --print-certs "$PERMANENT_APK" > "$RUNNER_TEMP/permanent-signature.txt"
cat "$RUNNER_TEMP/permanent-signature.txt"
actual="$(extract_cert_digest "$RUNNER_TEMP/permanent-signature.txt")"
test -n "$actual"
test "$actual" = "$expected" || { echo "Permanent certificate mismatch: expected $expected got $actual" >&2; exit 1; }
"$AAPT" dump badging "$PERMANENT_APK" > "$RUNNER_TEMP/permanent-badging.txt"
grep -Fq "package: name='com.cactusbyte.acelynnpro'" "$RUNNER_TEMP/permanent-badging.txt"
! grep -Fq 'application-debuggable' "$RUNNER_TEMP/permanent-badging.txt"
unzip -p "$PERMANENT_APK" assets/index.html > "$RUNNER_TEMP/permanent-index.html"
unzip -p "$PERMANENT_APK" assets/acelynn-recovery.js > "$RUNNER_TEMP/permanent-recovery.js"
cmp android-packager/app/src/acelynnproDirect/assets/index.html "$RUNNER_TEMP/permanent-index.html"
cmp android-packager/app/src/acelynnproDirect/assets/acelynn-recovery.js "$RUNNER_TEMP/permanent-recovery.js"

echo '=== Verify legacy signer boundary ==='
"$AAPT" dump badging "$LEGACY_APK" > "$RUNNER_TEMP/legacy-badging.txt"
grep -Fq "package: name='com.cactusbyte.acelynnpro'" "$RUNNER_TEMP/legacy-badging.txt"
"$APKSIGNER" verify --verbose --print-certs "$LEGACY_APK" > "$RUNNER_TEMP/legacy-signature.txt"
cat "$RUNNER_TEMP/legacy-signature.txt"
legacy_digest="$(extract_cert_digest "$RUNNER_TEMP/legacy-signature.txt")"
permanent_digest="$(extract_cert_digest "$RUNNER_TEMP/permanent-signature.txt")"
test -n "$legacy_digest"
test -n "$permanent_digest"
test "$legacy_digest" != "$permanent_digest" || { echo 'Legacy and permanent signers unexpectedly match.' >&2; exit 1; }
grep -Eq 'certificate DN: .*CN=Android Debug' "$RUNNER_TEMP/legacy-signature.txt"

echo '=== Generate deterministic WAV ==='
mkdir -p "$RUNNER_TEMP/fixture"
python3 tests/fixtures/generate-check-wav.py "$RUNNER_TEMP/fixture/check.wav" | tee "$RUNNER_TEMP/fixture/manifest.txt"
sha256sum "$RUNNER_TEMP/fixture/check.wav" | tee -a "$RUNNER_TEMP/fixture/manifest.txt"
FIXTURE_WAV="$RUNNER_TEMP/fixture/check.wav"

{
  echo "HARNESS_APK=$HARNESS_APK"
  echo "HARNESS_TEST_APK=$HARNESS_TEST_APK"
  echo "LEGACY_APK=$LEGACY_APK"
  echo "PERMANENT_APK=$PERMANENT_APK"
  echo "FIXTURE_WAV=$FIXTURE_WAV"
  echo "APKSIGNER=$APKSIGNER"
  echo "AAPT=$AAPT"
} >> "$GITHUB_ENV"

echo 'Synthetic test inputs are built, pinned, signature-verified, and ready.'
