# Submit Your Store

Local business listing platform — starting with **HVAC contractors in Dallas, TX**.

## Brand

**Submit Your Store** — find local pros, see Google ratings, and (soon) leave your own reviews with an account.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run enrich   # Re-process CSV → data/businesses.json
```

## Data

- Raw CSV: `data/hvac_raw.csv`
- Enriched JSON: `data/businesses.json` (50 listings)
- Enrichment script fetches missing emails/descriptions from business websites and writes unique copy.

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Vercel-ready
