"""
Import hvac_faq_data_50.csv into businesses.json:
hours, Google rating/review count, customer reviews, and FAQs.
Owner replies, marketing posts, and promotional content are filtered out.
"""

from __future__ import annotations

import csv
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CSV_PATHS = [
    ROOT / "data" / "hvac_faq_data_50.csv",
    ROOT / "data" / "hvac_faq_data_51_200_v2.csv",
]
BUSINESSES_PATH = ROOT / "data" / "businesses.json"

NOT_FOUND = {"not found", "n/a", ""}

OWNER_PATTERNS = [
    re.compile(p, re.I)
    for p in [
        r"^thank you\b",
        r"^thanks\b",
        r"^we(?:'re| are) (?:glad|thrilled|delighted|excited|ecstatic|so glad)",
        r"^we appreciate",
        r"^we truly appreciate",
        r"^we really appreciate",
        r"^wow[!,]",
        r"^hey [a-z]",
        r"^hi [a-z]",
        r"^hello [a-z]",
        r"^mr\.?\s",
        r"^still family-owned",
        r"^for just \$",
        r"^new hvac systems",
        r"^summer savings",
        r"^giveaway time",
        r"^did you know\?",
        r"^schedule your service today",
        r"^visit (?:our|https?://)",
        r"^contact us",
        r"^call us",
        r"^call \d",
        r"^📞",
        r"^🎁",
        r"#\w+",
        r"offer valid",
        r"learn more:",
        r"seo keywords",
        r"provides (?:ac|air|hvac|heating|plumbing|commercial|residential)",
        r"is a (?:professional|locally owned|bbb-accredited)",
        r"offers (?:commercial|residential|24/7|emergency)",
        r"we offer 24/7",
        r"we restored reliable",
        r"we've been serving",
        r"we optimize",
        r"we specialize",
        r"we understand the importance",
        r"trusted (?:furnace|for )",
        r"upgrade your home",
        r"improve your indoor air",
        r"poor indoor air quality can be",
        r"many homeowners don(?:'|')t know",
        r"changing your air filter",
        r"as temperatures rise",
        r"summer is here",
        r"texas spring is around",
        r"cooling issues during warmer",
        r"is your (?:ac|outdoor ac|furnace)",
        r"what happens if a water heater",
        r"gas leaks are dangerous",
        r"save big where it matters",
        r"new ac put in",
        r"ensure your heating",
        r"if you(?:'|')re facing issues with your home(?:'|')s hvac",
        r"plumbing diagnostics, repair",
        r"climate tech air conditioning & heating offers",
        r"harlen johnson hvac, plumbing & electrical provides",
        r"ac repair & replacement in dallas",
        r"this poor old soul",
    ]
]

ADDRESS_PATTERN = re.compile(
    r"\d{1,6}\s+[\w\s.#]+(?:,\s*)?(?:[A-Za-z\s]+,\s*)?(?:TX|Texas)\s*\d{5}", re.I
)
PLUS_CODE_PATTERN = re.compile(r"^[A-Z0-9]{2,8}\+[A-Z0-9]{2,3}\b", re.I)

PROMO_PATTERNS = [
    re.compile(p, re.I)
    for p in [
        r"\bschedule (?:your|a) service\b",
        r"\bemergency repair\b.*\bcall\b",
        r"\blimited time\b",
        r"\bspecial offer\b",
        r"\bvisit our website\b",
        r"\bmaintenance plan\b",
        r"#\w+",
    ]
]

CITY_TIMEZONE = {
    "dallas": "America/Chicago",
    "houston": "America/Chicago",
    "austin": "America/Chicago",
    "san antonio": "America/Chicago",
    "fort worth": "America/Chicago",
}


def timezone_for_city(city: str, state: str = "TX") -> str:
    if state.upper() == "TX":
        return CITY_TIMEZONE.get(city.strip().lower(), "America/Chicago")
    return "America/Chicago"


def looks_like_address(text: str) -> bool:
    t = text.strip()
    if PLUS_CODE_PATTERN.match(t):
        return True
    if ADDRESS_PATTERN.search(t):
        return True
    if re.search(r"\bUnited States\b", t, re.I) and re.search(r"\d{5}", t) and len(t) < 120:
        return True
    if re.match(r"^\d{1,6}\s+\w", t) and re.search(r",\s*[A-Z]{2}\s*\d{5}", t):
        return True
    return False


def looks_like_promo(text: str) -> bool:
    if len(text) > 280 and not re.search(r"\b(i |my |we |our )", text, re.I):
        return True
    return any(p.search(text) for p in PROMO_PATTERNS)


def is_displayable_review(text: str) -> bool:
    t = text.strip()
    if len(t) < 12:
        return False
    if looks_like_address(t):
        return False
    if looks_like_promo(t):
        return False
    return True


def filter_displayable_reviews(reviews: list[str]) -> list[str]:
    out: list[str] = []
    for review in reviews:
        cleaned = review.strip()
        if not is_displayable_review(cleaned):
            continue
        if cleaned not in out:
            out.append(cleaned)
    return out

CUSTOMER_HINTS = [
    re.compile(p, re.I)
    for p in [
        r"\bmy (?:ac|air|home|kitchen|unit|experience|office)\b",
        r"\bour (?:ac|home|kitchen|sink|system|unit)\b",
        r"\bi (?:called|recommend|highly|honestly|feel|would|had|was|am)\b",
        r"\bwe (?:called|have used|used|had|were|would)\b",
        r"\bshowed up\b",
        r"\bcame out\b",
        r"\bfixed (?:it|the|my|our)\b",
        r"\bdo not use\b",
        r"\bscamming\b",
        r"\bunfortunately\b",
        r"\bworth (?:all|the money)\b",
        r"\b10/10\b",
        r"\bnew customer\b",
        r"\bgo to company\b",
        r"\bover \d+ years\b",
        r"\bsame day\b",
        r"\bby \d+am\b",
        r"\bby \d+pm\b",
    ]
]


def norm_name(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", text.lower())


def clean_review(text: str) -> str:
    text = text.strip().strip('"').strip("'")
    text = re.sub(r"\s+", " ", text)
    return text


def is_missing(value: str | None) -> bool:
    if not value:
        return True
    return value.strip().lower() in NOT_FOUND


def looks_like_owner(text: str, business_name: str) -> bool:
    if is_missing(text):
        return True

    lower = text.lower()
    if len(text) > 600 and not any(h.search(text) for h in CUSTOMER_HINTS):
        return True

    biz_tokens = [t for t in re.split(r"[^a-z0-9]+", business_name.lower()) if len(t) > 3]
    if len(biz_tokens) >= 2 and all(t in lower for t in biz_tokens[:2]):
        if not any(h.search(text) for h in CUSTOMER_HINTS):
            return True

    for pattern in OWNER_PATTERNS:
        if pattern.search(text):
            return True

    if re.search(r"thank you for (?:taking|sharing|leaving|the|your)", lower):
        return True
    if re.search(r"thanks for (?:the|your|sharing|taking)", lower):
        return True
    if re.search(r"we look forward to serving", lower):
        return True
    if re.search(r"your recommendation means a lot", lower):
        return True
    if re.search(r"means a lot to us", lower):
        return True
    if re.search(r"we strive to provide", lower):
        return True
    if re.search(r"it was an absolute joy helping you", lower):
        return True
    if re.search(r"will let .+ know about this", lower):
        return True

    return False


def extract_customer_reviews(row: dict[str, str]) -> list[str]:
    business_name = row["business_name"]
    reviews: list[str] = []
    for key in ("top_review_1", "top_review_2", "top_review_3"):
        raw = clean_review(row.get(key, ""))
        if is_missing(raw):
            continue
        if looks_like_owner(raw, business_name):
            continue
        if raw not in reviews:
            reviews.append(raw)
    return filter_displayable_reviews(reviews)


FAQ_RULES: list[tuple[re.Pattern[str], str, str]] = [
    (
        re.compile(r"\b(?:fast|quick(?:ly)?|same day|less than \d+|within \d+|arrived by|showed up|minutes|hour away)\b", re.I),
        "How quickly can they respond?",
        "Customers mention {snippet}",
    ),
    (
        re.compile(r"\b(?:fair price|pricing|charged|service charge|expensive|cost|money|worth)\b", re.I),
        "What do customers say about pricing?",
        "Reviewers note {snippet}",
    ),
    (
        re.compile(r"\b(?:professional|courteous|respectful|friendly|prompt|efficient|honest|transparent|upfront)\b", re.I),
        "Are technicians professional and honest?",
        "Customers describe {snippet}",
    ),
    (
        re.compile(r"\b(?:explained|communication|clear(?:ly)?|understand)\b", re.I),
        "Do they explain the work clearly?",
        "According to reviews, {snippet}",
    ),
    (
        re.compile(r"\b(?:scheduling|appointment|schedule)\b", re.I),
        "Is scheduling easy?",
        "Customers report {snippet}",
    ),
    (
        re.compile(r"\b(?:recommend|highly|go to company|new customer|would call again|10/10)\b", re.I),
        "Would customers recommend them?",
        "Yes — {snippet}",
    ),
    (
        re.compile(r"\b(?:fixed|diagnos|repair|install|tune-up|replaced|working perfectly)\b", re.I),
        "How is the quality of their HVAC work?",
        "Customers share that {snippet}",
    ),
    (
        re.compile(r"\b(?:emergency|1am|overnight|after hours|24/7|weekend|holiday)\b", re.I),
        "Do they help with urgent or after-hours issues?",
        "Reviews indicate {snippet}",
    ),
    (
        re.compile(r"\b(?:wrong|unfortunately|complaint|broken|scam|do not use)\b", re.I),
        "Are there any concerns from customers?",
        "Some reviewers mention {snippet}",
    ),
    (
        re.compile(r"\b(?:years|long time|over \d+ years|for \d+ years)\b", re.I),
        "Do customers use them long-term?",
        "Long-term customers say {snippet}",
    ),
]


def faq_snippet(text: str) -> str:
    text = text.strip()
    if text and text[0].isupper() and len(text) > 1:
        return text[0].lower() + text[1:]
    return text


def snippet_from_review(text: str, max_len: int | None = None) -> str:
    text = text.strip()
    if max_len is not None and len(text) > max_len:
        cut = text[: max_len - 1].rsplit(" ", 1)[0]
        text = f"{cut}…"
    return faq_snippet(text)


def parse_review_count(raw: str) -> int:
    if is_missing(raw):
        return 0
    return int(re.sub(r"[^\d]", "", raw) or "0")


def parse_rating(raw: str) -> float | None:
    if is_missing(raw):
        return None
    try:
        return round(float(raw.strip()), 1)
    except ValueError:
        return None


def parse_hours_status(business_hours: str, weekly_hours: str) -> str | None:
    bh = (business_hours or "").strip()
    if not is_missing(bh):
        if re.search(r"open 24", bh, re.I):
            return "Open 24 Hrs"
        return bh

    wh = (weekly_hours or "").strip()
    if is_missing(wh):
        return None

    if len(re.findall(r"open 24 hours", wh, re.I)) >= 5:
        return "Open 24 Hrs"

    closed_match = re.search(r"closed\s*·\s*opens?\s*([^,\n]+)", wh, re.I)
    if closed_match:
        return f"Closed · Opens {closed_match.group(1).strip()}"

    return None


def parse_weekly_hours(weekly_hours: str) -> list[dict[str, str]] | None:
    if is_missing(weekly_hours):
        return None

    text = re.sub(r"[\u200b-\u200d\ufeff\ue000-\uf8ff]", "", weekly_hours)
    text = text.replace("Suggest new hours", "").strip()
    if not text:
        return None

    # New format: Sunday: Closed||Monday: 7 am–6 pm||...
    if "||" in text:
        schedule: list[dict[str, str]] = []
        for part in text.split("||"):
            part = part.strip()
            if ":" not in part:
                continue
            day, _, hours = part.partition(":")
            day = day.strip()
            hours = hours.strip()
            if day and hours:
                schedule.append({"day": day, "hours": hours})
        return schedule or None

    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    schedule: list[dict[str, str]] = []
    for day in days:
        pattern = rf"{day}\s*([^A-Z]*(?:[AaPp][Mm])?[^A-Z]*?)(?=(?:{'|'.join(d for d in days if d != day)})|$)"
        match = re.search(pattern, text, re.I)
        if match:
            hours = re.sub(r"\s+", " ", match.group(1)).strip()
            if hours:
                schedule.append({"day": day, "hours": hours})

    return schedule or None


def build_about_blocks(
    name: str,
    category: str,
    city: str,
    state: str,
    description: str,
    reviews: list[str],
) -> list[dict]:
    desc = re.sub(r"\s+", " ", description or "").strip()
    blocks: list[dict] = []

    intro_end = len(desc)
    for marker in ("Services include", "Why choose", "Technicians diagnose"):
        idx = desc.find(marker)
        if 80 < idx < intro_end:
            intro_end = idx
    intro = desc[:intro_end].strip().rstrip(".")
    if intro:
        blocks.append({"heading": f"About {name}", "body": intro + "."})

    svc = re.search(
        r"Services include (.+?)\.\s*(?:Technicians|Residential)",
        desc,
        re.I,
    )
    if svc:
        parts = re.split(r", and |, ", svc.group(1))
        bullets = [p.strip().rstrip(".") for p in parts if len(p.strip()) > 3]
        if bullets:
            blocks.append(
                {
                    "heading": "Products & Services Offered",
                    "body": "",
                    "bullets": bullets[:8],
                }
            )

    why = re.search(
        rf"Why choose {re.escape(name)}\?\s*(.+?)(?:\.\s*(?:Office:|Call |Learn more|Follow |Homeowners|Energy|Property|Customers|Indoor))",
        desc,
        re.I,
    )
    if why:
        blocks.append({"heading": f"Why choose {name}?", "body": why.group(1).strip() + "."})
    else:
        blocks.append(
            {
                "heading": f"Why choose {name}?",
                "body": (
                    f"Trusted local {category.lower()} in {city}, {state} with professional "
                    "technicians, clear communication, and reliable service scheduling."
                ),
            }
        )

    area = re.search(r"across the (.+?communities)", desc, re.I)
    if area:
        blocks.append({"heading": "Service Area", "body": "Serving " + area.group(1).strip() + "."})
    else:
        blocks.append(
            {
                "heading": "Service Area",
                "body": f"Serving {city}, {state} and surrounding North Texas communities.",
            }
        )

    return blocks


def faqs_from_reviews(business_name: str, reviews: list[str]) -> list[dict[str, str]]:
    if not reviews:
        return []

    faqs: list[dict[str, str]] = []
    seen_questions: set[str] = set()

    for review in reviews:
        for pattern, question, answer_tpl in FAQ_RULES:
            if not pattern.search(review):
                continue
            if question in seen_questions:
                continue
            snippet = snippet_from_review(review)
            answer = answer_tpl.format(snippet=snippet)
            faqs.append({"question": question, "answer": answer, "source": "customer-review"})
            seen_questions.add(question)
            if len(faqs) >= 5:
                return faqs

    if not faqs and reviews:
        faqs.append(
            {
                "question": f"What do customers say about {business_name}?",
                "answer": snippet_from_review(reviews[0]),
                "source": "customer-review",
            }
        )

    return faqs[:5]


def apply_csv_row(business: dict, row: dict[str, str]) -> None:
    reviews = extract_customer_reviews(row)
    faqs = faqs_from_reviews(business["name"], reviews)

    rating = parse_rating(row.get("rating", ""))
    review_count = parse_review_count(row.get("review_count", ""))
    hours_status = parse_hours_status(row.get("business_hours", ""), row.get("weekly_hours", ""))
    weekly = parse_weekly_hours(row.get("weekly_hours", ""))

    business["faqs"] = faqs
    if rating is not None:
        business["googleRating"] = rating
    if review_count > 0:
        business["googleReviewCount"] = review_count
    if reviews:
        business["googleReviews"] = reviews
    if hours_status:
        business["hoursStatus"] = hours_status
    if weekly:
        business["weeklyHours"] = weekly

    business["timezone"] = timezone_for_city(
        business.get("city", "Dallas"),
        business.get("state", "TX"),
    )

    business["aboutBlocks"] = build_about_blocks(
        business["name"],
        business.get("category", "HVAC Contractor"),
        business.get("city", "Dallas"),
        business.get("state", "TX"),
        business.get("description", ""),
        reviews,
    )


def main() -> None:
    businesses = json.loads(BUSINESSES_PATH.read_text(encoding="utf-8"))
    by_name = {norm_name(b["name"]): b for b in businesses}

    matched = 0
    with_faqs = 0

    for csv_path in CSV_PATHS:
        if not csv_path.exists():
            print(f"SKIP missing CSV: {csv_path.name}")
            continue
        print(f"\n--- {csv_path.name} ---")
        with csv_path.open(encoding="utf-8", newline="") as f:
            for row in csv.DictReader(f):
                key = norm_name(row["business_name"])
                business = by_name.get(key)
                if not business:
                    print(f"SKIP (no match): {row['business_name']}")
                    continue

                matched += 1
                apply_csv_row(business, row)
                if business.get("faqs"):
                    with_faqs += 1
                print(
                    f"OK {business['name']}: rating={business.get('googleRating')}, "
                    f"blocks={len(business.get('aboutBlocks', []))}"
                )

    # Generate about blocks for any business missing them
    for business in businesses:
        if business.get("aboutBlocks"):
            continue
        business["aboutBlocks"] = build_about_blocks(
            business["name"],
            business.get("category", "HVAC Contractor"),
            business.get("city", "Dallas"),
            business.get("state", "TX"),
            business.get("description", ""),
            business.get("googleReviews") or [],
        )

    BUSINESSES_PATH.write_text(json.dumps(businesses, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"\nDone: {matched} CSV rows matched, {with_faqs} with FAQs, {len(businesses)} total listings.")


if __name__ == "__main__":
    main()
