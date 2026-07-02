/**
 * Run locally: node scripts/apply-security-rls.mjs
 * Requires SUPABASE_DB_PASSWORD or SUPABASE_DB_URL in .env.local
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import pg from "pg";

function loadEnvFile(file) {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), ".env.local"));
loadEnvFile(path.join(process.cwd(), ".env"));

function resolveDbUrl() {
  const direct = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) return null;

  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1];
  if (!ref) return null;

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

const dbUrl = resolveDbUrl();
if (!dbUrl) {
  console.error(
    "Missing SUPABASE_DB_PASSWORD or SUPABASE_DB_URL.\n" +
      "Get it from Supabase → Project Settings → Database → database password.",
  );
  process.exit(1);
}

const sqlPath = path.join(process.cwd(), "supabase", "migrations", "20250622000000_fix_security_rls.sql");
const sql = readFileSync(sqlPath, "utf8");

const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Applying security RLS migration…");
  await client.query(sql);

  const { rows } = await client.query(
    `SELECT c.relrowsecurity FROM pg_class c
     JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public' AND c.relname = 'site_users'`,
  );
  const enabled = rows[0]?.relrowsecurity;
  console.log(enabled ? "✓ RLS enabled on site_users" : "✗ RLS still disabled — check Supabase dashboard");
  process.exit(enabled ? 0 : 1);
} catch (err) {
  console.error("Failed:", err instanceof Error ? err.message : err);
  process.exit(1);
} finally {
  await client.end().catch(() => undefined);
}
