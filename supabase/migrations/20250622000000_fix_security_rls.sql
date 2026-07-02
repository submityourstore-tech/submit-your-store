-- Critical security fix: enable RLS on site_users (passwords / emails were publicly exposed)
ALTER TABLE IF EXISTS public.site_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages site users" ON public.site_users;
CREATE POLICY "Service role manages site users"
  ON public.site_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.site_users FROM anon, authenticated;
GRANT ALL ON public.site_users TO service_role;

-- Outreach tables (idempotent — safe to re-run)
CREATE TABLE IF NOT EXISTS public.outreach_settings (
  id text PRIMARY KEY DEFAULT 'default',
  subject text NOT NULL,
  html_body text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.outreach_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id text NOT NULL,
  business_name text NOT NULL,
  business_email text NOT NULL,
  status text NOT NULL CHECK (status IN ('sent', 'failed', 'skipped')),
  error_message text,
  sent_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS outreach_logs_business_id_idx ON public.outreach_logs (business_id);
CREATE INDEX IF NOT EXISTS outreach_logs_sent_at_idx ON public.outreach_logs (sent_at DESC);

ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages outreach settings" ON public.outreach_settings;
CREATE POLICY "Service role manages outreach settings"
  ON public.outreach_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages outreach logs" ON public.outreach_logs;
CREATE POLICY "Service role manages outreach logs"
  ON public.outreach_logs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.outreach_settings FROM anon, authenticated;
REVOKE ALL ON public.outreach_logs FROM anon, authenticated;
GRANT ALL ON public.outreach_settings TO service_role;
GRANT ALL ON public.outreach_logs TO service_role;

ALTER TABLE public.outreach_logs
  ADD COLUMN IF NOT EXISTS brevo_message_id text,
  ADD COLUMN IF NOT EXISTS delivery_status text NOT NULL DEFAULT 'sent',
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz,
  ADD COLUMN IF NOT EXISTS bounced_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_event text,
  ADD COLUMN IF NOT EXISTS last_event_at timestamptz,
  ADD COLUMN IF NOT EXISTS open_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS click_count integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS outreach_logs_brevo_message_id_idx ON public.outreach_logs (brevo_message_id);
CREATE INDEX IF NOT EXISTS outreach_logs_delivery_status_idx ON public.outreach_logs (delivery_status);
