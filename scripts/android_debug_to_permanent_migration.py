#!/usr/bin/env python3
"""Safely preserve persistent Android WebView storage across the one-time
CactusByte debug-signed -> permanent-signed uninstall/reinstall cutover.

This intentionally excludes cookies, caches, and service-worker state. The
backup may still contain sensitive localStorage/IndexedDB values; keep it local
and delete it after the permanent-signed install is verified.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import shlex
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

PACKAGES = {
    "cactusbyte": "com.cactusbyte.studios",
    "noproblem": "com.cactusbyte.noproblem",
    "machzero": "com.cactusbyte.machzero",
    "rapidtakeoff": "com.cactusbyte.rapidtakeoff",
    "acelynnpro": "com.cactusbyte.acelynnpro",
    "pocketstomp": "com.cactusbyte.pocketstomp",
    "ghostlane": "com.cactusbyte.ghostlane",
    "firstbearing": "com.cactusbyte.firstbearing",
    "fantasy": "com.cactusbyte.fantasyfootballmatrix",
    "scouttrace": "com.cactusbyte.scouttrace",
    "shadownex": "com.cactusbyte.shadownexprime",
    "terraflow": "com.cactusbyte.terraflow",
    "orbitgather": "com.cactusbyte.orbitgather",
}

# Persistent site data only. Do not migrate cookie databases, HTTP caches,
# service-worker caches, or transient session storage across signing identities.
PERSISTENT_WEBVIEW_PATHS = (
    "app_webview/Default/Local Storage",
    "app_webview/Default/IndexedDB",
    "app_webview/Default/WebStorage",
    "app_webview/Default/File System",
    "app_webview/Default/databases",
)

SCHEMA_VERSION = 1


def fail(message: str) -> None:
    print(f"MIGRATION FAILED: {message}", file=sys.stderr)
    raise SystemExit(1)


def adb_executable() -> str:
    adb = shutil.which("adb")
    if not adb:
        fail("adb was not found in PATH. Install Android Platform Tools first.")
    return adb


def run(args: list[str], *, check: bool = True, text: bool = True) -> subprocess.CompletedProcess:
    proc = subprocess.run(args, capture_output=True, text=text, check=False)
    if check and proc.returncode != 0:
        stderr = proc.stderr.strip() if text and proc.stderr else ""
        stdout = proc.stdout.strip() if text and proc.stdout else ""
        fail(stderr or stdout or f"command failed: {' '.join(args)}")
    return proc


def ensure_device(adb: str, serial: str | None) -> list[str]:
    prefix = [adb]
    if serial:
        prefix += ["-s", serial]
    state = run(prefix + ["get-state"], check=False)
    if state.returncode != 0 or state.stdout.strip() != "device":
        fail("no authorized Android device is available through adb")
    return prefix


def installed(prefix: list[str], package: str) -> bool:
    proc = run(prefix + ["shell", "pm", "path", package], check=False)
    return proc.returncode == 0 and "package:" in proc.stdout


def run_as_available(prefix: list[str], package: str) -> bool:
    proc = run(prefix + ["shell", "run-as", package, "id"], check=False)
    return proc.returncode == 0 and "uid=" in proc.stdout


def data_dir(prefix: list[str], package: str) -> str:
    proc = run(prefix + ["shell", "run-as", package, "pwd"])
    value = proc.stdout.strip()
    if not value.startswith("/data/"):
        fail(f"unexpected run-as data directory for {package}: {value}")
    return value


def remote_shell(prefix: list[str], package: str, command: str, *, check: bool = True) -> subprocess.CompletedProcess:
    remote = f"run-as {shlex.quote(package)} sh -c {shlex.quote(command)}"
    return run(prefix + ["shell", remote], check=check)


def existing_paths(prefix: list[str], package: str, root: str) -> list[str]:
    found: list[str] = []
    for relative in PERSISTENT_WEBVIEW_PATHS:
        cmd = f"cd {shlex.quote(root)} && test -e {shlex.quote(relative)}"
        if remote_shell(prefix, package, cmd, check=False).returncode == 0:
            found.append(relative)
    return found


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def selected_brands(args: argparse.Namespace) -> list[str]:
    if getattr(args, "all", False):
        return list(PACKAGES)
    if getattr(args, "brand", None):
        return [args.brand]
    fail("choose --brand <name> or --all")


def audit(prefix: list[str], brands: list[str]) -> int:
    issues = 0
    for brand in brands:
        package = PACKAGES[brand]
        if not installed(prefix, package):
            print(f"SKIP {brand}: {package} is not installed")
            continue
        if not run_as_available(prefix, package):
            print(f"BLOCKED {brand}: installed app is not debuggable; run-as cannot read its private WebView data")
            issues += 1
            continue
        root = data_dir(prefix, package)
        paths = existing_paths(prefix, package, root)
        if paths:
            print(f"READY {brand}: {len(paths)} persistent WebView storage path(s) found")
            for path in paths:
                print(f"  - {path}")
        else:
            print(f"READY {brand}: no persistent WebView storage paths found")
    return issues


def backup_one(prefix: list[str], brand: str, out_dir: Path) -> None:
    package = PACKAGES[brand]
    if not installed(prefix, package):
        print(f"SKIP {brand}: {package} is not installed")
        return
    if not run_as_available(prefix, package):
        fail(f"{brand} is installed but not debuggable; cannot safely back up private WebView data with run-as")

    root = data_dir(prefix, package)
    paths = existing_paths(prefix, package, root)
    out_dir.mkdir(parents=True, exist_ok=True)
    archive = out_dir / f"{brand}.persistent-webview.tar"
    manifest_path = out_dir / f"{brand}.migration.json"

    run(prefix + ["shell", "am", "force-stop", package], check=False)

    if paths:
        quoted = " ".join(shlex.quote(path) for path in paths)
        command = f"cd {shlex.quote(root)} && tar -cf - {quoted}"
        remote = f"run-as {shlex.quote(package)} sh -c {shlex.quote(command)}"
        with archive.open("wb") as output:
            proc = subprocess.Popen(prefix + ["exec-out", remote], stdout=output, stderr=subprocess.PIPE)
            _, stderr = proc.communicate()
        if proc.returncode != 0:
            archive.unlink(missing_ok=True)
            fail(f"adb tar backup failed for {brand}: {(stderr or b'').decode(errors='replace').strip()}")
        digest = sha256_file(archive)
    else:
        archive.unlink(missing_ok=True)
        digest = None

    manifest = {
        "schemaVersion": SCHEMA_VERSION,
        "brand": brand,
        "package": package,
        "createdUtc": datetime.now(timezone.utc).isoformat(),
        "paths": paths,
        "archive": archive.name if paths else None,
        "sha256": digest,
        "cookiesIncluded": False,
        "notes": "Persistent WebView site storage only. Cookies, caches, service workers, and session storage are excluded; re-login may be required.",
    }
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    print(f"BACKED UP {brand}: {len(paths)} path(s) -> {manifest_path}")
    if digest:
        print(f"  SHA-256 {digest}")


def restore_one(prefix: list[str], brand: str, in_dir: Path) -> None:
    package = PACKAGES[brand]
    manifest_path = in_dir / f"{brand}.migration.json"
    if not manifest_path.is_file():
        fail(f"migration manifest not found: {manifest_path}")
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("schemaVersion") != SCHEMA_VERSION or manifest.get("brand") != brand or manifest.get("package") != package:
        fail(f"migration manifest does not match {brand}/{package}")

    if not installed(prefix, package):
        fail(f"{brand} permanent-signed migration APK is not installed")
    if not run_as_available(prefix, package):
        fail(
            f"{brand} is not debuggable. Restore requires the temporary permanent-signed migration build; "
            "do not use the final non-debuggable release until restore is complete."
        )

    paths = manifest.get("paths") or []
    if not paths:
        print(f"RESTORE {brand}: backup recorded no persistent WebView storage; nothing to restore")
        return
    if any(path not in PERSISTENT_WEBVIEW_PATHS for path in paths):
        fail(f"migration manifest contains an unexpected WebView path for {brand}")

    archive_name = manifest.get("archive")
    archive = in_dir / str(archive_name)
    if not archive.is_file():
        fail(f"migration archive not found: {archive}")
    expected_digest = manifest.get("sha256")
    actual_digest = sha256_file(archive)
    if not expected_digest or actual_digest != expected_digest:
        fail(f"SHA-256 mismatch for {archive.name}; refusing to restore")

    root = data_dir(prefix, package)
    run(prefix + ["shell", "am", "force-stop", package], check=False)
    removal = " ".join(shlex.quote(path) for path in paths)
    command = f"cd {shlex.quote(root)} && rm -rf {removal} && tar -xf -"
    remote = f"run-as {shlex.quote(package)} sh -c {shlex.quote(command)}"
    with archive.open("rb") as input_handle:
        proc = subprocess.Popen(prefix + ["shell", remote], stdin=input_handle, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = proc.communicate()
    if proc.returncode != 0:
        fail(
            f"adb restore failed for {brand}: "
            f"{(stderr or stdout or b'').decode(errors='replace').strip()}"
        )

    print(f"RESTORED {brand}: {len(paths)} persistent WebView storage path(s)")
    run(prefix + ["shell", "monkey", "-p", package, "-c", "android.intent.category.LAUNCHER", "1"], check=False)
    print("  App launched for verification. Re-login may be required because cookies were intentionally not migrated.")


def parser() -> argparse.ArgumentParser:
    root = argparse.ArgumentParser(description="CactusByte Android debug-to-permanent signing migration helper")
    root.add_argument("--serial", help="adb device serial when more than one device is connected")
    sub = root.add_subparsers(dest="command", required=True)

    for name in ("audit", "backup", "restore"):
        cmd = sub.add_parser(name)
        choose = cmd.add_mutually_exclusive_group(required=True)
        choose.add_argument("--brand", choices=PACKAGES)
        choose.add_argument("--all", action="store_true")
        if name == "backup":
            cmd.add_argument("--out", default="android-migration-backups", help="local backup directory")
        if name == "restore":
            cmd.add_argument("--in-dir", default="android-migration-backups", help="local backup directory")
    return root


def main() -> None:
    args = parser().parse_args()
    adb = adb_executable()
    prefix = ensure_device(adb, args.serial)
    brands = selected_brands(args)

    if args.command == "audit":
        raise SystemExit(1 if audit(prefix, brands) else 0)
    if args.command == "backup":
        out_dir = Path(args.out).resolve()
        for brand in brands:
            backup_one(prefix, brand, out_dir)
        print(f"Backups are local and may contain sensitive site data. Keep {out_dir} private and delete it after final verification.")
        return
    if args.command == "restore":
        in_dir = Path(args.in_dir).resolve()
        for brand in brands:
            restore_one(prefix, brand, in_dir)
        return


if __name__ == "__main__":
    main()
