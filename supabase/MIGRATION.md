# Supabase migration — business listings

## Where your 150 listings live today

| Source | Role | Count |
|--------|------|-------|
| **`data/businesses.json`** | **Primary runtime store** (read on every page via `readBusinesses()`) | **150** |
| **`public/businesses/{id}/`** | Logo + gallery images (local filesystem, committed to repo) | 145 logos, 149 galleries |
| **`data/hvac_faq_data_50.csv`** + **`data/hvac_faq_data_51_200_v2.csv`** | Enrichment source (hours, ratings, reviews, FAQs) via `npm run faqs:import` | ~150 rows |
| **`data/hvac_raw.csv`** | Original seed CSV (legacy enrich pipeline) | — |
| **Vercel Blob** | **Not used in this repo's code** — no `@vercel/blob` references. Production Blob usage is likely from a separate deployment layer or prior setup. | — |
| **Hardcoded in code** | No — only category/blog metadata in TS files | — |

**Next import step:** load from **`data/businesses.json`** (canonical merged dataset), not re-parse CSVs.

---

## What was created

Migration file:

```
supabase/migrations/20250614150000_create_business_listings.sql
```

### Table: `public.businesses`

| Column group | Columns |
|--------------|---------|
| Identity | `id`, `name`, `slug`, `vertical`, `status` |
| Category | `category`, `category_slug` |
| Location | `address`, `city`, `state`, `timezone` |
| Contact | `phone`, `email`, `website`, `google_maps_url` |
| Content | `description` |
| Media | `logo_url`, `gallery_urls` (text array) |
| Reputation | `google_rating`, `google_review_count`, `google_reviews` |
| Hours | `hours_status`, `weekly_hours` (jsonb) |
| Nested | `social`, `about_blocks`, `faqs` (jsonb) |
| Extensibility | `metadata` (jsonb) |
| Audit | `created_at`, `updated_at` |

### Indexes (performance)

- Partial indexes on **active** listings for: `(vertical, category_slug)`, `(state, city)`, `category_slug`, `city`
- Rating sort index for blog-style ranking
- `pg_trgm` GIN indexes on `name` and `city` for future search
- GIN on `faqs` jsonb for optional FAQ filters
- `updated_at` for import/sync jobs

### Security

- RLS enabled
- `anon` / `authenticated`: **SELECT active rows only**
- `service_role`: full CRUD (for server import scripts)

### View

- `public.active_businesses` — convenience view (same as `status = 'active'`)

---

## How to apply in Supabase

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project → **SQL Editor**
2. Paste the contents of `supabase/migrations/20250614150000_create_business_listings.sql`
3. Click **Run**
4. Verify:

```sql
select count(*) from public.businesses;  -- expect 0 before import
select indexname from pg_indexes where tablename = 'businesses';
```

Or with Supabase CLI (if installed):

```bash
supabase db push
```

---

## JSON → Postgres field mapping (for import script)

| `businesses.json` | `public.businesses` |
|-------------------|---------------------|
| `id` | `id` |
| `name` | `name` |
| `vertical` | `vertical` |
| `status` | `status` |
| `category` | `category` |
| `categorySlug` | `category_slug` |
| `address` | `address` |
| `city` | `city` |
| `state` | `state` |
| `timezone` | `timezone` |
| `phone` | `phone` |
| `email` | `email` |
| `website` | `website` |
| `googleMapsUrl` | `google_maps_url` |
| `description` | `description` |
| `logo` | `logo_url` |
| `gallery` | `gallery_urls` |
| `googleRating` | `google_rating` |
| `googleReviewCount` | `google_review_count` |
| `googleReviews` | `google_reviews` |
| `hoursStatus` | `hours_status` |
| `weeklyHours` | `weekly_hours` |
| `social` | `social` |
| `aboutBlocks` | `about_blocks` |
| `faqs` | `faqs` |

---

## Not in this migration (future phases)

These still use local JSON files and will be migrated separately:

| File | Purpose |
|------|---------|
| `data/business-votes.json` | Community upvotes/downvotes |
| `data/reviews.json` | On-site member reviews |
| `data/users.json` | Auth users |
| `data/blog-comments.json` | Blog comments |
| `data/pending-listings.json` | Listing submission queue |

---

## App code (unchanged)

No frontend or business logic was modified. Current reads still go through:

- `src/lib/businesses-data.ts` → `data/businesses.json`

After import + a follow-up task, swap the data layer to query Supabase instead of the filesystem/Blob.

---

## Cloudinary media (completed)

All business images uploaded to Cloudinary:

```bash
npm run cloudinary:upload   # re-run if new images added
```

- **Cloud name:** `dnzywa2zn`
- **Folder:** `submit-your-store/businesses/{id}/`
- **310 files** uploaded (145 logos + 165 gallery)
- **URL map:** `data/cloudinary-media-map.json`

Env vars in `.env.local`:

```
CLOUDINARY_CLOUD_NAME=dnzywa2zn
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dnzywa2zn
```

---

## Full setup (after adding Supabase keys)

Add to `.env.local`:

1. **SUPABASE_SERVICE_ROLE_KEY** — Dashboard → Settings → API → **secret** key
2. **SUPABASE_DB_URL** (optional) — Dashboard → Settings → Database → Connection string URI

Then run:

```bash
npm run setup:all
```

Or step by step:

```bash
npm run cloudinary:upload    # done
npm run supabase:migrate     # needs SUPABASE_DB_URL
npm run supabase:import      # needs SUPABASE_SERVICE_ROLE_KEY
```
