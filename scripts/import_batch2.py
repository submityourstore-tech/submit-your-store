"""
Import batch-2 HVAC CSV: append listings, download images as WebP (skip broken/low-res).
Usage: python scripts/import_batch2.py "path/to/file.csv"
"""

from __future__ import annotations

import csv
import io
import json
import re
import ssl
import sys
import time
import unicodedata
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from PIL import Image, UnidentifiedImageError

sys.path.insert(0, str(Path(__file__).resolve().parent))
from category_rules import classify_business
from description_builder import build_long_description
from logo_utils import download_business_logo

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"
IMG_ROOT = ROOT / "public" / "businesses"

USER_AGENT = "SubmitYourStoreBot/1.0 (+https://submityourstore.com)"
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

NOT_FOUND = {"not found", "n/a", ""}
PLACEHOLDER_EMAILS = {
    "your@email.com",
    "user@domain.com",
    "info@mysite.com",
    "email@domain.com",
    "example@domain.com",
}

CATEGORY_MAP = {
    "hvac contractor": "HVAC Contractor",
    "heating contractor": "Heating Contractor",
    "air conditioning repair service": "AC Repair",
    "air conditioning contractor": "AC Contractor",
    "plumber": "Plumbing & HVAC",
    "air duct cleaning service": "Air Duct Cleaning",
}

GOOGLE_SIZE = re.compile(r"=w\d+-h\d+(-[a-z-]+)?$", re.I)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def is_missing(value: str | None) -> bool:
    if not value:
        return True
    return value.strip().lower() in NOT_FOUND


def normalize_phone(phone: str) -> str:
    digits = re.sub(r"\D", "", phone)
    if len(digits) == 11 and digits.startswith("1"):
        return f"+1 ({digits[1:4]}) {digits[4:7]}-{digits[7:]}"
    if len(digits) == 10:
        return f"+1 ({digits[0:3]}) {digits[3:6]}-{digits[6:]}"
    return phone.strip()


def normalize_website(raw: str) -> str | None:
    if is_missing(raw):
        return None
    url = raw.strip()
    if not url.startswith("http"):
        url = f"https://{url}"
    return url


def normalize_social(raw: str) -> str | None:
    if is_missing(raw):
        return None
    url = raw.strip()
    if "facebook.com/tr" in url or "noscript=1" in url:
        return None
    if not url.startswith("http"):
        url = f"https://{url}"
    return url


def clean_category(raw: str, name: str) -> tuple[str, str, str, str]:
    result = classify_business(name, raw)
    return result["category"], result["categorySlug"], result["vertical"], result["status"]


def upscale_google_url(url: str, size: int = 960) -> str:
    if "googleusercontent.com" not in url:
        return url
    if GOOGLE_SIZE.search(url):
        return GOOGLE_SIZE.sub(f"=w{size}-h{size}-k-no", url)
    return url


def fetch_bytes(url: str, timeout: int = 20) -> bytes | None:
    try:
        req = Request(
            url,
            headers={"User-Agent": USER_AGENT, "Accept": "image/*,*/*"},
        )
        with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            data = resp.read(5_000_000)
            if len(data) < 500:
                return None
            return data
    except (HTTPError, URLError, TimeoutError, ValueError):
        return None


def save_webp(
    data: bytes,
    dest: Path,
    *,
    min_width: int,
    min_height: int,
    max_side: int,
    min_side: int = 0,
) -> bool:
    try:
        img = Image.open(io.BytesIO(data))
        img.load()
    except (UnidentifiedImageError, OSError, ValueError):
        return False

    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA" if "A" in img.getbands() else "RGB")

    w, h = img.size
    if w < min_width or h < min_height:
        return False
    if min_side and min(w, h) < min_side:
        return False

    longest = max(w, h)
    if longest > max_side:
        scale = max_side / longest
        img = img.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)

    dest.parent.mkdir(parents=True, exist_ok=True)
    if img.mode == "RGBA":
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[3])
        img = bg

    img.save(dest, format="WEBP", quality=86, method=6)
    return dest.stat().st_size > 800


def try_logo(url: str, dest: Path) -> bool:
    """Deprecated — use logo_utils.download_business_logo."""
    return False


def try_gallery(url: str, dest: Path) -> bool:
    if is_missing(url):
        return False
    if "w32-h32" in url or "=w32-" in url:
        return False
    url = upscale_google_url(url, 960)
    data = fetch_bytes(url)
    if not data:
        return False
    return save_webp(
        data,
        dest,
        min_width=380,
        min_height=240,
        max_side=1200,
    )


def gallery_key(url: str) -> str:
    base = url.split("=w")[0] if "=w" in url else url
    return base[-80:]


def looks_like_review(text: str) -> bool:
    if len(text) > 260:
        return True
    low = text.lower()
    return any(m in low for m in ("more", "…", "best hvac", "won't use", "love them"))


def unique_id(base: str, used: set[str]) -> str:
    slug = slugify(base)
    if slug not in used:
        used.add(slug)
        return slug
    n = 2
    while f"{slug}-{n}" in used:
        n += 1
    final = f"{slug}-{n}"
    used.add(final)
    return final


def process_images(bid: str, raw: dict) -> tuple[str | None, list[str]]:
    logo_path = IMG_ROOT / bid / "logo.webp"
    gallery_paths: list[str] = []
    seen: set[str] = set()

    business_stub = {"website": normalize_website(raw.get("website", ""))}
    download_business_logo(raw, business_stub, logo_path)
    logo = f"/businesses/{bid}/logo.webp" if logo_path.exists() else None

    for idx, key in enumerate(("image_2", "image_3"), start=1):
        url = raw.get(key, "")
        if is_missing(url):
            continue
        gkey = gallery_key(url)
        if gkey in seen:
            continue
        seen.add(gkey)
        dest = IMG_ROOT / bid / f"gallery-{idx}.webp"
        if try_gallery(url, dest):
            gallery_paths.append(f"/businesses/{bid}/gallery-{idx}.webp")
        time.sleep(0.15)

    return logo, gallery_paths


def process_row(raw: dict, used_ids: set[str]) -> dict:
    name = raw["business_name"].strip()
    bid = unique_id(name, used_ids)
    category, category_slug, vertical, status = clean_category(raw.get("category", ""), name)

    email = raw.get("email", "").strip().lower()
    if is_missing(email) or email in PLACEHOLDER_EMAILS:
        email = None

    address = raw.get("address", "").strip()
    if is_missing(address):
        address = None

    desc_hint = raw.get("description_raw", "").strip()
    if desc_hint == address or looks_like_review(desc_hint):
        desc_hint = None

    logo, gallery = process_images(bid, raw)

    row: dict = {
        "id": bid,
        "name": name,
        "vertical": raw.get("_vertical") or vertical,
        "status": status,
        "category": category,
        "categorySlug": category_slug,
        "address": address,
        "city": raw.get("city", "Dallas").strip() or "Dallas",
        "state": raw.get("state", "TX").strip() or "TX",
        "website": normalize_website(raw.get("website", "")),
        "email": email,
        "phone": normalize_phone(raw.get("phone", "")),
        "googleMapsUrl": raw.get("gbp_url") if not is_missing(raw.get("gbp_url")) else None,
        "social": {
            "facebook": normalize_social(raw.get("facebook", "")),
            "instagram": normalize_social(raw.get("instagram", "")),
            "linkedin": normalize_social(raw.get("linkedin", "")),
            "youtube": normalize_social(raw.get("youtube", "")),
            "twitter": normalize_social(raw.get("twitter", "")),
        },
        "description": build_long_description(
            {
                "id": bid,
                "name": name,
                "category": category,
                "city": raw.get("city", "Dallas").strip() or "Dallas",
                "state": raw.get("state", "TX").strip() or "TX",
                "address": address,
                "phone": normalize_phone(raw.get("phone", "")),
                "website": normalize_website(raw.get("website", "")),
                "description": desc_hint or "",
            }
        ),
    }
    if logo:
        row["logo"] = logo
    if gallery:
        row["gallery"] = gallery
    return row


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_batch2.py <csv-path>")
        sys.exit(1)

    csv_path = Path(sys.argv[1])
    vertical = sys.argv[2] if len(sys.argv) > 2 else "hvac"
    if not csv_path.exists():
        print(f"CSV not found: {csv_path}")
        sys.exit(1)

    existing = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    used_ids = {b["id"] for b in existing}

    with csv_path.open(encoding="utf-8", newline="") as f:
        raw_rows = list(csv.DictReader(f))

    imported: list[dict] = []
    stats = {"logo": 0, "gallery": 0, "no_images": 0}

    for i, raw in enumerate(raw_rows, 1):
        raw["_vertical"] = vertical
        print(f"[{i}/{len(raw_rows)}] {raw['business_name'][:55]}...")
        row = process_row(raw, used_ids)
        if row.get("logo"):
            stats["logo"] += 1
        if row.get("gallery"):
            stats["gallery"] += 1
        if not row.get("logo") and not row.get("gallery"):
            stats["no_images"] += 1
        imported.append(row)
        time.sleep(0.2)

    merged = existing + imported
    JSON_PATH.write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nAdded {len(imported)} businesses (total {len(merged)})")
    print(f"Logos: {stats['logo']}, with gallery: {stats['gallery']}, no images: {stats['no_images']}")


if __name__ == "__main__":
    main()
