from pathlib import Path
from io import BytesIO
import urllib.request

import cairosvg
from PIL import Image, ImageDraw, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

PACKAGER = Path(__file__).resolve().parent
ROOT = PACKAGER / "app" / "src"
ASSETS = PACKAGER / "assets"
PREVIEW_ROOT = PACKAGER / "icon-previews"
APPS = {
    "cactusbyte": ("asset:cactusbyte-launcher.svg", "#050807"),
    "noproblem": ("https://noproblem-pws.vercel.app/app-icon-192.webp", "#081422"),
    "machzero": ("https://machzero-beta.vercel.app/logo1.jpg", "#050505"),
    "rapidtakeoff": ("https://blueprint-estimator.vercel.app/icon.svg", "#07131f"),
    "acelynnpro": ("https://acelynn.vercel.app/acelynnpro.png", "#020607"),
    "pocketstomp": ("https://pocketstomp-v2-brett81ross.vercel.app/pocketstomp-icon.png", "#080808"),
    "ghostlane": ("https://ghostlane-app.vercel.app/logo-gl.png", "#020406"),
    "firstbearing": ("https://first-bearing.vercel.app/first-bearing-app-icon-192-v260.png", "#071625"),
    "fantasy": ("https://cactusbyte-studios.vercel.app/ffm-mark.svg", "#071018"),
    "scouttrace": ("https://acelynn-scoutrace.vercel.app/scouttrace-icon.svg", "#05080a"),
    "shadownex": ("https://cactusbyte-studios.vercel.app/shadownex-mark.svg", "#05070a"),
    "terraflow": ("https://cactusbyte-studios.vercel.app/terraflow-mark.svg", "#07110b"),
    "orbitgather": ("https://cactusbyte-studios.vercel.app/orbitgather-mark.svg", "#071019"),
}
DENSITIES = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
SCALES = {"cactusbyte": {"legacy": 0.92, "foreground": 0.92}}


def load_source(source: str) -> bytes:
    if source.startswith("asset:"):
        path = ASSETS / source.removeprefix("asset:")
        if not path.is_file():
            raise FileNotFoundError(f"Missing launcher asset: {path}")
        return path.read_bytes()
    req = urllib.request.Request(
        source,
        headers={
            "User-Agent": "CactusByte-Android-Builder/1.2",
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def decode(raw: bytes, source: str) -> Image.Image:
    is_svg = source.lower().endswith(".svg") or raw.lstrip().startswith(b"<svg") or b"<svg" in raw[:500]
    if is_svg:
        raw = cairosvg.svg2png(bytestring=raw, output_width=1024, output_height=1024)
    return Image.open(BytesIO(raw)).convert("RGBA")


def alpha_bbox(img: Image.Image):
    alpha = img.getchannel("A").point(lambda p: 255 if p > 8 else 0)
    return alpha.getbbox()


def subject_from_alpha(img: Image.Image):
    bbox = alpha_bbox(img)
    if not bbox:
        raise ValueError("Launcher source has no visible pixels")
    return img.crop(bbox), bbox


def render_icon(subject: Image.Image, bg: str, size: int, scale: float) -> Image.Image:
    src = subject.copy()
    target = max(1, int(size * scale))
    src.thumbnail((target, target), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    x = (size - src.width) // 2
    y = (size - src.height) // 2
    canvas.alpha_composite(src, (x, y))
    return canvas


def adaptive_preview(foreground: Image.Image, bg: str, out: Path):
    size = 512
    canvas = Image.new("RGBA", (size, size), bg)
    canvas.alpha_composite(foreground.resize((size, size), Image.Resampling.LANCZOS))
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((10, 10, size - 10, size - 10), radius=116, fill=255)
    preview = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    preview.paste(canvas, (0, 0), mask)
    out.parent.mkdir(parents=True, exist_ok=True)
    preview.save(out, optimize=True)


def main():
    for flavor, (source, bg) in APPS.items():
        print(f"Loading {flavor}: {source}")
        img = decode(load_source(source), source)
        subject, bbox = subject_from_alpha(img)
        transparent = bbox != (0, 0, img.width, img.height)
        defaults = {"legacy": 0.84 if transparent else 1.0, "foreground": 0.70 if transparent else 0.82}
        scales = {**defaults, **SCALES.get(flavor, {})}
        print(f"{flavor}: source={img.size} content_bbox={bbox} subject={subject.size}")

        for density, size in DENSITIES.items():
            out = ROOT / flavor / "res" / f"mipmap-{density}"
            out.mkdir(parents=True, exist_ok=True)
            icon = render_icon(subject, bg, size, scales["legacy"]).convert("RGB")
            icon.save(out / "ic_launcher.png", optimize=True)
            icon.save(out / "ic_launcher_round.png", optimize=True)

        drawable = ROOT / flavor / "res" / "drawable"
        drawable.mkdir(parents=True, exist_ok=True)
        fg = render_icon(subject, "#00000000", 432, scales["foreground"])
        fg.save(drawable / "app_icon_foreground.png", optimize=True)

        values = ROOT / flavor / "res" / "values"
        values.mkdir(parents=True, exist_ok=True)
        (values / "icon_colors.xml").write_text(
            f'<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="icon_bg">{bg}</color></resources>\n',
            encoding="utf-8",
        )

        if flavor == "cactusbyte":
            adaptive_preview(fg, bg, PREVIEW_ROOT / "CactusByte-adaptive-preview.png")


if __name__ == "__main__":
    main()
