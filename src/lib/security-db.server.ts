import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { resolveSupabaseDbUrl } from "@/lib/outreach-db.server";

const SECURITY_MIGRATION = "20250622000000_fix_security_rls.sql";

function loadSecuritySql(): string {
  const sqlPath = path.join(process.cwd(), "supabase", "migrations", SECURITY_MIGRATION);
  return readFileSync(sqlPath, "utf8");
}

export async function checkSiteUsersRlsEnabled(): Promise<boolean> {
  const dbUrl = resolveSupabaseDbUrl();
  if (!dbUrl) return false;

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const { rows } = await client.query<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>(
      `SELECT c.relrowsecurity, c.relforcerowsecurity
       FROM pg_class c
       JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relname = 'site_users'`,
    );
    const row = rows[0];
    return Boolean(row?.relrowsecurity);
  } catch {
    return false;
  } finally {
    await client.end().catch(() => undefined);
  }
}

export async function applySecurityRlsFix(): Promise<{ ok: boolean; error?: string }> {
  const dbUrl = resolveSupabaseDbUrl();
  if (!dbUrl) {
    return {
      ok: false,
      error:
        "Database password not configured. Add SUPABASE_DB_PASSWORD in Vercel (Supabase → Settings → Database → database password).",
    };
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query(loadSecuritySql());
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Security migration failed.";
    return { ok: false, error: message };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export function getSecurityRlsSql(): string {
  return loadSecuritySql();
}
