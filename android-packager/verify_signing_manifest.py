#!/usr/bin/env python3
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "signing-manifest.json"
PACKAGE_RE = re.compile(r"^com\.cactusbyte\.[a-z0-9.]+$")
FINGERPRINT_RE = re.compile(r"^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$")
EXPECTED_APP_COUNT = 13


def fail(message: str) -> None:
    print(f"SIGNING GATE FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def main() -> None:
    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    apps = data.get("apps")
    if not isinstance(apps, list) or len(apps) != EXPECTED_APP_COUNT:
        fail(f"expected exactly {EXPECTED_APP_COUNT} apps")

    packages = set()
    flavors = set()
    pending = []

    for app in apps:
        package_id = app.get("packageId", "")
        flavor = app.get("flavor", "")
        fingerprint = app.get("expectedSha256Fingerprint")

        if not PACKAGE_RE.fullmatch(package_id):
            fail(f"invalid package id: {package_id!r}")
        if package_id in packages:
            fail(f"duplicate package id: {package_id}")
        packages.add(package_id)

        if not flavor or flavor in flavors:
            fail(f"invalid or duplicate flavor: {flavor!r}")
        flavors.add(flavor)

        if fingerprint is None:
            pending.append(package_id)
        elif not FINGERPRINT_RE.fullmatch(str(fingerprint).upper()):
            fail(f"invalid SHA-256 fingerprint format for {package_id}")

    if pending:
        fail(
            "permanent signing fingerprints are still pending for: "
            + ", ".join(sorted(pending))
        )

    if data.get("status") != "PERMANENT_KEYS_ACTIVE":
        fail("manifest status must be PERMANENT_KEYS_ACTIVE before release")

    print(f"Signing manifest verified for {len(apps)} permanent package identities.")


if __name__ == "__main__":
    main()
