"""Normalize category, vertical, and visibility for all businesses."""

from __future__ import annotations

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from category_rules import classify_business, is_hvac_subcategory

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"


def main() -> None:
    rows = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    changed = 0
    hidden = 0
    reclassified = 0

    for row in rows:
        before = (row.get("vertical"), row.get("categorySlug"), row.get("status", "active"))
        result = classify_business(row["name"], row.get("category", ""))
        row["vertical"] = result["vertical"]
        row["category"] = result["category"]
        row["categorySlug"] = result["categorySlug"]
        row["status"] = result["status"]

        after = (row["vertical"], row["categorySlug"], row["status"])
        if before != after:
            changed += 1
        if row["status"] == "hidden":
            hidden += 1
        if before[1] != after[1]:
            reclassified += 1

    JSON_PATH.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")

    active_hvac = [
        r
        for r in rows
        if r.get("status", "active") == "active"
        and r.get("vertical") == "home-services"
        and is_hvac_subcategory(r.get("categorySlug", ""))
    ]

    print(f"Updated {len(rows)} businesses")
    print(f"Changed: {changed}, reclassified slug: {reclassified}, hidden: {hidden}")
    print(f"Active HVAC listings: {len(active_hvac)}")


if __name__ == "__main__":
    main()
