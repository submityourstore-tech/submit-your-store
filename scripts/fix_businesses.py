"""Clean business descriptions and fill missing addresses."""

from __future__ import annotations

import json
import re
import ssl
import sys
from html import unescape
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

sys.path.insert(0, str(Path(__file__).resolve().parent))
from description_builder import build_long_description

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"
USER_AGENT = "SubmitYourStoreBot/1.0 (+https://submityourstore.com)"
SSL_CTX = ssl.create_default_context()
SSL_CTX.check_hostname = False
SSL_CTX.verify_mode = ssl.CERT_NONE

CATEGORY_PHRASE: dict[str, tuple[str, str]] = {
    "HVAC Contractor": ("an", "HVAC contractor"),
    "Heating Contractor": ("a", "heating contractor"),
    "AC Repair": ("an", "AC repair company"),
    "AC Contractor": ("an", "AC contractor"),
    "Plumbing & HVAC": ("a", "plumbing and HVAC company"),
    "Air Duct Cleaning": ("an", "air duct cleaning company"),
    "HVAC Parts Supplier": ("an", "HVAC parts supplier"),
    "Insulation Contractor": ("an", "insulation contractor"),
}

SERVICE_PHRASE: dict[str, str] = {
    "HVAC Contractor": "heating, ventilation, and air conditioning services",
    "Heating Contractor": "heating system installation, repair, and maintenance",
    "AC Repair": "air conditioning repair and emergency cooling service",
    "AC Contractor": "air conditioning installation and replacement",
    "Plumbing & HVAC": "plumbing and HVAC solutions for homes and businesses",
    "Air Duct Cleaning": "professional air duct cleaning and indoor air quality services",
    "HVAC Parts Supplier": "HVAC parts and equipment for contractors and homeowners",
    "Insulation Contractor": "home insulation and energy-efficiency upgrades",
}

CONTACT_SUFFIX = re.compile(
    r"\s*Contact .+ for estimates, service calls, and seasonal HVAC maintenance in Dallas[–-]Fort Worth\.?\s*$",
    re.I,
)
BOILERPLATE = re.compile(
    r"The company provides .+? for residential and commercial customers\.?\s*",
    re.I,
)
FIRST_SENTENCE = re.compile(r"^.+? serving [^.]+\.\s*", re.I | re.S)


def fetch_html(url: str) -> str | None:
    try:
        req = Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html"})
        with urlopen(req, timeout=15, context=SSL_CTX) as resp:
            return resp.read(250_000).decode("utf-8", errors="ignore")
    except (HTTPError, URLError, TimeoutError, ValueError):
        return None


def extract_address_from_html(html: str) -> str | None:
    for pattern in (
        r'"streetAddress"\s*:\s*"([^"]+)"[^}]*"addressLocality"\s*:\s*"([^"]+)"[^}]*"addressRegion"\s*:\s*"([^"]+)"[^}]*"postalCode"\s*:\s*"([^"]+)"',
        r'itemprop="streetAddress"[^>]*>([^<]+)</',
        r"(\d{3,6}\s+[A-Za-z0-9\s\.#-]+(?:St|Street|Ave|Avenue|Rd|Road|Dr|Drive|Ln|Lane|Blvd|Boulevard|Fwy|Hwy|Pkwy|Way|Ct|Court)(?:\s+[A-Za-z0-9#-]+)?,\s*(?:Dallas|Richardson|Mesquite|Frisco|Rowlett|Farmers Branch|Sunnyvale|Plano)[^<,\n]{0,40})",
    ):
        match = re.search(pattern, html, re.I | re.S)
        if not match:
            continue
        if match.lastindex == 4:
            street, city, state, zipcode = match.groups()
            return f"{street.strip()}, {city.strip()}, {state.strip()} {zipcode.strip()}, United States"
        return re.sub(r"\s{2,}", " ", unescape(match.group(1).strip()))
    return None


def fetch_missing_address(row: dict) -> str | None:
    if row.get("website"):
        html = fetch_html(row["website"])
        if html:
            addr = extract_address_from_html(html)
            if addr:
                return addr
    maps_url = row.get("googleMapsUrl")
    if maps_url:
        html = fetch_html(maps_url)
        if html:
            addr = extract_address_from_html(html)
            if addr:
                return addr
    return None


def clean_hint(text: str, name: str) -> str:
    hint = text.strip()
    hint = CONTACT_SUFFIX.sub("", hint)
    hint = BOILERPLATE.sub("", hint)
    hint = FIRST_SENTENCE.sub("", hint)
    hint = re.sub(rf"^{re.escape(name)}\.?\s*", "", hint, flags=re.I)
    hint = re.sub(r"!+\.", "!", hint)
    hint = re.sub(r"\.\.+", ".", hint)
    hint = re.sub(r"\s{2,}", " ", hint).strip(" .")
    if not hint or hint.lower() == name.lower():
        return ""
    if len(hint) < 20:
        return ""
    if hint.endswith(name):
        hint = hint[: -len(name)].strip(" .")
    if not hint.endswith((".", "!", "?")):
        hint += "."
    return hint


def rebuild_description(row: dict) -> str:
    name = row["name"]
    category = row["category"]
    city = row.get("city") or "Dallas"
    state = row.get("state") or "TX"
    article, label = CATEGORY_PHRASE.get(category, ("a", category.lower()))
    services = SERVICE_PHRASE.get(category, "trusted HVAC and comfort services")
    area = f"{city}, {state}"

    hint = clean_hint(row.get("description", ""), name)

    parts = [
        f"{name} is {article} {label} serving {area}.",
        f"They provide {services} for residential and commercial customers.",
    ]
    if hint:
        parts.append(hint)
    return " ".join(parts)


def normalize_address(address: str | None) -> str | None:
    if not address:
        return None
    cleaned = re.sub(r"\s{2,}", " ", address.strip())
    if cleaned.lower() in {"not found", "n/a", ""}:
        return None
    return cleaned


def main() -> None:
    rows = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    filled = 0
    for row in rows:
        row["address"] = normalize_address(row.get("address"))
        if not row["address"]:
            addr = fetch_missing_address(row)
            if addr:
                row["address"] = normalize_address(addr)
                filled += 1
                print(f"Filled address: {row['name']} -> {row['address']}")
        row["description"] = build_long_description(row)

    JSON_PATH.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Updated {len(rows)} businesses ({filled} addresses filled)")


if __name__ == "__main__":
    main()
