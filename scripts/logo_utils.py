"""Shared logo download, enhance, and WebP save utilities."""

from __future__ import annotations

import io
import re
import ssl
import time
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from PIL import Image, ImageFilter, UnidentifiedImageError

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

NOT_FOUND = {"not found", "n/a", ""}
WP_SIZE = re.compile(r"-(\d+)x(\d+)(?=\.(png|jpe?g|webp|gif|avif)$)", re.I)
WP_CROPPED = re.compile(r"/cropped-(.+?)-\d+x\d+\.(png|jpe?g|webp)$", re.I)
GOOGLE_SIZE = re.compile(r"=w\d+-h\d+(-[a-z-]+)?$", re.I)
SKIP_URL = re.compile(r"facebook\.com/tr|noscript=1|schema\.org", re.I)
WIX_MEDIA = re.compile(r"https://static\.wixstatic\.com/media/[^\s\"'<>]+", re.I)

LOGO_TARGET = 192
LOGO_INNER = 168


def is_missing(value: str | None) -> bool:
    if not value:
        return True
    return value.strip().lower() in NOT_FOUND


def _site_variants(website: str) -> list[str]:
    if not website:
        return []
    base = website.rstrip("/")
    variants = [base]
    parsed = urlparse(base)
    if parsed.netloc.startswith("www."):
        variants.append(f"{parsed.scheme}://{parsed.netloc[4:]}{parsed.path}")
    elif parsed.netloc:
        variants.append(f"{parsed.scheme}://www.{parsed.netloc}{parsed.path}")
    seen: set[str] = set()
    out: list[str] = []
    for v in variants:
        if v not in seen:
            seen.add(v)
            out.append(v)
    return out


def fetch_bytes(url: str, referer: str | None = None, timeout: int = 25) -> bytes | None:
    if is_missing(url) or SKIP_URL.search(url):
        return None
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    }
    if referer:
        headers["Referer"] = referer
    try:
        req = Request(url, headers=headers)
        with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            data = resp.read(4_000_000)
            if len(data) < 20:
                return None
            if data.lstrip().startswith(b"<svg") or b"<svg " in data[:500]:
                return None
            return data
    except (HTTPError, URLError, TimeoutError, ValueError, OSError):
        return None


def fetch_html(url: str, timeout: int = 45) -> str | None:
    try:
        req = Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"},
        )
        with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            return resp.read(400_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError, OSError):
        return None


def scene7_variants(url: str) -> list[str]:
    if "scene7.com" not in url:
        return []
    out: list[str] = []
    base = url.split("?")[0]
    name = base.rsplit("/", 1)[-1]
    name = re.sub(r"-dark$", "", name, flags=re.I)
    name = name.split("?")[0].split("$")[0]
    if "favicon" in name.lower():
        name = name.replace("-favicon", "").replace("favicon", "logo")
    group = "wrenchgroup"
    if "/wrenchgroup/" in base:
        group = "wrenchgroup"
    png = f"https://wg.scene7.com/is/image/{group}/{name}?fmt=png-alpha&wid=256"
    jpg = f"https://wg.scene7.com/is/image/{group}/{name}?fmt=jpeg&wid=256"
    for candidate in (png, jpg, url):
        if candidate not in out:
            out.append(candidate)
    if "/is/content/" in url:
        image_url = url.replace("/is/content/", "/is/image/")
        image_url = re.sub(r"\?.*", "?fmt=png-alpha&wid=256", image_url)
        if image_url not in out:
            out.append(image_url)
    return out


def logo_url_variants(url: str) -> list[str]:
    if is_missing(url):
        return []
    url = url.strip()
    variants: list[str] = []

    if "scene7.com" in url:
        variants.extend(scene7_variants(url))
    else:
        variants.append(url)

    if WP_SIZE.search(url):
        variants.append(WP_SIZE.sub("", url))
    cropped = WP_CROPPED.search(url)
    if cropped:
        variants.append(WP_CROPPED.sub(r"/\1.\2", url))

    if "googleusercontent.com" in url and GOOGLE_SIZE.search(url):
        variants.append(GOOGLE_SIZE.sub("=w256-h256-k-no", url))

    if "wixstatic.com" in url and "/v1/" in url:
        variants.append(url.split("/v1/")[0])

    seen: set[str] = set()
    out: list[str] = []
    for v in variants:
        if v and v not in seen:
            seen.add(v)
            out.append(v)
    return out


def scrape_logo_urls(website: str) -> list[str]:
    found: list[str] = []

    def add(raw: str, base: str) -> None:
        raw = unescape(raw.strip())
        if not raw or raw.startswith("data:"):
            return
        full = urljoin(base, raw)
        if full not in found and not SKIP_URL.search(full):
            found.append(full)

    for site in _site_variants(website):
        html = fetch_html(site)
        if not html:
            continue

        for match in WIX_MEDIA.finditer(html):
            url = match.group(0).split("/v1/")[0]
            if url not in found:
                found.append(url)

        for pat in (
            r'<link[^>]+rel=["\']?(?:apple-touch-icon|icon|shortcut icon)["\']?[^>]+href=["\']([^"\']+)["\']',
            r'<link[^>]+href=["\']([^"\']+)["\'][^>]+rel=["\']?(?:apple-touch-icon|icon)["\']?',
            r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
            r'<meta[^>]+name=["\']twitter:image["\'][^>]+content=["\']([^"\']+)["\']',
            r'<img[^>]+src=["\']([^"\']*logo[^"\']*)["\']',
            r'"logo"\s*:\s*"([^"]+)"',
            r'"image"\s*:\s*"([^"]+logo[^"]*)"',
        ):
            for match in re.finditer(pat, html, re.I):
                add(match.group(1), site)

        for path in ("/apple-touch-icon.png", "/favicon.ico", "/favicon.png"):
            add(path, site)

    return found


def enhance_logo_image(img: Image.Image) -> Image.Image:
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    w, h = img.size
    if w < 2 or h < 2 or (w == 1 and h == 1):
        raise ValueError("too small")

    scale = min(LOGO_INNER / w, LOGO_INNER / h)
    new_w, new_h = max(1, int(w * scale)), max(1, int(h * scale))

    if scale > 1.2:
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        img = img.filter(ImageFilter.UnsharpMask(radius=1.2, percent=140, threshold=2))
    elif new_w != w or new_h != h:
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)

    canvas = Image.new("RGBA", (LOGO_TARGET, LOGO_TARGET), (255, 255, 255, 255))
    x = (LOGO_TARGET - new_w) // 2
    y = (LOGO_TARGET - new_h) // 2
    if img.mode == "RGBA":
        canvas.paste(img, (x, y), img.split()[3])
    else:
        canvas.paste(img, (x, y))

    return canvas.convert("RGB")


def load_best_image(data: bytes) -> Image.Image:
    img = Image.open(io.BytesIO(data))
    best = img.copy()
    best.load()
    best_area = best.size[0] * best.size[1]

    if getattr(img, "n_frames", 1) > 1 or img.format == "ICO":
        try:
            idx = 0
            while True:
                img.seek(idx)
                frame = img.copy()
                frame.load()
                area = frame.size[0] * frame.size[1]
                if area > best_area:
                    best = frame
                    best_area = area
                idx += 1
        except EOFError:
            pass

    return best


def save_logo_from_bytes(data: bytes, dest: Path) -> bool:
    try:
        img = load_best_image(data)
        if img.size[0] < 2 or img.size[1] < 2:
            return False
        out = enhance_logo_image(img)
        dest.parent.mkdir(parents=True, exist_ok=True)
        out.save(dest, format="WEBP", quality=90, method=6)
        return dest.exists() and dest.stat().st_size > 80
    except (UnidentifiedImageError, OSError, ValueError):
        return False


def try_candidates(urls: list[str], dest: Path, referer: str | None = None) -> bool:
    for url in urls:
        for variant in logo_url_variants(url):
            data = fetch_bytes(variant, referer=referer)
            if data and save_logo_from_bytes(data, dest):
                return True
            time.sleep(0.08)
    return False


def collect_candidates(raw: dict, business: dict) -> list[str]:
    urls: list[str] = []
    website = business.get("website") or ""

    if not is_missing(raw.get("logo_url")):
        urls.append(raw["logo_url"].strip())

    urls.extend(scrape_logo_urls(website))

    if website:
        parsed = urlparse(website if website.startswith("http") else f"https://{website}")
        domain = (parsed.netloc or parsed.path).replace("www.", "")
        if domain:
            urls.append(
                "https://t1.gstatic.com/faviconV2?"
                f"client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://{domain}&size=128"
            )
            urls.append(f"https://icons.duckduckgo.com/ip3/{domain}.ico")

    # Known brand CDNs when corporate site blocks bots
    name = (business.get("name") or raw.get("business_name") or "").lower()
    if "ars" in name or "rescue rooter" in name:
        urls.extend(
            [
                "https://www.ars.com/rescue-rooter/_assets/images/rescuerooter-logo.png",
                "https://www.ars.com/rescue-rooter/_assets/images/rr-logo.png",
                "https://media.ars.com/rescue-rooter-logo.png",
            ]
        )

    seen: set[str] = set()
    ordered: list[str] = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            ordered.append(u)
    return ordered


def download_business_logo(raw: dict, business: dict, dest: Path) -> bool:
    referer = business.get("website") or None
    return try_candidates(collect_candidates(raw, business), dest, referer=referer)
