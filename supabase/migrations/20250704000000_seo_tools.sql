-- SEO tool usage cache — grows as visitors run free tools
CREATE TABLE IF NOT EXISTS seo_tool_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id text NOT NULL,
  domain text,
  niche text,
  result jsonb NOT NULL DEFAULT '{}',
  client_ip text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_seo_tool_checks_tool ON seo_tool_checks (tool_id);
CREATE INDEX IF NOT EXISTS idx_seo_tool_checks_domain ON seo_tool_checks (domain);

CREATE TABLE IF NOT EXISTS directory_profiles (
  domain text PRIMARY KEY,
  site_name text NOT NULL,
  profile_type text NOT NULL DEFAULT 'unknown',
  niches text[] NOT NULL DEFAULT '{}',
  da_estimate int,
  pa_estimate int,
  notes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE seo_tool_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE directory_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read directory_profiles" ON directory_profiles
  FOR SELECT USING (true);

CREATE POLICY "Service role full seo_tool_checks" ON seo_tool_checks
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full directory_profiles" ON directory_profiles
  FOR ALL USING (auth.role() = 'service_role');
