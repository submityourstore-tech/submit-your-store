-- Site-wide data tables (replaces JSON/Blob reads for reviews, votes, comments)

create table if not exists public.site_reviews (
  id text primary key,
  business_id text not null,
  user_id text,
  user_name text not null,
  user_image text,
  email_verified boolean not null default false,
  rating integer not null check (rating between 1 and 5),
  title text not null default '',
  body text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists site_reviews_business_id_idx on public.site_reviews (business_id);
create index if not exists site_reviews_user_id_idx on public.site_reviews (user_id);

create table if not exists public.business_votes (
  business_id text primary key,
  upvotes integer not null default 0 check (upvotes >= 0),
  downvotes integer not null default 0 check (downvotes >= 0),
  voters jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_reviews enable row level security;
alter table public.business_votes enable row level security;

drop policy if exists "Public read site reviews" on public.site_reviews;
create policy "Public read site reviews"
  on public.site_reviews for select using (true);

drop policy if exists "Service role manages site reviews" on public.site_reviews;
create policy "Service role manages site reviews"
  on public.site_reviews for all using (auth.role() = 'service_role');

drop policy if exists "Public read business votes" on public.business_votes;
create policy "Public read business votes"
  on public.business_votes for select using (true);

drop policy if exists "Service role manages business votes" on public.business_votes;
create policy "Service role manages business votes"
  on public.business_votes for all using (auth.role() = 'service_role');
