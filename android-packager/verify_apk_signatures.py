#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "signing-manifest.json"
DIGEST_RE = re.compile(r"Signer #1 certificate SHA-256 digest:\s*([0-9a-fA-F]+)")


def fail(message: str) -> None:
    print(f"APK SIGNATURE GATE FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def normalize_fingerprint(value: str) -> str:
    return re.sub(r"[^0-9A-Fa-f]", "", value).upper()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apksigner", required=True)
    parser.add_argument("--apk-root", required=True)
    args = parser.parse_args()

    apksigner = Path(args.apksigner)
    apk_root = Path(args.apk_root)
    if not apksigner.is_file():
        fail(f"apksigner not found: {apksigner}")
    if not apk_root.is_dir():
        fail(f"APK root not found: {apk_root}")

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    apps = data.get("apps", [])
    if len(apps) != 13:
        fail(f"expected 13 apps, found {len(apps)}")

    checked = 0
    for app in apps:
        flavor = app["flavor"]
        package_id = app["packageId"]
        expected = app.get("expectedSha256Fingerprint")
        if not expected:
            fail(f"missing expected fingerprint for {package_id}")

        release_dir = apk_root / flavor / "release"
        candidates = sorted(release_dir.glob("*.apk"))
        if len(candidates) != 1:
            fail(f"expected exactly one release APK for {flavor}, found {len(candidates)} in {release_dir}")
        apk = candidates[0]

        proc = subprocess.run(
            [str(apksigner), "verify", "--verbose", "--print-certs", str(apk)],
            check=False,
            text=True,
            capture_output=True,
        )
        output = proc.stdout + "\n" + proc.stderr
        if proc.returncode != 0:
            fail(f"apksigner verification failed for {apk.name}: {output.strip()}")

        match = DIGEST_RE.search(output)
        if not match:
            fail(f"could not read signer SHA-256 digest from {apk.name}")

        actual_norm = normalize_fingerprint(match.group(1))
        expected_norm = normalize_fingerprint(str(expected))
        if actual_norm != expected_norm:
            fail(
                f"certificate mismatch for {package_id}: expected {expected_norm}, got {actual_norm}"
            )

        checked += 1
        print(f"OK {flavor}: {package_id} certificate {expected}")

    print(f"Verified {checked} APK signatures against the permanent signing manifest.")


if __name__ == "__main__":
    main()
