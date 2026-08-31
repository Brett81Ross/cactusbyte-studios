from pathlib import Path
from io import BytesIO
import urllib.request
import cairosvg
from PIL import Image

ROOT = Path(__file__).resolve().parent / "app" / "src"
APPS = {
    "cactusbyte": ("https://cactusbyte-studios.vercel.app/logo2.png", "#050807"),
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

def download(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "CactusByte-Android-Builder/1.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()

def decode(raw: bytes, url: str) -> Image.Image:
    is_svg = url.lower().endswith(".svg") or raw.lstrip().startswith(b"<svg") or b"<svg" in raw[:500]
    if is_svg:
        raw = cairosvg.svg2png(bytestring=raw, output_width=1024, output_height=1024)
    return Image.open(BytesIO(raw)).convert("RGBA")

def square_crop(img: Image.Image) -> Image.Image:
    w, h = img.size
    side = min(w, h)
    left = (w - side) // 2
    top = (h - side) // 2
    return img.crop((left, top, left + side, top + side))

def composite(img: Image.Image, bg: str, size: int, scale: float) -> Image.Image:
    src = square_crop(img)
    target = max(1, int(size * scale))
    src.thumbnail((target, target), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), bg)
    x = (size - src.width) // 2
    y = (size - src.height) // 2
    canvas.alpha_composite(src, (x, y))
    return canvas

def has_transparent_edges(img: Image.Image) -> bool:
    img = square_crop(img)
    pts = [(0, 0), (img.width - 1, 0), (0, img.height - 1), (img.width - 1, img.height - 1)]
    return sum(img.getpixel(p)[3] for p in pts) < 700

def main():
    for flavor, (url, bg) in APPS.items():
        print(f"Fetching {flavor}: {url}")
        img = decode(download(url), url)
        padded = has_transparent_edges(img)
        legacy_scale = 0.84 if padded else 1.0
        foreground_scale = 0.70 if padded else 0.92
        for density, size in DENSITIES.items():
            out = ROOT / flavor / "res" / f"mipmap-{density}"
            out.mkdir(parents=True, exist_ok=True)
            icon = composite(img, bg, size, legacy_scale).convert("RGB")
            icon.save(out / "ic_launcher.png", optimize=True)
            icon.save(out / "ic_launcher_round.png", optimize=True)
        drawable = ROOT / flavor / "res" / "drawable"
        drawable.mkdir(parents=True, exist_ok=True)
        fg = composite(img, "#00000000", 432, foreground_scale)
        fg.save(drawable / "app_icon_foreground.png", optimize=True)
        values = ROOT / flavor / "res" / "values"
        values.mkdir(parents=True, exist_ok=True)
        (values / "icon_colors.xml").write_text(
            f'<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="icon_bg">{bg}</color></resources>\n',
            encoding="utf-8",
        )

if __name__ == "__main__":
    main()
