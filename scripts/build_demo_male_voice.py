from __future__ import annotations

import asyncio
import re
import subprocess
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
EMBED = ROOT / "public" / "demo-embed.js"
OUT = ROOT / "public" / "demo-audio"
VOICE = "en-US-GuyNeural"
AUDIO_VERSION = "20260828-male1"
TARGET_SECONDS = 58.0

APP_NAMES = {
    "cactusbyte-studios": "CactusByte Studios",
    "no-problem-pressure-washing-matrix": "No Problem Pressure Washing Matrix",
    "machzero": "MachZero",
    "rapid-takeoff": "Rapid Takeoff",
    "acelynn-pro": "Acelynn Pro",
    "pocketstomp": "PocketStomp",
    "ghostlane": "GhostLane",
    "first-bearing": "First Bearing",
    "fantasy-football-matrix": "Fantasy Football Matrix",
    "acelynn-scouttrace": "Acelynn's ScoutTrace",
    "terraflow-matrix": "TerraFlow Matrix",
    "orbitgather": "OrbitGather",
    "shadownex-prime": "ShadowNex Prime",
}


def run(*args: str) -> str:
    return subprocess.check_output(args, text=True).strip()


def unescape_js(value: str) -> str:
    return (
        value.replace("\\'", "'")
        .replace('\\"', '"')
        .replace("\\n", " ")
        .replace("\\\\", "\\")
    )


def extract_narration(source: str, slug: str, app_name: str) -> str:
    key = rf"(?:'{re.escape(slug)}'|{re.escape(slug)})"
    match = re.search(key + r":\[\s*(.*?)\s*\]\s*,?\n\s*(?:'?[\w-]+'?|\};)", source, re.S)
    if not match:
        # Last-array fallback: stop before the tracks object closes.
        match = re.search(key + r":\[\s*(.*?)\s*\]\s*\n\s*\};", source, re.S)
    if not match:
        raise RuntimeError(f"Could not find demo track for {slug}")

    steps = re.findall(
        r"\{title:'((?:\\.|[^'])*)',copy:'((?:\\.|[^'])*)'",
        match.group(1),
    )
    if len(steps) != 6:
        raise RuntimeError(f"Expected 6 demo steps for {slug}, found {len(steps)}")

    lines = [f"Welcome to {app_name}."]
    for title, copy in steps:
        lines.append(f"{unescape_js(title)}. {unescape_js(copy)}")
    lines.append(f"That is the sixty second tour of {app_name}.")
    return " ".join(lines)


async def render_tts(text: str, output: Path) -> None:
    raw = output.with_suffix(".raw.mp3")
    communicate = edge_tts.Communicate(text, VOICE, rate="+0%", volume="+0%", pitch="+0Hz")
    await communicate.save(str(raw))

    duration = float(run(
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(raw)
    ))
    tempo = duration / TARGET_SECONDS
    if not 0.5 <= tempo <= 2.0:
        raise RuntimeError(f"Unexpected narration duration {duration:.2f}s for {output.name}")

    subprocess.run(
        [
            "ffmpeg", "-y", "-loglevel", "error", "-i", str(raw),
            "-af", f"atempo={tempo:.6f},loudnorm=I=-16:TP=-1.5:LRA=11,apad=pad_dur=1.2",
            "-t", "59.2", "-ar", "24000", "-ac", "1", "-codec:a", "libmp3lame", "-q:a", "3",
            str(output),
        ],
        check=True,
    )
    raw.unlink(missing_ok=True)

    final_duration = float(run(
        "ffprobe", "-v", "error", "-show_entries", "format=duration",
        "-of", "default=noprint_wrappers=1:nokey=1", str(output)
    ))
    if not 58.0 <= final_duration <= 59.5:
        raise RuntimeError(f"Bad final duration {final_duration:.2f}s for {output.name}")
    if output.stat().st_size < 150_000:
        raise RuntimeError(f"Narration file is suspiciously small: {output.name}")
    print(f"OK {output.name}: {final_duration:.2f}s, {output.stat().st_size} bytes, {VOICE}")


def patch_embed(source: str) -> str:
    if "demo-audio/${app}-en-us-male.mp3" in source:
        return source

    anchor = "  const name=names[app]||app;\n  const track=tracks[app]||[];\n  if(!track.length)return;"
    replacement = anchor + f"\n  const maleNarration=new Audio(`https://cactusbyte-studios.vercel.app/demo-audio/${{app}}-en-us-male.mp3?v={AUDIO_VERSION}`);\n  maleNarration.preload='auto';\n  let maleNarrationActive=false;\n  maleNarration.addEventListener('error',()=>{{maleNarrationActive=false;}});"
    if anchor not in source:
        raise RuntimeError("Could not find demo track initialization anchor")
    source = source.replace(anchor, replacement, 1)

    speak_anchor = "  function speak(text){\n    if(!('speechSynthesis'in window))return;"
    speak_replacement = "  function speak(text){\n    if(maleNarrationActive)return;\n    if(!('speechSynthesis'in window))return;"
    if speak_anchor not in source:
        raise RuntimeError("Could not find speech fallback anchor")
    source = source.replace(speak_anchor, speak_replacement, 1)

    start_anchor = "    running=true;index=0;button.style.display='none';"
    start_replacement = start_anchor + "\n    maleNarrationActive=true;maleNarration.currentTime=0;\n    const malePlay=maleNarration.play();\n    if(malePlay&&malePlay.catch)malePlay.catch(()=>{maleNarrationActive=false;speak(track[0].copy);});"
    if start_anchor not in source:
        raise RuntimeError("Could not find demo start anchor")
    source = source.replace(start_anchor, start_replacement, 1)

    stop_anchor = "    running=false;clearTimeout(timer);clearHighlight();"
    stop_replacement = stop_anchor + "\n    maleNarration.pause();maleNarration.currentTime=0;maleNarrationActive=false;"
    if stop_anchor not in source:
        raise RuntimeError("Could not find demo stop anchor")
    source = source.replace(stop_anchor, stop_replacement, 1)

    return source


async def main() -> None:
    source = EMBED.read_text(encoding="utf-8")
    OUT.mkdir(parents=True, exist_ok=True)

    for slug, name in APP_NAMES.items():
        text = extract_narration(source, slug, name)
        await render_tts(text, OUT / f"{slug}-en-us-male.mp3")

    patched = patch_embed(source)
    EMBED.write_text(patched, encoding="utf-8")
    print("Patched live demo engine to prefer static American male neural narration with browser speech as fallback.")


if __name__ == "__main__":
    asyncio.run(main())
