from pathlib import Path
from io import BytesIO
import urllib.request

import cairosvg
from PIL import Image, ImageChops, ImageColor, ImageDraw, ImageFile

ImageFile.LOAD_TRUNCATED_IMAGES = True

ROOT = Path(__file__).resolve().parent / "app" / "src"
PREVIEW_ROOT = Path(__file__).resolve().parent / "icon-previews"
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
BACKGROUND_TRIM = {"cactusbyte"}
SCALES = {
    "cactusbyte": {"legacy": 0.76, "foreground": 0.60},
}


def download(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": "CactusByte-Android-Builder/1.1",
            "Accept-Encoding": "identity",
            "Cache-Control": "no-cache",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def decode(raw: bytes, url: str) -> Image.Image:
    is_svg = url.lower().endswith(".svg") or raw.lstrip().startswith(b"<svg") or b"<svg" in raw[:500]
    if is_svg:
        raw = cairosvg.svg2png(bytestring=raw, output_width=1024, output_height=1024)
    return Image.open(BytesIO(raw)).convert("RGBA")


def alpha_bbox(img: Image.Image):
    alpha = img.getchannel("A").point(lambda p: 255 if p > 8 else 0)
    return alpha.getbbox()


def sampled_corner_color(img: Image.Image):
    rgb = img.convert("RGB")
    w, h = rgb.size
    points = [
        rgb.getpixel((0, 0)),
        rgb.getpixel((w - 1, 0)),
        rgb.getpixel((0, h - 1)),
        rgb.getpixel((w - 1, h - 1)),
    ]
    return tuple(sorted(px[i] for px in points)[len(points) // 2] for i in range(3))


def difference_bbox(img: Image.Image, background, threshold: int = 18):
    rgb = img.convert("RGB")
    target = Image.new("RGB", rgb.size, background)
    diff = ImageChops.difference(rgb, target)
    r, g, b = diff.split()
    mask = ImageChops.lighter(ImageChops.lighter(r, g), b)
    mask = mask.point(lambda p: 255 if p > threshold else 0)
    alpha = img.getchannel("A").point(lambda p: 255 if p > 8 else 0)
    mask = ImageChops.multiply(mask, alpha)
    return mask.getbbox()


def expand_bbox(bbox, size, margin_ratio: float = 0.06):
    if not bbox:
        return (0, 0, size[0], size[1])
    left, top, right, bottom = bbox
    margin = max(2, int(max(right - left, bottom - top) * margin_ratio))
    return (
        max(0, left - margin),
        max(0, top - margin),
        min(size[0], right + margin),
        min(size[1], bottom + margin),
    )


def visible_subject(img: Image.Image, bg: str, trim_background: bool):
    candidates = []
    abox = alpha_bbox(img)
    if abox:
        candidates.append(abox)

    if trim_background:
        configured = ImageColor.getrgb(bg)
        sampled = sampled_corner_color(img)
        for color in (sampled, configured):
            bbox = difference_bbox(img, color)
            if not bbox:
                continue
            left, top, right, bottom = bbox
            area_ratio = ((right - left) * (bottom - top)) / max(1, img.width * img.height)
            if 0.003 <= area_ratio <= 0.92:
                candidates.append(bbox)

    if not candidates:
        bbox = (0, 0, img.width, img.height)
    elif trim_background:
        bbox = min(candidates, key=lambda b: (b[2] - b[0]) * (b[3] - b[1]))
    else:
        bbox = candidates[0]

    bbox = expand_bbox(bbox, img.size)
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
    fg = foreground.resize((size, size), Image.Resampling.LANCZOS)
    canvas.alpha_composite(fg)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).rounded_rectangle((10, 10, size - 10, size - 10), radius=116, fill=255)
    preview = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    preview.paste(canvas, (0, 0), mask)
    out.parent.mkdir(parents=True, exist_ok=True)
    preview.save(out, optimize=True)


def main():
    for flavor, (url, bg) in APPS.items():
        print(f"Fetching {flavor}: {url}")
        img = decode(download(url), url)
        subject, bbox = visible_subject(img, bg, flavor in BACKGROUND_TRIM)

        transparent = alpha_bbox(img) != (0, 0, img.width, img.height)
        defaults = {
            "legacy": 0.84 if transparent else 1.0,
            "foreground": 0.70 if transparent else 0.82,
        }
        scales = {**defaults, **SCALES.get(flavor, {})}
        print(
            f"{flavor}: source={img.size} content_bbox={bbox} subject={subject.size} "
            f"legacy_scale={scales['legacy']:.2f} foreground_scale={scales['foreground']:.2f}"
        )

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
