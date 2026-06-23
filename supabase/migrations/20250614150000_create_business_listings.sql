-- Business listings schema for Submit Your Store
-- Replaces file/Blob-backed data/businesses.json for production reads/writes.
-- Source of truth for import: data/businesses.json (150 listings today).

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists pg_trgm with schema extensions;
do $$
begin
  if not exists (select 1 from pg_type where typname = 'business_status') then
    create type public.business_status as enum ('active', 'hidden');
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- Core table
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  -- Identity
  id text primary key,
  name text not null,
  slug text generated always as (id) stored,
  vertical text not null default 'home-services',
  status public.business_status not null default 'active',

  -- Category
  category text not null,
  category_slug text not null,

  -- Location
  address text,
  city text not null,
  state text not null default 'TX',
  timezone text,

  -- Contact
  phone text not null,
  email text,
  website text,
  google_maps_url text,

  -- Content
  description text not null,

  -- Media (URLs point to /public/businesses/{id}/ or future object storage)
  logo_url text,
  gallery_urls text[] not null default '{}',

  -- Google / reputation (aggregated from GBP import)
  google_rating numeric(2, 1),
  google_review_count integer,
  google_reviews text[] not null default '{}',

  -- Hours
  hours_status text,
  weekly_hours jsonb not null default '[]'::jsonb,

  -- Nested content (matches current TypeScript shapes)
  social jsonb not null default jsonb_build_object(
    'facebook', null,
    'instagram', null,
    'linkedin', null,
    'youtube', null,
    'twitter', null
  ),
  about_blocks jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,

  -- Extensibility (import batch, GBP place id, SEO flags, etc.)
  metadata jsonb not null default '{}'::jsonb,

  -- Audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Constraints
  constraint businesses_google_rating_range
    check (google_rating is null or (google_rating >= 0 and google_rating <= 5)),
  constraint businesses_google_review_count_nonneg
    check (google_review_count is null or google_review_count >= 0),
  constraint businesses_weekly_hours_is_array
    check (jsonb_typeof(weekly_hours) = 'array'),
  constraint businesses_about_blocks_is_array
    check (jsonb_typeof(about_blocks) = 'array'),
  constraint businesses_faqs_is_array
    check (jsonb_typeof(faqs) = 'array'),
  constraint businesses_social_is_object
    check (jsonb_typeof(social) = 'object'),
  constraint businesses_metadata_is_object
    check (jsonb_typeof(metadata) = 'object')
);

comment on table public.businesses is
  'Public business directory listings. Primary replacement for data/businesses.json.';
comment on column public.businesses.id is
  'URL-safe slug, e.g. texas-airzone-llc. Matches /business/[id] routes.';
comment on column public.businesses.weekly_hours is
  'Array of { day, hours } objects.';
comment on column public.businesses.about_blocks is
  'Array of { heading, body, bullets? } objects.';
comment on column public.businesses.faqs is
  'Array of { question, answer, source? } objects.';
comment on column public.businesses.social is
  'Object with facebook, instagram, linkedin, youtube, twitter keys.';

-- ---------------------------------------------------------------------------
-- Indexes — optimized for current query patterns in categories.server.ts
-- Filters: status, vertical, category_slug, city, state; sort by name
-- ---------------------------------------------------------------------------

-- Public listing browse (most common)
create index if not exists businesses_active_vertical_category_idx
  on public.businesses (vertical, category_slug, name)
  where status = 'active';

create index if not exists businesses_active_location_idx
  on public.businesses (state, city, name)
  where status = 'active';

create index if not exists businesses_active_category_slug_idx
  on public.businesses (category_slug)
  where status = 'active';

create index if not exists businesses_active_city_idx
  on public.businesses (city)
  where status = 'active';

-- Blog ranking secondary sorts (rating + review count)
create index if not exists businesses_active_rating_idx
  on public.businesses (google_rating desc nulls last, google_review_count desc nulls last)
  where status = 'active';

-- Admin / import upserts
create index if not exists businesses_updated_at_idx
  on public.businesses (updated_at desc);

-- Future search (name / city / category text search)
create index if not exists businesses_name_trgm_idx
  on public.businesses using gin (name extensions.gin_trgm_ops);

create index if not exists businesses_city_trgm_idx
  on public.businesses using gin (city extensions.gin_trgm_ops);

-- JSONB containment queries (optional FAQ / metadata filters later)
create index if not exists businesses_faqs_gin_idx
  on public.businesses using gin (faqs jsonb_path_ops);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
  before update on public.businesses
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.businesses enable row level security;

-- Anonymous + authenticated users: read active listings only
drop policy if exists businesses_public_read_active on public.businesses;
create policy businesses_public_read_active
  on public.businesses
  for select
  to anon, authenticated
  using (status = 'active');

-- Service role (server-side imports / admin): full access
drop policy if exists businesses_service_role_all on public.businesses;
create policy businesses_service_role_all
  on public.businesses
  for all
  to service_role
  using (true)
  with check (true);

-- ---------------------------------------------------------------------------
-- Helpful view for public API (optional, no logic change yet)
-- ---------------------------------------------------------------------------
create or replace view public.active_businesses as
select *
from public.businesses
where status = 'active';

comment on view public.active_businesses is
  'Convenience view for public directory queries. RLS still applies on base table.';
