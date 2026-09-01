#!/usr/bin/env python3
import argparse
import re
import subprocess
import sys
from pathlib import Path

BRANDS = (
    "cactusbyte",
    "noproblem",
    "machzero",
    "rapidtakeoff",
    "acelynnpro",
    "pocketstomp",
    "ghostlane",
    "firstbearing",
    "fantasy",
    "scouttrace",
    "shadownex",
    "terraflow",
    "orbitgather",
)
DISTRIBUTIONS = ("direct", "play")
INSTALL_PERMISSION = "android.permission.REQUEST_INSTALL_PACKAGES"
UA_MARKER = "CactusByteNative/1.0"


def fail(message: str) -> None:
    print(f"DISTRIBUTION SPLIT GATE FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def normalize_path(value: Path | str) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value).lower())


def find_variant_apk(apk_root: Path, brand: str, distribution: str) -> Path:
    expected_name = f"app-{brand}-{distribution}-release.apk"
    candidates = sorted(apk_root.rglob(expected_name))
    if len(candidates) != 1:
        fail(
            f"expected exactly one {brand}/{distribution} release APK named "
            f"{expected_name}, found {len(candidates)}"
        )
    return candidates[0]


def run_aapt2(aapt2: Path, args: list[str], apk: Path, label: str) -> str:
    proc = subprocess.run(
        [str(aapt2), "dump", *args, str(apk)],
        check=False,
        text=True,
        capture_output=True,
    )
    output = proc.stdout + "\n" + proc.stderr
    if proc.returncode != 0:
        fail(f"aapt2 {label} dump failed for {apk.name}: {output.strip()}")
    return output


def read_permissions(aapt2: Path, apk: Path) -> str:
    return run_aapt2(aapt2, ["permissions"], apk, "permission")


def read_manifest_tree(aapt2: Path, apk: Path) -> str:
    proc = subprocess.run(
        [str(aapt2), "dump", "xmltree", str(apk), "--file", "AndroidManifest.xml"],
        check=False,
        text=True,
        capture_output=True,
    )
    output = proc.stdout + "\n" + proc.stderr
    if proc.returncode != 0:
        fail(f"aapt2 manifest xmltree dump failed for {apk.name}: {output.strip()}")
    return output


def verify_not_debuggable(aapt2: Path, apk: Path) -> None:
    manifest = read_manifest_tree(aapt2, apk)
    debug_lines = [line.strip() for line in manifest.splitlines() if "android:debuggable" in line]
    if not debug_lines:
        return

    for line in debug_lines:
        lower = line.lower()
        if "0xffffffff" in lower or re.search(r"(?:=|\s)true(?:\s|$)", lower):
            fail(f"release APK is debuggable: {apk.name}: {line}")
        if "0x00000000" in lower or "0x0" in lower or re.search(r"(?:=|\s)false(?:\s|$)", lower):
            continue
        fail(f"could not prove android:debuggable=false for {apk.name}: {line}")


def find_build_config(build_config_root: Path, brand: str, distribution: str) -> Path:
    target = normalize_path(f"{brand}{distribution}Release")
    matches = []
    for path in build_config_root.rglob("BuildConfig.java"):
        if target in normalize_path(path):
            matches.append(path)
    if len(matches) != 1:
        fail(
            f"expected exactly one generated BuildConfig.java for "
            f"{brand}/{distribution} release, found {len(matches)}"
        )
    return matches[0]


def verify_channel(build_config: Path, expected: str) -> None:
    content = build_config.read_text(encoding="utf-8")
    pattern = re.compile(
        rf'public\s+static\s+final\s+String\s+CHANNEL\s*=\s*"{re.escape(expected)}"\s*;'
    )
    if not pattern.search(content):
        fail(f"{build_config} does not expose CHANNEL=\"{expected}\"")


def verify_ua(main_activity: Path) -> None:
    content = main_activity.read_text(encoding="utf-8")
    if UA_MARKER not in content:
        fail(f"native UA marker changed; expected {UA_MARKER}")
    if "CactusByteNative/2" in content:
        fail("UA v2 cutover detected during the locked 1.0 phase")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--aapt2", required=True)
    parser.add_argument("--apk-root", required=True)
    parser.add_argument("--build-config-root", required=True)
    parser.add_argument("--main-activity", required=True)
    args = parser.parse_args()

    aapt2 = Path(args.aapt2)
    apk_root = Path(args.apk_root)
    build_config_root = Path(args.build_config_root)
    main_activity = Path(args.main_activity)

    if not aapt2.is_file():
        fail(f"aapt2 not found: {aapt2}")
    if not apk_root.is_dir():
        fail(f"APK root not found: {apk_root}")
    if not build_config_root.is_dir():
        fail(f"generated BuildConfig root not found: {build_config_root}")
    if not main_activity.is_file():
        fail(f"MainActivity source not found: {main_activity}")

    verify_ua(main_activity)

    checked = 0
    for brand in BRANDS:
        for distribution in DISTRIBUTIONS:
            apk = find_variant_apk(apk_root, brand, distribution)
            permissions = read_permissions(aapt2, apk)
            has_install_permission = INSTALL_PERMISSION in permissions
            if distribution == "direct" and not has_install_permission:
                fail(f"direct APK missing {INSTALL_PERMISSION}: {apk.name}")
            if distribution == "play" and has_install_permission:
                fail(f"Play APK unexpectedly contains {INSTALL_PERMISSION}: {apk.name}")

            verify_not_debuggable(aapt2, apk)

            build_config = find_build_config(build_config_root, brand, distribution)
            verify_channel(build_config, distribution)

            checked += 1
            print(
                f"OK {brand}/{distribution}: permission={'present' if has_install_permission else 'absent'}, "
                f"CHANNEL={distribution}, debuggable=false"
            )

    if checked != 26:
        fail(f"expected 26 validated variants, checked {checked}")

    print(
        f"Verified {checked} brand × distribution release variants; "
        f"UA remains {UA_MARKER}; all release APKs are non-debuggable."
    )


if __name__ == "__main__":
    main()
