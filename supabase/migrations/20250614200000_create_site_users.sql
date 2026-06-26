CREATE TABLE IF NOT EXISTS public.site_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  password_hash text,
  image text,
  email_verified boolean NOT NULL DEFAULT false,
  provider text NOT NULL DEFAULT 'credentials',
  provider_account_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE IF EXISTS public.site_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages site users" ON public.site_users;
CREATE POLICY "Service role manages site users"
  ON public.site_users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

REVOKE ALL ON public.site_users FROM anon, authenticated;
GRANT ALL ON public.site_users TO service_role;

CREATE UNIQUE INDEX IF NOT EXISTS site_users_provider_account_idx
  ON public.site_users (provider, provider_account_id)
  WHERE provider_account_id IS NOT NULL;
