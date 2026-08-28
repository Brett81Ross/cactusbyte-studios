"""Validate the browser-native CactusByte 60-second demo standard.

The demos now run over the real app interface. The shared browser script moves a
visible cursor to the actual controls, optionally activates safe navigation
controls, keeps captions on screen, and uses the device's best available natural
English voice. Prerecorded slide videos and synthetic espeak audio are retired.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMBED = ROOT / "public" / "demo-embed.js"

APPS = (
    "cactusbyte-studios",
    "no-problem-pressure-washing-matrix",
    "machzero",
    "rapid-takeoff",
    "acelynn-pro",
    "pocketstomp",
    "ghostlane",
    "first-bearing",
    "fantasy-football-matrix",
    "acelynn-scouttrace",
    "terraflow-matrix",
    "orbitgather",
    "shadownex-prime",
)

source = EMBED.read_text(encoding="utf-8")
missing = [slug for slug in APPS if f"'{slug}'" not in source]

if missing:
    raise SystemExit("Missing live-demo tracks: " + ", ".join(missing))
if ".mp4" in source or "espeak" in source.lower():
    raise SystemExit("The live demo must not depend on prerecorded or espeak audio.")
if "cb60-cursor" not in source or "speechSynthesis" not in source:
    raise SystemExit("The cursor or natural browser narration layer is missing.")

print(f"Validated {len(APPS)} live-screen 60-second demo tracks.")
