"""Sync businesses.json logo fields with existing logo.webp files."""

from __future__ import annotations

import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"
IMG_ROOT = ROOT / "public" / "businesses"


def main() -> None:
    businesses = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    by_name = {b["name"].lower(): b for b in businesses}
    fixed = 0

    csv_path = Path(
        r"c:\Users\Hp\Downloads\hvac_details_50_batch2_with_images - hvac_details_50_batch2_with_images.csv"
    )
    if csv_path.exists():
        names = [r["business_name"].strip().lower() for r in csv.DictReader(csv_path.open(encoding="utf-8"))]
    else:
        names = [b["name"].lower() for b in businesses]

    for name in names:
        business = by_name.get(name)
        if not business:
            continue
        logo_file = IMG_ROOT / business["id"] / "logo.webp"
        if logo_file.exists():
            path = f"/businesses/{business['id']}/logo.webp"
            if business.get("logo") != path:
                business["logo"] = path
                fixed += 1

    JSON_PATH.write_text(json.dumps(businesses, indent=2, ensure_ascii=False), encoding="utf-8")
    total = sum(1 for b in businesses if b.get("logo"))
    print(f"Synced {fixed} logo fields ({total} total in JSON)")


if __name__ == "__main__":
    main()
