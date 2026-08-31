#!/usr/bin/env bash
set -euo pipefail

# Upload locally generated permanent signing material to GitHub Actions Secrets.
# This script never prints secret values. It requires GitHub CLI authentication.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MANIFEST="$SCRIPT_DIR/signing-manifest.json"
ROOT="${CACTUSBYTE_SIGNING_ROOT:-}"
REPO="${CACTUSBYTE_GITHUB_REPO:-Brett81Ross/cactusbyte-studios}"

[[ -n "$ROOT" ]] || { echo "Set CACTUSBYTE_SIGNING_ROOT to the directory created by generate-permanent-keystores.sh" >&2; exit 1; }
[[ -d "$ROOT/keystores" ]] || { echo "Missing $ROOT/keystores" >&2; exit 1; }
[[ -f "$ROOT/credentials.env" ]] || { echo "Missing $ROOT/credentials.env" >&2; exit 1; }
[[ -f "$MANIFEST" ]] || { echo "Missing $MANIFEST" >&2; exit 1; }
command -v gh >/dev/null 2>&1 || { echo "GitHub CLI (gh) is required." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required." >&2; exit 1; }

gh auth status >/dev/null

# shellcheck disable=SC1090
source "$ROOT/credentials.env"

mapfile -t FLAVORS < <(python3 - "$MANIFEST" <<'PY'
import json, sys
data=json.load(open(sys.argv[1], encoding="utf-8"))
apps=data.get("apps", [])
if len(apps) != 13:
    raise SystemExit(f"Expected 13 signing identities, found {len(apps)}")
for app in apps:
    print(app["flavor"])
PY
)

for flavor in "${FLAVORS[@]}"; do
  suffix="$(printf '%s' "$flavor" | tr '[:lower:]-' '[:upper:]_')"
  keystore="$ROOT/keystores/$flavor.jks"
  [[ -f "$keystore" ]] || { echo "Missing keystore for $flavor" >&2; exit 1; }

  store_var="KEYSTORE_PASSWORD_$suffix"
  key_var="KEY_PASSWORD_$suffix"
  alias_var="KEY_ALIAS_$suffix"
  store_pass="${!store_var:-}"
  key_pass="${!key_var:-}"
  alias="${!alias_var:-}"
  [[ -n "$store_pass" && -n "$key_pass" && -n "$alias" ]] || { echo "Missing credentials for $flavor" >&2; exit 1; }

  keystore_b64="$(python3 - "$keystore" <<'PY'
import base64, pathlib, sys
print(base64.b64encode(pathlib.Path(sys.argv[1]).read_bytes()).decode("ascii"), end="")
PY
)"

  printf '%s' "$keystore_b64" | gh secret set "KEYSTORE_$suffix" --repo "$REPO"
  printf '%s' "$store_pass" | gh secret set "KEYSTORE_PASSWORD_$suffix" --repo "$REPO"
  printf '%s' "$key_pass" | gh secret set "KEY_PASSWORD_$suffix" --repo "$REPO"
  printf '%s' "$alias" | gh secret set "KEY_ALIAS_$suffix" --repo "$REPO"
  unset keystore_b64 store_pass key_pass alias

  echo "Uploaded signing secrets for $flavor"
done

echo
echo "Uploaded 52 signing secrets (4 per app) to $REPO."
echo "GitHub only exposes secret names after upload; the manual Android v2 Signing Gate will verify the actual keys by building and comparing certificate fingerprints."
