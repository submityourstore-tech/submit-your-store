-- Outreach email delivery tracking (opens, bounces, clicks)

alter table public.outreach_logs
  add column if not exists brevo_message_id text,
  add column if not exists delivery_status text not null default 'sent',
  add column if not exists opened_at timestamptz,
  add column if not exists clicked_at timestamptz,
  add column if not exists bounced_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists last_event text,
  add column if not exists last_event_at timestamptz,
  add column if not exists open_count integer not null default 0,
  add column if not exists click_count integer not null default 0;

create index if not exists outreach_logs_brevo_message_id_idx on public.outreach_logs (brevo_message_id);
create index if not exists outreach_logs_delivery_status_idx on public.outreach_logs (delivery_status);
