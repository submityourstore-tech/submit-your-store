"""
Update logo + gallery for the original 50 Dallas businesses from CSV.
Usage: python scripts/update_batch1_images.py "path/to/hvac_details_50_full_with_images.csv"
"""

from __future__ import annotations

import csv
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from import_batch2 import is_missing, process_images

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"
BATCH1_COUNT = 50


def main() -> None:
    if len(sys.argv) < 2:
        print("Usage: python scripts/update_batch1_images.py <csv-path>")
        sys.exit(1)

    csv_path = Path(sys.argv[1])
    if not csv_path.exists():
        print(f"CSV not found: {csv_path}")
        sys.exit(1)

    businesses = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    batch1 = businesses[:BATCH1_COUNT]
    if len(batch1) < BATCH1_COUNT:
        print(f"Expected at least {BATCH1_COUNT} businesses, found {len(batch1)}")
        sys.exit(1)

    by_gbp: dict[str, dict] = {}
    for b in batch1:
        url = (b.get("googleMapsUrl") or "").strip()
        if url:
            by_gbp[url] = b

    with csv_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    stats = {"logo": 0, "gallery": 0, "skipped": 0, "unmatched": 0}

    for i, raw in enumerate(rows, 1):
        gbp = (raw.get("gbp_url") or "").strip()
        business = by_gbp.get(gbp)
        if not business:
            print(f"[{i}] UNMATCHED: {raw.get('business_name', '?')}")
            stats["unmatched"] += 1
            continue

        bid = business["id"]
        print(f"[{i}/{len(rows)}] {business['name'][:55]}...")

        logo, gallery = process_images(bid, raw)

        if logo:
            business["logo"] = logo
            stats["logo"] += 1
        else:
            business.pop("logo", None)

        if gallery:
            business["gallery"] = gallery
            stats["gallery"] += 1
        else:
            business.pop("gallery", None)

        if not logo and not gallery:
            stats["skipped"] += 1

        time.sleep(0.15)

    JSON_PATH.write_text(json.dumps(businesses, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nUpdated first {BATCH1_COUNT} businesses")
    print(f"Logos: {stats['logo']}, with gallery: {stats['gallery']}, no images: {stats['skipped']}")
    if stats["unmatched"]:
        print(f"Unmatched CSV rows: {stats['unmatched']}")


if __name__ == "__main__":
    main()
