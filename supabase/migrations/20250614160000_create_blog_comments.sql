-- Blog comments (replaces data/blog-comments.json on Vercel)

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
  on public.blog_comments for select
  using (true);

drop policy if exists "Service role manages blog comments" on public.blog_comments;
create policy "Service role manages blog comments"
  on public.blog_comments for all
  using (auth.role() = 'service_role');
