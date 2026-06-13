"""
Enrich HVAC CSV: clean fields, fetch missing info from websites, generate unique descriptions.
Output: data/businesses.json
"""

from __future__ import annotations

import csv
import json
import re
import ssl
import time
import unicodedata
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
RAW_CSV = ROOT / "data" / "hvac_raw.csv"
OUT_JSON = ROOT / "data" / "businesses.json"

NOT_FOUND = {"not found", "n/a", ""}
PLACEHOLDER_EMAILS = {
    "email@domain.com",
    "example@domain.com",
    "info@yourcompany.com",
    "aboutus-historica_images-265x300@2x.avif",
}
USER_AGENT = "SubmitYourStoreBot/1.0 (+https://submityourstore.com)"
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

CATEGORY_MAP = {
    "hvac contractor": "HVAC Contractor",
    "heating contractor": "Heating Contractor",
    "air conditioning repair service": "AC Repair",
    "air conditioning contractor": "AC Contractor",
    "plumber": "Plumbing & HVAC",
    "air duct cleaning service": "Air Duct Cleaning",
    "air conditioning system supplier": "HVAC Parts Supplier",
    "insulation contractor": "Insulation Contractor",
}


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def clean_category(raw: str) -> str:
    base = raw.split("·")[0].split("\ufffd")[0].strip().lower()
    base = re.sub(r"[^\w\s&/-]", "", base).strip()
    for key, label in CATEGORY_MAP.items():
        if key in base:
            return label
    return base.title() if base else "HVAC Services"


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


def parse_review_count(raw: str) -> int:
    if is_missing(raw):
        return 0
    return int(re.sub(r"[^\d]", "", raw) or "0")


def normalize_website(raw: str) -> str | None:
    if is_missing(raw):
        return None
    url = raw.strip().lower()
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


def fetch_url(url: str, timeout: int = 12) -> str | None:
    try:
        req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
        with urlopen(req, timeout=timeout, context=SSL_CTX) as resp:
            ctype = resp.headers.get("Content-Type", "")
            if "text" not in ctype and "html" not in ctype:
                return None
            return resp.read(180_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return None


def extract_meta(html: str) -> dict[str, str]:
    out: dict[str, str] = {}
    for match in re.finditer(
        r'<meta\s+(?:[^>]*?\s)?(?:name|property)=["\']([^"\']+)["\']\s+content=["\']([^"\']*)["\']',
        html,
        re.I,
    ):
        out[match.group(1).lower()] = unescape(match.group(2).strip())
    for match in re.finditer(
        r'<meta\s+(?:[^>]*?)content=["\']([^"\']*)["\']\s+(?:name|property)=["\']([^"\']+)["\']',
        html,
        re.I,
    ):
        out[match.group(2).lower()] = unescape(match.group(1).strip())
    title = re.search(r"<title[^>]*>([^<]+)</title>", html, re.I)
    if title:
        out["title"] = unescape(title.group(1).strip())
    return out


def extract_emails(html: str) -> list[str]:
    emails = re.findall(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", html)
    clean = []
    for e in emails:
        low = e.lower()
        if low in PLACEHOLDER_EMAILS:
            continue
        if any(x in low for x in ("example.", "domain.com", "sentry", "wixpress", "schema.org")):
            continue
        if low not in clean:
            clean.append(low)
    return clean


def looks_like_review_text(text: str) -> bool:
    if len(text) > 280:
        return True
    markers = ("more", "…", "...", "responsive", "helpful", "knocks it out", "resolved")
    low = text.lower()
    return any(m in low for m in markers)


def service_phrase(category: str) -> str:
    mapping = {
        "HVAC Contractor": "heating, ventilation, and air conditioning services",
        "Heating Contractor": "heating system installation, repair, and maintenance",
        "AC Repair": "air conditioning repair and emergency cooling service",
        "AC Contractor": "air conditioning installation and replacement",
        "Plumbing & HVAC": "plumbing and HVAC solutions for homes and businesses",
        "Air Duct Cleaning": "professional air duct cleaning and indoor air quality services",
        "HVAC Parts Supplier": "HVAC parts and equipment for contractors and homeowners",
        "Insulation Contractor": "home insulation and energy-efficiency upgrades",
    }
    return mapping.get(category, "trusted HVAC and comfort services")


def category_article(category: str) -> str:
    return "an" if category[0].lower() in "aeiou" else "a"


def build_description(
    name: str,
    category: str,
    city: str,
    state: str,
    website_hint: str | None,
) -> str:
    area = f"{city}, {state}" if city and state else "the Dallas area"
    services = service_phrase(category)
    article = category_article(category)

    hint = ""
    if website_hint and len(website_hint) > 40 and not looks_like_review_text(website_hint):
        hint = f" {website_hint[:220].rstrip('.')}."

    return (
        f"{name} is {article} {category.lower()} serving {area}."
        f" The company provides {services} for residential and commercial customers."
        f"{hint} "
        f"Contact {name} for estimates, service calls, and seasonal HVAC maintenance in Dallas–Fort Worth."
    ).replace("  ", " ").strip()


def enrich_from_website(row: dict, website: str) -> None:
    html = fetch_url(website)
    if not html:
        return
    meta = extract_meta(html)
    if is_missing(row.get("email")):
        emails = extract_emails(html)
        if emails:
            row["email"] = emails[0]
    desc_hint = (
        meta.get("og:description")
        or meta.get("description")
        or meta.get("twitter:description")
        or ""
    )
    if desc_hint and not looks_like_review_text(desc_hint):
        row["website_description"] = desc_hint[:500]
    if is_missing(row.get("address")) and meta.get("og:street-address"):
        row["address"] = meta.get("og:street-address", "")


def process_row(raw: dict) -> dict:
    name = raw["business_name"].strip()
    category = clean_category(raw.get("category", ""))
    address = raw.get("address", "").strip()
    website = normalize_website(raw.get("website", ""))
    email = raw.get("email", "").strip().lower()
    if is_missing(email) or email in PLACEHOLDER_EMAILS:
        email = None

    rating_raw = raw.get("rating", "").strip()
    rating = float(rating_raw) if rating_raw and rating_raw.replace(".", "").isdigit() else None
    review_count = parse_review_count(raw.get("review_count", ""))

    row = {
        "id": slugify(name),
        "name": name,
        "category": category,
        "categorySlug": slugify(category),
        "address": None if is_missing(address) else address,
        "city": raw.get("city", "Dallas").strip(),
        "state": raw.get("state", "TX").strip(),
        "website": website,
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
        "website_description": None,
    }

    if website:
        enrich_from_website(row, website)
        time.sleep(0.35)

    hint = row.pop("website_description", None)
    raw_desc = raw.get("description_raw", "").strip()
    if hint:
        desc_source = hint
    elif raw_desc and not looks_like_review_text(raw_desc) and raw_desc != address:
        desc_source = raw_desc
    else:
        desc_source = None

    row["description"] = build_description(
        name,
        category,
        row["city"],
        row["state"],
        desc_source,
    )
    return row


def main() -> None:
    with RAW_CSV.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    enriched = []
    for i, raw in enumerate(rows, 1):
        print(f"[{i}/{len(rows)}] {raw['business_name'][:50]}...")
        enriched.append(process_row(raw))

    OUT_JSON.write_text(json.dumps(enriched, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nSaved {len(enriched)} businesses -> {OUT_JSON}")


if __name__ == "__main__":
    main()
