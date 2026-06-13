"""Central business category classification rules."""

from __future__ import annotations

import re
import unicodedata

HVAC_SUBCATEGORIES: dict[str, str] = {
    "hvac-contractor": "HVAC Contractor",
    "heating-contractor": "Heating Contractor",
    "ac-repair": "AC Repair",
    "ac-contractor": "AC Contractor",
    "plumbing-hvac": "Plumbing & HVAC",
    "air-duct-cleaning": "Air Duct Cleaning",
    "hvac-parts-supplier": "HVAC Parts Supplier",
    "insulation-contractor": "Insulation Contractor",
}

RAW_CATEGORY_MAP: dict[str, str] = {
    "hvac contractor": "hvac-contractor",
    "heating contractor": "heating-contractor",
    "air conditioning repair service": "ac-repair",
    "air conditioning contractor": "ac-contractor",
    "plumber": "plumbing-hvac",
    "air duct cleaning service": "air-duct-cleaning",
    "hvac parts supplier": "hvac-parts-supplier",
    "insulation contractor": "insulation-contractor",
    "plumbing & hvac": "plumbing-hvac",
}

HIDDEN_NON_HVAC: dict[str, tuple[str, str, str]] = {
    "roofing contractor": ("roofing", "Roofing Contractor", "roofing-contractor"),
    "pest control service": ("pest-control", "Pest Control Service", "pest-control-service"),
}

HVAC_NAME = re.compile(r"hvac|air(?:\s|-)?condition|heating|cooling|a/c|\bac\b|furnace", re.I)
PLUMBING_NAME = re.compile(r"plumb", re.I)


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def _normalize_raw(raw: str) -> str:
    return raw.split("·")[0].strip().lower()


def classify_business(name: str, raw_category: str) -> dict[str, str]:
    raw = _normalize_raw(raw_category or "")
    name_text = name.strip()

    if not raw or raw in {"not found", "n/a"}:
        raw = "hvac contractor"

    if "permanently closed" in raw:
        slug = slugify(raw)
        return {
            "vertical": "hvac",
            "category": raw.title(),
            "categorySlug": slug,
            "status": "hidden",
        }

    if raw in HIDDEN_NON_HVAC:
        vertical, label, slug = HIDDEN_NON_HVAC[raw]
        return {
            "vertical": vertical,
            "category": label,
            "categorySlug": slug,
            "status": "hidden",
        }

    slug = RAW_CATEGORY_MAP.get(raw)
    if not slug:
        slug = next(
            (s for s, label in HVAC_SUBCATEGORIES.items() if label.lower() == raw),
            None,
        )
    if not slug and raw in HVAC_SUBCATEGORIES:
        slug = raw
    if not slug:
        slug = slugify(raw)
        if slug not in HVAC_SUBCATEGORIES:
            slug = "hvac-contractor"

    if PLUMBING_NAME.search(name_text) and HVAC_NAME.search(name_text):
        slug = "plumbing-hvac"

    return {
        "vertical": "hvac",
        "category": HVAC_SUBCATEGORIES.get(slug, slug.replace("-", " ").title()),
        "categorySlug": slug,
        "status": "active",
    }


def is_hvac_subcategory(slug: str) -> bool:
    return slug in HVAC_SUBCATEGORIES
