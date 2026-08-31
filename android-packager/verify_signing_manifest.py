#!/usr/bin/env python3
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "signing-manifest.json"
GRADLE = ROOT / "app" / "build.gradle.kts"
PACKAGE_RE = re.compile(r"^com\.cactusbyte\.[a-z0-9.]+$")
FINGERPRINT_RE = re.compile(r"^(?:[0-9A-F]{2}:){31}[0-9A-F]{2}$")
FLAVOR_LINE_RE = re.compile(r'^\s*create\("([a-z0-9]+)"\)\s*\{\s*$')
EXPECTED_APP_COUNT = 13
ACTIVE_STATUS = "PERMANENT_KEYS_ACTIVE"
STAGED_STATUS = "PERMANENT_KEYS_STAGED"


def fail(message: str) -> None:
    print(f"SIGNING GATE FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def gradle_brand_records() -> tuple[dict[str, str], int]:
    text = GRADLE.read_text(encoding="utf-8")
    version_match = re.search(r"\bversionCode\s*=\s*(\d+)", text)
    if not version_match:
        fail("could not read versionCode from app/build.gradle.kts")
    version_code = int(version_match.group(1))

    lines = text.splitlines()
    records: dict[str, str] = {}
    for i, line in enumerate(lines):
        match = FLAVOR_LINE_RE.match(line)
        if not match:
            continue
        flavor = match.group(1)
        chunk = "\n".join(lines[i : i + 12])
        app_id = re.search(r'applicationId\s*=\s*"([^"]+)"', chunk)
        if app_id:
            records[flavor] = chunk
    return records, version_code


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--allow-staged",
        action="store_true",
        help="Allow PERMANENT_KEYS_STAGED while validating real fingerprints before activation.",
    )
    args = parser.parse_args()

    data = json.loads(MANIFEST.read_text(encoding="utf-8"))
    apps = data.get("apps")
    if not isinstance(apps, list) or len(apps) != EXPECTED_APP_COUNT:
        fail(f"expected exactly {EXPECTED_APP_COUNT} apps")

    gradle_records, gradle_version_code = gradle_brand_records()
    if len(gradle_records) != EXPECTED_APP_COUNT:
        fail(f"expected exactly {EXPECTED_APP_COUNT} Gradle brand flavors, found {len(gradle_records)}")

    packages = set()
    flavors = set()
    pending = []

    for app in apps:
        package_id = app.get("packageId", "")
        flavor = app.get("flavor", "")
        fingerprint = app.get("expectedSha256Fingerprint")
        key_alias = app.get("keyAlias")
        vercel_url = app.get("vercelUrl", "")
        current_version_code = app.get("currentVersionCode")

        if not PACKAGE_RE.fullmatch(package_id):
            fail(f"invalid package id: {package_id!r}")
        if package_id in packages:
            fail(f"duplicate package id: {package_id}")
        packages.add(package_id)

        if not flavor or flavor in flavors:
            fail(f"invalid or duplicate flavor: {flavor!r}")
        flavors.add(flavor)

        chunk = gradle_records.get(flavor)
        if chunk is None:
            fail(f"manifest flavor {flavor!r} does not exist in Gradle")
        if f'applicationId = "{package_id}"' not in chunk:
            fail(f"Gradle applicationId does not match manifest for {flavor}")
        expected_url_literal = f'buildConfigField("String", "START_URL", "\\\"{vercel_url}\\\"")'
        if expected_url_literal not in chunk:
            fail(f"Gradle START_URL does not match signing manifest for {flavor}: {vercel_url}")
        if current_version_code != gradle_version_code:
            fail(
                f"versionCode mismatch for {flavor}: manifest {current_version_code}, Gradle {gradle_version_code}"
            )

        if key_alias != package_id:
            fail(f"key alias must equal package id for {package_id}")

        if fingerprint is None:
            pending.append(package_id)
        elif not FINGERPRINT_RE.fullmatch(str(fingerprint).upper()):
            fail(f"invalid SHA-256 fingerprint format for {package_id}")

    if set(gradle_records) != flavors:
        missing = sorted(set(gradle_records) - flavors)
        extra = sorted(flavors - set(gradle_records))
        fail(f"Gradle/manifest flavor set mismatch; missing={missing}, extra={extra}")

    if pending:
        fail(
            "permanent signing fingerprints are still pending for: "
            + ", ".join(sorted(pending))
        )

    status = data.get("status")
    allowed = {ACTIVE_STATUS, STAGED_STATUS} if args.allow_staged else {ACTIVE_STATUS}
    if status not in allowed:
        expected = " or ".join(sorted(allowed))
        fail(f"manifest status must be {expected}")

    print(
        f"Signing manifest verified for {len(apps)} permanent package identities "
        f"against Gradle versionCode {gradle_version_code} ({status})."
    )


if __name__ == "__main__":
    main()
