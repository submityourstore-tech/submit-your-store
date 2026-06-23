"""Generate SEO-friendly business descriptions (2000–5000 characters)."""

from __future__ import annotations

import hashlib
import re

MIN_CHARS = 2000
MAX_CHARS = 2000

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
    "Plumbing & HVAC": "integrated plumbing, heating, and air conditioning services",
    "Air Duct Cleaning": "professional air duct cleaning and indoor air quality services",
    "HVAC Parts Supplier": "HVAC parts and equipment for contractors and homeowners",
    "Insulation Contractor": "home insulation and energy-efficiency upgrades",
}

CATEGORY_SERVICES: dict[str, list[str]] = {
    "HVAC Contractor": [
        "Central air conditioning installation and replacement",
        "Furnace and heat pump repair, tune-ups, and seasonal maintenance",
        "Ductwork design, sealing, and airflow balancing",
        "Indoor air quality upgrades including filtration and humidity control",
        "Thermostat installation including smart and programmable models",
        "Emergency HVAC service for no-cool and no-heat situations",
    ],
    "Heating Contractor": [
        "Gas and electric furnace installation and replacement",
        "Heat pump service for year-round heating and cooling",
        "Boiler repair and preventative maintenance programs",
        "Carbon monoxide safety checks and combustion analysis",
        "Radiant and zone heating troubleshooting",
        "Winter readiness inspections and filter replacement",
    ],
    "AC Repair": [
        "Same-day and next-day AC repair for residential systems",
        "Refrigerant leak detection, recovery, and recharge",
        "Compressor, capacitor, and contactor diagnostics",
        "Evaporator and condenser coil cleaning",
        "Blower motor and fan replacement",
        "Emergency cooling service during heat waves",
    ],
    "AC Contractor": [
        "New AC system sizing, load calculation, and installation",
        "High-efficiency unit upgrades and rebate guidance",
        "Mini-split and ductless cooling solutions",
        "Whole-home dehumidification and zoning options",
        "Manufacturer warranty registration and post-install support",
        "Seasonal maintenance plans to extend equipment life",
    ],
    "Plumbing & HVAC": [
        "Water heater repair and tankless installation",
        "Drain cleaning, leak detection, and pipe repair",
        "Whole-home repiping and fixture upgrades",
        "HVAC and plumbing bundled maintenance visits",
        "Gas line safety checks tied to heating equipment",
        "Commercial plumbing and mechanical support",
    ],
    "Air Duct Cleaning": [
        "Whole-home duct cleaning with HEPA-contained equipment",
        "Dryer vent cleaning to reduce fire risk",
        "Mold and microbial treatment for duct systems",
        "Register and grille cleaning and resealing",
        "Post-renovation dust removal from ductwork",
        "Indoor air quality testing and filter recommendations",
    ],
    "HVAC Parts Supplier": [
        "OEM and compatible replacement parts for major brands",
        "Motors, capacitors, contactors, and control boards",
        "Filters, refrigerant accessories, and line sets",
        "Contractor counter pickup and local delivery options",
        "Technical support for part selection and cross-reference",
        "Stock for seasonal surge and emergency repairs",
    ],
    "Insulation Contractor": [
        "Attic insulation upgrades and air sealing",
        "Spray foam and blown-in insulation options",
        "Crawl space and rim joist insulation",
        "Energy audit support and blower door coordination",
        "Soundproofing and moisture barrier installation",
        "Insulation removal and remediation when needed",
    ],
}

METRO_CONTEXT: dict[str, str] = {
    "Dallas": "the Dallas-Fort Worth metroplex, including Plano, Richardson, Irving, Garland, and surrounding North Texas communities",
    "Houston": "Greater Houston, including Katy, Sugar Land, Pearland, The Woodlands, and neighborhoods across the Gulf Coast humidity zone",
    "Austin": "Greater Austin and Central Texas, including Round Rock, Cedar Park, Pflugerville, Georgetown, and the Hill Country fringe",
}

CLIMATE_NOTES: dict[str, str] = {
    "Dallas": "North Texas weather swings from humid summers above 100 degrees F to sudden winter freezes, so heat load calculations, attic insulation, and reliable furnace backup matter for year-round comfort.",
    "Houston": "Gulf Coast humidity and long cooling seasons make dehumidification, coil maintenance, and corrosion-aware service important for Houston-area homes and businesses.",
    "Austin": "Central Texas limestone homes, rapid growth, and hot summers create unique airflow and sizing challenges that local technicians see every day across the Austin metro.",
}

EXTRA_PARAGRAPHS: list[str] = [
    "Preventative maintenance helps catch worn capacitors, weak airflow, and refrigerant issues before they turn into full system failures on the hottest or coldest days of the year.",
    "Homeowners often ask about system age, repair versus replace decisions, and whether a heat pump makes sense for their floor plan. Clear communication about options, timelines, and pricing helps every project start on the right foot.",
    "Indoor air quality has become a bigger priority for families managing allergies, pets, and tight building envelopes. Filtration upgrades, UV treatment, and proper ventilation work hand in hand with temperature control.",
    "Energy efficiency matters when utility rates fluctuate and equipment standards evolve. Modern high-SEER air conditioners, variable-speed blowers, and smart thermostats can lower monthly costs when paired with correct sizing and professional installation.",
    "Property managers and small business owners benefit from documented service history, after-hours availability, and predictable maintenance schedules that keep tenants and staff comfortable during peak load conditions.",
]

WHY_CHOOSE: list[str] = [
    "Customers value technicians who arrive prepared, explain findings in plain language, and leave work areas tidy.",
    "Transparent estimates and options help homeowners make confident decisions about repairs and upgrades.",
    "Local ownership often means faster dispatch, familiar neighborhoods, and accountability after the job is done.",
    "Strong community reputation is built one service call at a time, especially when emergencies happen after normal business hours.",
    "Investing in training and up-to-date diagnostic tools leads to accurate fixes instead of repeated callbacks.",
]

BOILERPLATE_RE = re.compile(
    r"(?:They provide|The company provides)\s+.+\s+for\s+(?:residential and commercial customers|homeowners, landlords, and commercial clients)\.?",
    re.I,
)
SHORT_INTRO_RE = re.compile(
    r"^\s*is\s+(?:an|a)\s+.+?\s+serving\s+[^.]+\.\s*",
    re.I,
)
RATING_RE = re.compile(
    r"\b\d\.\d\s+stars?\b|\+\d+\s+reviews?\b|\b\d{1,3}(?:,\d{3})+\s+reviews?\b",
    re.I,
)
PHONE_RE = re.compile(r"\+?\d[\d\s().-]{8,}\d")
CTA_RE = re.compile(
    r"\b(?:call today!?|schedule now!?|contact us today!?|call us now!?)\b",
    re.I,
)
REVIEW_FRAGMENT_RE = re.compile(
    r"\b(?:won't use|love them|best hvac|more\.{3}|…)\b",
    re.I,
)


def _normalize_dashes(text: str) -> str:
    return text.replace("\u2013", "-").replace("\u2014", "-").replace("\ufffd", "")


def _strip_template_blocks(text: str, name: str, category: str, city: str, state: str) -> str:
    text = _normalize_dashes(text)
    text = re.sub(rf"^{re.escape(name)}\.?\s*", "", text, flags=re.I)
    text = BOILERPLATE_RE.sub("", text)
    text = SHORT_INTRO_RE.sub("", text)
    text = re.sub(
        r"When comfort, reliability, and fair pricing matter.+?unnecessary delays\.?\s*",
        "",
        text,
        flags=re.I | re.S,
    )
    text = re.sub(
        rf"{re.escape(name)}\s+is\s+(?:an|a)\s+.+?\s+serving\s+{re.escape(city)},\s*{re.escape(state)}\.\s*",
        "",
        text,
        flags=re.I,
    )
    for metro in METRO_CONTEXT.values():
        text = text.replace(metro, " ")
    text = re.sub(r"Services offered by .+$", "", text, flags=re.I | re.S)
    text = re.sub(r"Why choose .+$", "", text, flags=re.I | re.S)
    text = re.sub(r"Residential customers throughout .+$", "", text, flags=re.I | re.S)
    text = re.sub(r"Commercial and light industrial .+$", "", text, flags=re.I | re.S)
    text = re.sub(r"Visit or mail to .+$", "", text, flags=re.I | re.S)
    text = re.sub(r"Call \+?\d[\d\s().-]{8,}\d .+$", "", text, flags=re.I | re.S)
    return text


def _clean_hint(text: str, name: str, category: str, city: str, state: str) -> str:
    hint = _strip_template_blocks(text or "", name, category, city, state)
    hint = RATING_RE.sub("", hint)
    hint = PHONE_RE.sub("", hint)
    hint = CTA_RE.sub("", hint)
    hint = re.sub(r"\s{2,}", " ", hint).strip(" .,-")
    hint = re.sub(r"^provides\s+", "", hint, flags=re.I)

    if not hint or hint.lower() == name.lower() or len(hint) < 25:
        return ""
    if REVIEW_FRAGMENT_RE.search(hint):
        return ""
    if hint.lower().startswith("is an ") or hint.lower().startswith("is a "):
        return ""
    if category.lower() in hint.lower() and len(hint) < 80:
        return ""

    sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", hint) if s.strip()]
    kept: list[str] = []
    for sentence in sentences:
        low = sentence.lower()
        if "they provide" in low and "residential" in low:
            continue
        if sentence.lower().startswith("is an ") or sentence.lower().startswith("is a "):
            continue
        if len(sentence) < 20:
            continue
        kept.append(sentence)
        if len(" ".join(kept)) > 500:
            break

    hint = " ".join(kept[:2])
    if len(hint) > 280:
        hint = hint[:280].rsplit(" ", 1)[0] + "."
    if hint and not hint.endswith((".", "!", "?")):
        hint += "."
    return hint


def _pick(items: list[str], seed: str, count: int) -> list[str]:
    if not items:
        return []
    digest = hashlib.sha256(seed.encode()).hexdigest()
    start = int(digest[:8], 16) % len(items)
    return [items[(start + i) % len(items)] for i in range(min(count, len(items)))]


def _trim_to_max(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    trimmed = text[: max_chars + 1]
    last = max(trimmed.rfind(". "), trimmed.rfind("! "), trimmed.rfind("? "))
    if last > max_chars - 120:
        return trimmed[: last + 1].strip()
    return text[:max_chars].rsplit(" ", 1)[0].strip() + "."


def _fit_target(text: str, target: int, seed: str) -> str:
    text = _trim_to_max(text, target)
    pool = _pick(EXTRA_PARAGRAPHS + WHY_CHOOSE, seed, len(EXTRA_PARAGRAPHS) + len(WHY_CHOOSE))
    fillers = [
        " Preventative maintenance, honest recommendations, and responsive local service help keep your home or business comfortable in every season.",
        " From tune-ups to full replacements, experienced technicians focus on safe work, clear pricing, and lasting results.",
        " Local crews understand regional weather, common equipment brands, and the comfort needs of nearby neighborhoods.",
    ]

    idx = 0
    while len(text) < target:
        if idx < len(pool):
            extra = pool[idx]
            idx += 1
        else:
            extra = fillers[(idx - len(pool)) % len(fillers)]
            idx += 1
        candidate = f"{text} {extra.strip()}"
        if len(candidate) <= target:
            text = candidate
            continue
        room = target - len(text) - 1
        if room > 40:
            text = f"{text} {extra.strip()[:room].rsplit(' ', 1)[0]}."
        else:
            break

    closing = (
        "Home and business owners can request estimates, schedule maintenance, "
        "and ask about warranty options when contacting the office."
    )
    for word in closing.split():
        candidate = f"{text} {word}"
        if len(candidate) <= target:
            text = candidate
        else:
            break
    return _trim_to_max(text, target)


def _social_note(row: dict) -> str:
    social = row.get("social") or {}
    labels: list[str] = []
    for key, label in (
        ("facebook", "Facebook"),
        ("instagram", "Instagram"),
        ("linkedin", "LinkedIn"),
        ("youtube", "YouTube"),
        ("twitter", "X (Twitter)"),
    ):
        url = social.get(key)
        if url and str(url).strip().lower() not in {"", "not found", "n/a"}:
            labels.append(label)
    if not labels:
        return ""
    if len(labels) == 1:
        return f"Follow {row['name']} on {labels[0]} for updates, seasonal tips, and service announcements."
    return (
        f"Follow {row['name']} on {', '.join(labels[:-1])}, and {labels[-1]} "
        f"for updates, seasonal tips, and service announcements."
    )


def build_long_description(
    row: dict,
    *,
    min_chars: int = MIN_CHARS,
    max_chars: int = MAX_CHARS,
) -> str:
    name = row["name"]
    category = row.get("category") or "HVAC Contractor"
    city = row.get("city") or "Dallas"
    state = row.get("state") or "TX"
    area = f"{city}, {state}"
    metro = METRO_CONTEXT.get(city, f"{city} and nearby {state} communities")
    climate = CLIMATE_NOTES.get(city, "Regional weather patterns in Texas make reliable heating and cooling essential for comfort and property protection.")
    article, label = CATEGORY_PHRASE.get(category, ("a", category.lower()))
    services = SERVICE_PHRASE.get(category, "trusted HVAC and comfort services")
    seed = row.get("id") or name

    hint_source = row.get("description_hint") or row.get("description") or ""
    hint = _clean_hint(hint_source, name, category, city, state)
    service_lines = CATEGORY_SERVICES.get(category, CATEGORY_SERVICES["HVAC Contractor"])
    picked_services = _pick(service_lines, seed, 4)

    address = (row.get("address") or "").strip()
    phone = (row.get("phone") or "").strip()
    website = (row.get("website") or "").strip()

    intro = (
        f"{name} is {article} {label} based in {area}. "
        f"The company provides {services} for homeowners and commercial clients across {metro}. "
    )
    if hint:
        intro += hint + " "
    intro += climate

    services_block = (
        f"Services include "
        + ", ".join(picked_services[:-1])
        + f", and {picked_services[-1]}. "
        f"Technicians diagnose airflow, refrigerant, electrical, and safety issues so repairs fix root causes."
    )

    customers = (
        f"Residential and commercial customers in {city} depend on reliable scheduling, maintenance plans, "
        f"and emergency support when systems fail during peak summer heat or winter cold snaps."
    )

    why = _pick(WHY_CHOOSE, seed + "-why", 1)[0]
    why_block = f"Why choose {name}? {why}"

    contact_bits = []
    if address:
        contact_bits.append(f"Office: {address}.")
    if phone:
        contact_bits.append(f"Call {phone} for service or estimates.")
    if website:
        contact_bits.append(f"Learn more at {website}.")
    social = _social_note(row)
    if social:
        contact_bits.append(social)
    contact_block = " ".join(contact_bits)

    parts = [intro, services_block, customers, why_block, contact_block]
    text = " ".join(parts)
    text = _fit_target(text, max_chars, seed)
    text = _normalize_dashes(text)
    text = re.sub(r" {2,}", " ", text).strip()
    return text
