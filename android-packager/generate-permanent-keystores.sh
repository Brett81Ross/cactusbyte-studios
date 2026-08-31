#!/usr/bin/env bash
set -euo pipefail

# Generate the 13 permanent CactusByte Android signing identities.
# RUN THIS ONLY ON A TRUSTED LOCAL MACHINE. Do not run in CI.
# The script reads the canonical package IDs/aliases from signing-manifest.json
# so package identity cannot drift from the wrapper project.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/signing-manifest.json"
STAMP="$(date +%Y%m%d-%H%M%S)"
ROOT="${CACTUSBYTE_SIGNING_ROOT:-$HOME/CactusByte-signing-$STAMP}"
KEYSTORE_DIR="$ROOT/keystores"
CREDENTIALS="$ROOT/credentials.env"
FINGERPRINTS="$ROOT/fingerprints.txt"
GENERATED_MANIFEST="$ROOT/signing-manifest.generated.json"
BACKUP="$ROOT/cactusbyte-signing-backup-$STAMP.tar.gz.gpg"

for cmd in keytool openssl gpg python3 tar; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "Missing required command: $cmd" >&2; exit 1; }
done

[[ -f "$MANIFEST" ]] || { echo "Missing signing manifest: $MANIFEST" >&2; exit 1; }

umask 077
mkdir -p "$KEYSTORE_DIR"
: > "$CREDENTIALS"
: > "$FINGERPRINTS"
chmod 600 "$CREDENTIALS" "$FINGERPRINTS"

read -rsp "Backup encryption passphrase: " BACKUP_PASSPHRASE
echo
read -rsp "Confirm backup passphrase: " BACKUP_PASSPHRASE_CONFIRM
echo
[[ -n "$BACKUP_PASSPHRASE" ]] || { echo "Backup passphrase cannot be empty." >&2; exit 1; }
[[ "$BACKUP_PASSPHRASE" == "$BACKUP_PASSPHRASE_CONFIRM" ]] || { echo "Backup passphrases did not match." >&2; exit 1; }
unset BACKUP_PASSPHRASE_CONFIRM

mapfile -t APPS < <(python3 - "$MANIFEST" <<'PY'
import json, sys
p=sys.argv[1]
data=json.load(open(p, encoding="utf-8"))
apps=data.get("apps", [])
if len(apps) != 13:
    raise SystemExit(f"Expected 13 signing identities, found {len(apps)}")
for app in apps:
    print("\t".join([app["flavor"], app["packageId"], app.get("keyAlias") or app["packageId"]]))
PY
)

for row in "${APPS[@]}"; do
  IFS=$'\t' read -r flavor package_id alias <<< "$row"
  suffix="$(printf '%s' "$flavor" | tr '[:lower:]-' '[:upper:]_')"
  keystore="$KEYSTORE_DIR/$flavor.jks"

  [[ ! -e "$keystore" ]] || { echo "Refusing to overwrite existing keystore: $keystore" >&2; exit 1; }

  store_pass="$(openssl rand -hex 24)"
  key_pass="$(openssl rand -hex 24)"

  keytool -genkeypair \
    -keystore "$keystore" \
    -storetype JKS \
    -alias "$alias" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$store_pass" \
    -keypass "$key_pass" \
    -dname "CN=CactusByte Studios, OU=$flavor, O=CactusByte Studios, C=US" \
    -noprompt >/dev/null

  fingerprint="$(keytool -list -v -keystore "$keystore" -alias "$alias" -storepass "$store_pass" 2>/dev/null | awk '/SHA256:/{print toupper($2); exit}')"
  [[ -n "$fingerprint" ]] || { echo "Could not extract SHA-256 fingerprint for $package_id" >&2; exit 1; }

  printf '%s\t%s\t%s\n' "$flavor" "$package_id" "$fingerprint" >> "$FINGERPRINTS"
  {
    printf 'KEYSTORE_PASSWORD_%s=%q\n' "$suffix" "$store_pass"
    printf 'KEY_PASSWORD_%s=%q\n' "$suffix" "$key_pass"
    printf 'KEY_ALIAS_%s=%q\n' "$suffix" "$alias"
  } >> "$CREDENTIALS"

  echo "Generated permanent identity for $package_id"
done

python3 - "$MANIFEST" "$FINGERPRINTS" "$GENERATED_MANIFEST" <<'PY'
import json, sys
manifest_path, fp_path, out_path = sys.argv[1:]
data=json.load(open(manifest_path, encoding="utf-8"))
fps={}
for line in open(fp_path, encoding="utf-8"):
    flavor, package_id, fingerprint=line.rstrip("\n").split("\t")
    fps[package_id]=fingerprint
for app in data["apps"]:
    app["expectedSha256Fingerprint"]=fps[app["packageId"]]
data["status"]="PERMANENT_KEYS_STAGED"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
    f.write("\n")
PY
chmod 600 "$GENERATED_MANIFEST"

# Stream directly into GPG: no plaintext tarball is ever written.
# FD 3 carries the passphrase so it is not placed in process arguments and
# cannot accidentally become tar input.
exec 3<<<"$BACKUP_PASSPHRASE"
tar -C "$ROOT" -czf - keystores credentials.env fingerprints.txt signing-manifest.generated.json | \
  gpg --batch --yes --pinentry-mode loopback --passphrase-fd 3 \
      --symmetric --cipher-algo AES256 --output "$BACKUP"
exec 3<&-
unset BACKUP_PASSPHRASE
chmod 600 "$BACKUP"

cat <<EOF

Permanent signing identities generated locally.

Working directory: $ROOT
Generated manifest: $GENERATED_MANIFEST
Encrypted backup:   $BACKUP

NEXT:
1. Copy the encrypted backup to TWO independent locations; keep at least one offline.
2. Run android-packager/upload-signing-secrets.sh from this repo with:
   CACTUSBYTE_SIGNING_ROOT="$ROOT"
3. Copy signing-manifest.generated.json into android-packager/signing-manifest.json and commit only that JSON file.
4. Run the manual Android v2 Signing Gate. Only after it passes should manifest status become PERMANENT_KEYS_ACTIVE.

Never commit .jks files, credentials.env, base64 keystores, or the encrypted backup.
EOF
