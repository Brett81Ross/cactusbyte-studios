#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import json
from pathlib import Path
from urllib.request import Request, urlopen

SOURCE_REPO = "Brett81Ross/Acelynn"
SOURCE_COMMIT = "6363059183cebe650830cc240d275936dc802d34"
RAW_BASE = f"https://raw.githubusercontent.com/{SOURCE_REPO}/{SOURCE_COMMIT}/"
DEST = Path("android-packager/app/src/acelynnproQaDebug/assets/acelynnqa")
EXPECTED_GIT_BLOBS = {
    "index.html": "f61201e13b6e001f49d0718b33a4072e6bf7704f",
    "acelynn-recovery.js": "2f29bec84322b3e457cf41162ae970d7907b5f31",
    "manifest.json": "99454bd1f5f822d3cd378f95355d9b345bd965ef",
    "acelynnpro.png": "f915b3a11fc01b94fe80e1d668064b2c3980dc3c",
}


def git_blob_sha1(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("utf-8")
    return hashlib.sha1(header + data).hexdigest()


def fetch_exact(name: str) -> bytes:
    req = Request(RAW_BASE + name, headers={"User-Agent": "CactusByte-Phase7-QA/1.0"})
    with urlopen(req, timeout=30) as response:
        data = response.read()
    actual = git_blob_sha1(data)
    expected = EXPECTED_GIT_BLOBS[name]
    if actual != expected:
        raise SystemExit(f"Pinned asset mismatch for {name}: expected git blob {expected}, got {actual}")
    return data


def write_if_changed(path: Path, data: bytes) -> bool:
    if path.exists() and path.read_bytes() == data:
        print(f"{path}: already deterministic")
        return False
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)
    print(f"{path}: pinned from {SOURCE_COMMIT}")
    return True


def main() -> None:
    DEST.mkdir(parents=True, exist_ok=True)
    changed = False
    records = []
    fetched = {}

    for name in EXPECTED_GIT_BLOBS:
        data = fetch_exact(name)
        fetched[name] = data
        changed |= write_if_changed(DEST / name, data)
        records.append({
            "path": name,
            "bytes": len(data),
            "gitBlobSha1": EXPECTED_GIT_BLOBS[name],
            "sha256": hashlib.sha256(data).hexdigest(),
        })

    index_text = fetched["index.html"].decode("utf-8")
    recovery_text = fetched["acelynn-recovery.js"].decode("utf-8")
    if "serviceWorker.register" in index_text or "serviceWorker.register" in recovery_text:
        raise SystemExit("Pinned QA assets unexpectedly register a service worker")
    if "https://acelynn.vercel.app" in index_text or "https://acelynn.vercel.app" in recovery_text:
        raise SystemExit("Pinned QA assets unexpectedly contain the production Acelynn URL")

    sw_path = DEST / "sw.js"
    if sw_path.exists():
        sw_path.unlink()
        changed = True
        print(f"{sw_path}: removed")

    metadata = {
        "purpose": "Acelynn Pro Phase 7 physical recovery QA",
        "sourceRepository": SOURCE_REPO,
        "sourceCommit": SOURCE_COMMIT,
        "entryPoint": "https://appassets.androidplatform.net/assets/acelynnqa/index.html",
        "productionUrlPackaged": False,
        "serviceWorkerPackaged": False,
        "files": records,
    }
    metadata_bytes = (json.dumps(metadata, indent=2, sort_keys=True) + "\n").encode("utf-8")
    changed |= write_if_changed(DEST / "PINNED_SOURCE.json", metadata_bytes)

    if changed:
        print("Pinned Acelynn Pro physical-QA assets updated.")
    else:
        print("Pinned Acelynn Pro physical-QA assets already settled.")


if __name__ == "__main__":
    main()
