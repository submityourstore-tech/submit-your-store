-- Outreach email templates and send logs (Phase 3)

create table if not exists public.outreach_settings (
  id text primary key default 'default',
  subject text not null,
  html_body text not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.outreach_logs (
  id uuid primary key default gen_random_uuid(),
  business_id text not null,
  business_name text not null,
  business_email text not null,
  status text not null check (status in ('sent', 'failed', 'skipped')),
  error_message text,
  sent_at timestamptz not null default now()
);

create index if not exists outreach_logs_business_id_idx on public.outreach_logs (business_id);
create index if not exists outreach_logs_sent_at_idx on public.outreach_logs (sent_at desc);

alter table public.outreach_settings enable row level security;
alter table public.outreach_logs enable row level security;

drop policy if exists "Service role manages outreach settings" on public.outreach_settings;
create policy "Service role manages outreach settings"
  on public.outreach_settings for all using (auth.role() = 'service_role');

drop policy if exists "Service role manages outreach logs" on public.outreach_logs;
create policy "Service role manages outreach logs"
  on public.outreach_logs for all using (auth.role() = 'service_role');
