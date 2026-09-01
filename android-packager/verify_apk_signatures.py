#!/usr/bin/env python3
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
MANIFEST = ROOT / "signing-manifest.json"
DISTRIBUTIONS = ("direct", "play")
CERT_SHA256_RE = re.compile(
    r"certificate\s+SHA-?256\s+digest\s*:\s*(.+)$",
    re.IGNORECASE,
)


def fail(message: str) -> None:
    print(f"APK SIGNATURE GATE FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def normalize_fingerprint(value: str) -> str:
    return re.sub(r"[^0-9A-Fa-f]", "", value).upper()


def signer_sha256_digests(output: str) -> set[str]:
    digests: set[str] = set()
    for line in output.splitlines():
        match = CERT_SHA256_RE.search(line.strip())
        if not match:
            continue
        digest = normalize_fingerprint(match.group(1))
        if len(digest) != 64:
            fail(
                "apksigner returned a certificate SHA-256 digest with an invalid "
                f"length ({len(digest)} hex chars)"
            )
        digests.add(digest)
    return digests


def find_variant_apk(apk_root: Path, flavor: str, distribution: str) -> Path:
    expected_name = f"app-{flavor}-{distribution}-release.apk"
    candidates = sorted(apk_root.rglob(expected_name))
    if len(candidates) != 1:
        fail(
            f"expected exactly one release APK for {flavor}/{distribution}, found "
            f"{len(candidates)} matching {expected_name}"
        )
    return candidates[0]


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
        fail(f"expected 13 signing identities, found {len(apps)}")

    checked = 0
    for app in apps:
        flavor = app["flavor"]
        package_id = app["packageId"]
        expected = app.get("expectedSha256Fingerprint")
        if not expected:
            fail(f"missing expected fingerprint for {package_id}")

        expected_norm = normalize_fingerprint(str(expected))
        if len(expected_norm) != 64:
            fail(
                f"manifest fingerprint for {package_id} is not a 64-hex SHA-256 digest"
            )

        for distribution in DISTRIBUTIONS:
            apk = find_variant_apk(apk_root, flavor, distribution)

            proc = subprocess.run(
                [str(apksigner), "verify", "--verbose", "--print-certs", str(apk)],
                check=False,
                text=True,
                capture_output=True,
            )
            output = proc.stdout + "\n" + proc.stderr
            if proc.returncode != 0:
                fail(f"apksigner verification failed for {apk.name}: {output.strip()}")

            digests = signer_sha256_digests(output)
            if not digests:
                fail(
                    f"could not read a signer certificate SHA-256 digest from {apk.name}; "
                    "apksigner output format was not recognized"
                )
            if len(digests) != 1:
                fail(
                    f"expected exactly one distinct signer certificate for {apk.name}, "
                    f"found {len(digests)}"
                )

            actual_norm = next(iter(digests))
            if actual_norm != expected_norm:
                fail(
                    f"certificate mismatch for {package_id} ({distribution}): "
                    f"expected {expected_norm}, got {actual_norm}"
                )

            checked += 1
            print(
                f"OK {flavor}/{distribution}: {package_id} certificate {expected}"
            )

    if checked != 26:
        fail(f"expected 26 signed APK variants, verified {checked}")

    print(
        "Verified 26 APK signatures against the 13 permanent signing identities; "
        "direct and Play share the same locked key per brand."
    )


if __name__ == "__main__":
    main()
