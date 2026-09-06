#!/usr/bin/env python3
"""Emulator-only Acelynn Pro permanent-signing transition proof.

This deliberately uses a synthetic legacy signer. It proves Android rejects the
cross-certificate in-place update, an off-app recovery file survives the
required emulator uninstall, and the permanent Direct APK exposes and completes
the certified recovery flow. It never touches a physical device or production
user data.
"""

from __future__ import annotations

import os
import re
import subprocess
import sys
import tempfile
import time
import xml.etree.ElementTree as ET
from pathlib import Path

PACKAGE = "com.cactusbyte.acelynnpro"
ACTIVITY = "com.cactusbyte.wrapper.MainActivity"
GOOD_NAME = "acelynn-transition-backup.json"
BAD_NAME = "acelynn-transition-wrong-app.json"
REMOTE_DIR = "/sdcard/Download"


def sh(cmd: list[str], check: bool = True, capture: bool = False) -> subprocess.CompletedProcess[str]:
    print("+", " ".join(cmd), flush=True)
    return subprocess.run(
        cmd,
        check=check,
        text=True,
        stdout=subprocess.PIPE if capture else None,
        stderr=subprocess.STDOUT if capture else None,
    )


def adb(*args: str, check: bool = True, capture: bool = False) -> subprocess.CompletedProcess[str]:
    return sh(["adb", *args], check=check, capture=capture)


def bounds_center(value: str) -> tuple[int, int]:
    match = re.fullmatch(r"\[(\d+),(\d+)\]\[(\d+),(\d+)\]", value or "")
    if not match:
        raise RuntimeError(f"Invalid UI bounds: {value!r}")
    x1, y1, x2, y2 = map(int, match.groups())
    return ((x1 + x2) // 2, (y1 + y2) // 2)


def dump_ui() -> tuple[list[ET.Element], str]:
    remote = "/sdcard/acelynn-phase8-window.xml"
    local = Path(tempfile.gettempdir()) / "acelynn-phase8-window.xml"
    adb("shell", "uiautomator", "dump", remote, check=False, capture=True)
    pulled = adb("pull", remote, str(local), check=False, capture=True)
    if pulled.returncode != 0 or not local.exists():
        raise RuntimeError(f"Could not retrieve UI hierarchy: {pulled.stdout or ''}")
    raw = local.read_text(encoding="utf-8", errors="replace")
    root = ET.fromstring(raw)
    return list(root.iter("node")), raw


def node_label(node: ET.Element) -> str:
    text = node.attrib.get("text", "").strip()
    desc = node.attrib.get("content-desc", "").strip()
    return text or desc


def find_node(needle: str, *, contains: bool = True) -> ET.Element | None:
    nodes, _ = dump_ui()
    lower = needle.casefold()
    for node in nodes:
        label = node_label(node)
        if not label:
            continue
        candidate = label.casefold()
        if (contains and lower in candidate) or (not contains and lower == candidate):
            return node
    return None


def wait_node(needle: str, timeout: float = 20.0, *, contains: bool = True) -> ET.Element:
    deadline = time.time() + timeout
    last = ""
    while time.time() < deadline:
        try:
            nodes, raw = dump_ui()
            last = raw
            lower = needle.casefold()
            for node in nodes:
                label = node_label(node)
                if not label:
                    continue
                candidate = label.casefold()
                if (contains and lower in candidate) or (not contains and lower == candidate):
                    return node
        except Exception as exc:  # UI may be between activities.
            last = str(exc)
        time.sleep(1)
    print("Last UI hierarchy / error:", last, file=sys.stderr)
    raise RuntimeError(f"Timed out waiting for UI text: {needle!r}")


def tap_node(node: ET.Element) -> None:
    x, y = bounds_center(node.attrib.get("bounds", ""))
    adb("shell", "input", "tap", str(x), str(y))
    time.sleep(1)


def tap_text(needle: str, timeout: float = 20.0, *, contains: bool = True) -> None:
    tap_node(wait_node(needle, timeout, contains=contains))


def swipe_up() -> None:
    size = adb("shell", "wm", "size", capture=True).stdout or ""
    match = re.search(r"(\d+)x(\d+)", size)
    width, height = (1080, 1920) if not match else (int(match.group(1)), int(match.group(2)))
    x = width // 2
    adb("shell", "input", "swipe", str(x), str(int(height * 0.78)), str(x), str(int(height * 0.28)), "350")
    time.sleep(0.8)


def find_with_scroll(needle: str, attempts: int = 8) -> ET.Element:
    for _ in range(attempts):
        node = find_node(needle)
        if node is not None:
            return node
        swipe_up()
    raise RuntimeError(f"Could not find {needle!r} after scrolling")


def open_file_from_picker(filename: str) -> None:
    # Android may first show a resolver. Prefer the requested file if already in
    # DocumentsUI, otherwise choose Files, then navigate to Downloads.
    deadline = time.time() + 25
    opened_downloads = False
    while time.time() < deadline:
        node = find_node(filename, contains=False)
        if node is not None:
            tap_node(node)
            return

        files = find_node("Files", contains=False)
        if files is not None:
            tap_node(files)
            time.sleep(1)
            continue

        if not opened_downloads:
            downloads = find_node("Downloads", contains=False)
            if downloads is not None:
                tap_node(downloads)
                opened_downloads = True
                time.sleep(1)
                continue

            roots = find_node("Show roots") or find_node("Navigate up")
            if roots is not None:
                tap_node(roots)
                time.sleep(1)
                continue

        swipe_up()
    nodes, raw = dump_ui()
    print(raw, file=sys.stderr)
    print("Visible labels:", [node_label(n) for n in nodes if node_label(n)], file=sys.stderr)
    raise RuntimeError(f"File picker could not locate {filename}")


def restore_fixture(filename: str) -> None:
    button = find_with_scroll("Restore / merge backup")
    tap_node(button)
    open_file_from_picker(filename)
    time.sleep(2)


def main() -> int:
    legacy_apk = Path(os.environ["ACELYNN_SYNTHETIC_LEGACY_APK"]).resolve()
    permanent_apk = Path(os.environ["ACELYNN_PERMANENT_APK"]).resolve()
    good_fixture = Path(os.environ.get("ACELYNN_GOOD_FIXTURE", "android-packager/fixtures/acelynn-transition-backup.json")).resolve()
    bad_fixture = Path(os.environ.get("ACELYNN_BAD_FIXTURE", "android-packager/fixtures/acelynn-transition-wrong-app.json")).resolve()
    for path in (legacy_apk, permanent_apk, good_fixture, bad_fixture):
        if not path.is_file():
            raise FileNotFoundError(path)

    adb("wait-for-device")
    adb("shell", "getprop", "ro.build.version.sdk")
    adb("shell", "mkdir", "-p", REMOTE_DIR)
    adb("push", str(good_fixture), f"{REMOTE_DIR}/{GOOD_NAME}")
    adb("push", str(bad_fixture), f"{REMOTE_DIR}/{BAD_NAME}")
    adb("shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", f"file://{REMOTE_DIR}/{GOOD_NAME}", check=False)
    adb("shell", "am", "broadcast", "-a", "android.intent.action.MEDIA_SCANNER_SCAN_FILE", "-d", f"file://{REMOTE_DIR}/{BAD_NAME}", check=False)

    print("\n[1/7] Install synthetic legacy-signed Acelynn package")
    adb("install", "-r", str(legacy_apk))
    package_path = adb("shell", "pm", "path", PACKAGE, capture=True).stdout or ""
    if "package:" not in package_path:
        raise RuntimeError("Synthetic legacy package did not install")

    print("\n[2/7] Prove Android rejects cross-certificate in-place update")
    replacement = adb("install", "-r", str(permanent_apk), check=False, capture=True)
    print(replacement.stdout or "")
    if replacement.returncode == 0:
        raise RuntimeError("Permanent APK unexpectedly replaced the synthetic legacy signer in place")
    if "INSTALL_FAILED_UPDATE_INCOMPATIBLE" not in (replacement.stdout or ""):
        raise RuntimeError("Signer transition failed for an unexpected reason")
    still_installed = adb("shell", "pm", "path", PACKAGE, capture=True).stdout or ""
    if "package:" not in still_installed:
        raise RuntimeError("Rejected update removed the legacy package")

    print("\n[3/7] Emulator-only uninstall after off-app backups exist")
    adb("uninstall", PACKAGE)
    for filename in (GOOD_NAME, BAD_NAME):
        survived = adb("shell", "test", "-f", f"{REMOTE_DIR}/{filename}", check=False)
        if survived.returncode != 0:
            raise RuntimeError(f"Off-app recovery fixture did not survive uninstall: {filename}")

    print("\n[4/7] Install permanent-signed Acelynn Direct APK")
    adb("install", str(permanent_apk))
    adb("shell", "am", "start", "-W", "-n", f"{PACKAGE}/{ACTIVITY}")
    wait_node("Restore Acelynn Pro backup?", timeout=25)

    print("\n[5/7] Enter the built-in certified recovery surface")
    tap_text("Restore backup", timeout=10)
    find_with_scroll("Restore / merge backup", attempts=10)

    print("\n[6/7] Restore known backup and prove duplicate suppression")
    restore_fixture(GOOD_NAME)
    # The session section stays near the restore control; two restored records
    # must become visible in the accessibility tree after the picker returns.
    if find_node("2 saved") is None:
        # Give the WebView one scroll cycle to expose its session header.
        swipe_up()
    wait_node("2 saved", timeout=12)
    restore_fixture(GOOD_NAME)
    wait_node("2 saved", timeout=12)

    print("\n[7/7] Reject a wrong-app backup without replacing restored state")
    restore_fixture(BAD_NAME)
    # The error coach is directly above the snapshots section. Scroll upward
    # and assert both the rejection and preserved restored count.
    adb("shell", "input", "swipe", "540", "650", "540", "1500", "350")
    time.sleep(1)
    wait_node("Backup could not be restored", timeout=12)
    # Scroll back down and confirm the two good records remain.
    wait_count = 0
    while find_node("2 saved") is None and wait_count < 6:
        swipe_up()
        wait_count += 1
    wait_node("2 saved", timeout=8)

    print("\nPASS: emulator-only signer transition + Acelynn recovery round trip completed.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"FAIL: {exc}", file=sys.stderr)
        try:
            adb("shell", "uiautomator", "dump", "/sdcard/acelynn-phase8-failure.xml", check=False)
            adb("pull", "/sdcard/acelynn-phase8-failure.xml", os.environ.get("RUNNER_TEMP", "/tmp") + "/acelynn-phase8-failure.xml", check=False)
            adb("exec-out", "screencap", "-p", check=False)
        except Exception:
            pass
        raise
