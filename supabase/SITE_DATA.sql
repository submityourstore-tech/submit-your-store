-- Run once in Supabase Dashboard → SQL Editor → Run
-- Creates: blog_comments, site_reviews, business_votes

create table if not exists public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  blog_slug text not null,
  user_id text not null,
  user_name text not null,
  body text not null check (char_length(trim(body)) >= 3),
  created_at timestamptz not null default now()
);

create index if not exists blog_comments_slug_created_idx
  on public.blog_comments (blog_slug, created_at desc);

alter table public.blog_comments enable row level security;

drop policy if exists "Public read blog comments" on public.blog_comments;
create policy "Public read blog comments"
  on public.blog_comments for select using (true);

drop policy if exists "Service role manages blog comments" on public.blog_comments;
create policy "Service role manages blog comments"
  on public.blog_comments for all using (auth.role() = 'service_role');

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
