"""Migrate legacy vertical field values to home-services."""

from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "businesses.json"


def main() -> None:
    rows = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    changed = 0
    for row in rows:
        if row.get("vertical") == "hvac":
            row["vertical"] = "home-services"
            changed += 1
    JSON_PATH.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Migrated {changed} businesses to vertical home-services")


if __name__ == "__main__":
    main()
