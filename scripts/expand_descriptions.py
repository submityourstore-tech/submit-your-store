"""Expand all business descriptions to 2000 characters and verify quality."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from description_builder import MAX_CHARS, MIN_CHARS, build_long_description

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"

DUPLICATE_RE = re.compile(
    r"(?:customers|clients|communities|businesses)\.\s+is\s+(?:an|a)\s+",
    re.I,
)
RATING_RE = re.compile(r"\b\d\.\d\s+stars?\b|\+\d+\s+reviews?\b", re.I)


def validate(row: dict) -> list[str]:
    issues: list[str] = []
    desc = row.get("description", "")
    name = row["name"]
    city = row.get("city", "")

    if len(desc) < 1980:
        issues.append("too_short")
    if len(desc) > MAX_CHARS:
        issues.append("too_long")
    if DUPLICATE_RE.search(desc):
        issues.append("duplicate_intro")
    if RATING_RE.search(desc):
        issues.append("rating_claim")
    if name not in desc:
        issues.append("missing_name")
    if city and city not in desc:
        issues.append("missing_city")
    if row.get("phone") and row["phone"] not in desc:
        issues.append("missing_phone")
    if row.get("address") and row["address"] not in desc:
        issues.append("missing_address")
    if row.get("website") and row["website"] not in desc:
        issues.append("missing_website")
    if city == "Houston" and "Dallas-Fort Worth metroplex" in desc:
        issues.append("wrong_metro")
    if city == "Austin" and "Dallas-Fort Worth metroplex" in desc:
        issues.append("wrong_metro")
    return issues


def main() -> None:
    rows = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    lengths: list[int] = []
    problems: list[tuple[str, list[str]]] = []

    for row in rows:
        row["description"] = build_long_description(row)
        lengths.append(len(row["description"]))
        row_issues = validate(row)
        if row_issues:
            problems.append((row["name"], row_issues))

    JSON_PATH.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"Updated {len(rows)} descriptions")
    print(f"Length range: {min(lengths)}–{max(lengths)} chars (target {MIN_CHARS}–{MAX_CHARS})")
    if problems:
        print(f"WARNING: {len(problems)} listings with issues:")
        for name, row_issues in problems[:15]:
            print(f"  - {name}: {', '.join(row_issues)}")
    else:
        print("All descriptions passed quality checks.")


if __name__ == "__main__":
    main()
