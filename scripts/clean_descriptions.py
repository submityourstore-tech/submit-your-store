"""Strip Google rating fields and clean descriptions in businesses.json."""

import json
import re
from pathlib import Path

path = Path(__file__).resolve().parents[1] / "data" / "businesses.json"
rows = json.loads(path.read_text(encoding="utf-8"))

for r in rows:
    r.pop("googleRating", None)
    r.pop("googleReviewCount", None)
    desc = r.get("description", "")
    desc = re.sub(r" Rated [\d.]+ stars from [\d,]+ Google reviews,?", "", desc)
    desc = re.sub(r" Rated [\d.]+ stars,?", "", desc)
    desc = re.sub(r"\bis a hvac\b", "is an HVAC", desc, flags=re.I)
    desc = re.sub(r"\bis a ac\b", "is an AC", desc, flags=re.I)
    if "Google" in desc:
        parts = [p.strip() for p in desc.split(".") if p.strip()]
        parts = [p for p in parts if "Google" not in p and "stars from" not in p]
        desc = ". ".join(parts) + ("." if parts else "")
    r["description"] = re.sub(r"\s{2,}", " ", desc).strip()

path.write_text(json.dumps(rows, indent=2, ensure_ascii=False), encoding="utf-8")
print(f"Updated {len(rows)} businesses")
