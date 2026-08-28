"""Validate the CactusByte live-screen 60-second demo standard.

The demos run over the real app interface with a visible cursor and captions.
Primary narration is a pre-generated American male neural track for consistent,
non-robotic playback across Android, iOS, and desktop. Browser speech synthesis
is retained only as an emergency fallback when the static narration cannot play.
"""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EMBED = ROOT / "public" / "demo-embed.js"
AUDIO = ROOT / "public" / "demo-audio"

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
missing_tracks = [slug for slug in APPS if f"'{slug}'" not in source and f"{slug}:[" not in source]
if missing_tracks:
    raise SystemExit("Missing live-demo tracks: " + ", ".join(missing_tracks))

if "cb60-cursor" not in source:
    raise SystemExit("The live cursor layer is missing.")
if "speechSynthesis" not in source:
    raise SystemExit("Emergency browser narration fallback is missing.")
if "demo-audio/${app}-en-us-male.mp3" not in source or "maleNarration" not in source:
    raise SystemExit("American male neural narration is not wired into the live demo engine.")

missing_audio = []
small_audio = []
for slug in APPS:
    path = AUDIO / f"{slug}-en-us-male.mp3"
    if not path.exists():
        missing_audio.append(slug)
    elif path.stat().st_size < 150_000:
        small_audio.append(f"{slug} ({path.stat().st_size} bytes)")

if missing_audio:
    raise SystemExit("Missing American male narration: " + ", ".join(missing_audio))
if small_audio:
    raise SystemExit("Suspiciously small narration files: " + ", ".join(small_audio))

print(f"Validated {len(APPS)} live-screen demos with American male neural narration and browser fallback.")
