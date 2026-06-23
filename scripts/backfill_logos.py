"""Backfill business logos from CSV + website scrape, with upscale/sharpen to WebP."""

from __future__ import annotations

import csv
import json
import sys
import time
import unicodedata
from pathlib import Path

import re

sys.path.insert(0, str(Path(__file__).resolve().parent))
from logo_utils import download_business_logo

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"
IMG_ROOT = ROOT / "public" / "businesses"


def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = re.sub(r"[^\w\s-]", "", text.lower())
    return re.sub(r"[-\s]+", "-", text).strip("-")


def main() -> None:
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else None
    if not csv_path or not csv_path.exists():
        print("Usage: python scripts/backfill_logos.py <csv-path>")
        sys.exit(1)

    businesses = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    by_id = {b["id"]: b for b in businesses}
    by_name = {b["name"].lower(): b for b in businesses}

    with csv_path.open(encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))

    ok = 0
    fail = 0
    failed_names: list[str] = []

    for i, raw in enumerate(rows, 1):
        name = raw["business_name"].strip()
        bid = by_name.get(name.lower(), {}).get("id") or slugify(name)
        business = by_id.get(bid)
        if not business:
            print(f"[{i}] skip (not in json): {name}")
            continue

        dest = IMG_ROOT / bid / "logo.webp"
        print(f"[{i}/{len(rows)}] {name[:50]}...", end=" ", flush=True)

        if download_business_logo(raw, business, dest):
            business["logo"] = f"/businesses/{bid}/logo.webp"
            ok += 1
            print("OK")
        else:
            fail += 1
            failed_names.append(name)
            print("FAIL")
        time.sleep(0.12)

    JSON_PATH.write_text(json.dumps(businesses, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\nLogos saved: {ok}/{len(rows)}, failed: {fail}")
    if failed_names:
        print("Failed:")
        for n in failed_names:
            print(f"  - {n}")


if __name__ == "__main__":
    main()
