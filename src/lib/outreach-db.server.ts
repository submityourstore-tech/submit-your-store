import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getOutreachSetupSql } from "@/lib/outreach-setup-sql";

const OUTREACH_MIGRATION_FILES = [
  "20250622000000_fix_security_rls.sql",
  "20250614210000_create_outreach_tables.sql",
  "20250614220000_outreach_tracking.sql",
] as const;

function isOutreachTableMissing(error: { message?: string; code?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    msg.includes("outreach_settings") ||
    msg.includes("outreach_logs") ||
    msg.includes("does not exist") ||
    msg.includes("could not find the table") ||
    (msg.includes("relation") && msg.includes("outreach"))
  );
}

/** Build Postgres URI from Supabase project URL + database password. */
export function resolveSupabaseDbUrl(): string | null {
  const direct = process.env.SUPABASE_DB_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (direct) return direct;

  const password = process.env.SUPABASE_DB_PASSWORD?.trim();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!password || !supabaseUrl) return null;

  const ref = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/i)?.[1];
  if (!ref) return null;

  return `postgresql://postgres:${encodeURIComponent(password)}@db.${ref}.supabase.co:5432/postgres`;
}

export async function checkOutreachTablesReady(): Promise<boolean> {
  try {
    const supabase = createSupabaseAdmin();
    const { error: settingsError } = await supabase.from("outreach_settings").select("id").limit(1);
    if (settingsError) {
      if (isOutreachTableMissing(settingsError)) return false;
      console.warn("outreach_settings check:", settingsError.message);
      return false;
    }

    const { error: logsError } = await supabase.from("outreach_logs").select("id").limit(1);
    if (logsError) {
      if (isOutreachTableMissing(logsError)) return false;
      console.warn("outreach_logs check:", logsError.message);
      return false;
    }

    return true;
  } catch (err) {
    console.warn("checkOutreachTablesReady:", err);
    return false;
  }
}

function loadMigrationSql(file: string): string {
  try {
    const sqlPath = path.join(process.cwd(), "supabase", "migrations", file);
    return readFileSync(sqlPath, "utf8");
  } catch {
    return "";
  }
}

export async function applyOutreachMigrations(): Promise<{ ok: boolean; error?: string }> {
  const dbUrl = resolveSupabaseDbUrl();
  if (!dbUrl) {
    return {
      ok: false,
      error:
        "Database password not configured. Add SUPABASE_DB_PASSWORD (or SUPABASE_DB_URL) in Vercel — Supabase → Settings → Database.",
    };
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    const bundled = getOutreachSetupSql();
    if (bundled.trim()) {
      await client.query(bundled);
      return { ok: true };
    }

    for (const file of OUTREACH_MIGRATION_FILES) {
      const sql = loadMigrationSql(file);
      if (sql.trim()) await client.query(sql);
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Outreach migration failed.";
    return { ok: false, error: message };
  } finally {
    await client.end().catch(() => undefined);
  }
}

export type EnsureOutreachTablesResult = {
  ready: boolean;
  canAutoSetup: boolean;
  applied?: boolean;
  error?: string;
  setupSql?: string;
};

export async function ensureOutreachTables(options?: {
  autoApply?: boolean;
}): Promise<EnsureOutreachTablesResult> {
  const canAutoSetup = Boolean(resolveSupabaseDbUrl());
  const setupSql = getOutreachSetupSql();

  if (await checkOutreachTablesReady()) {
    return { ready: true, canAutoSetup, setupSql };
  }

  if (options?.autoApply !== false && canAutoSetup) {
    const migration = await applyOutreachMigrations();
    if (migration.ok && (await checkOutreachTablesReady())) {
      return { ready: true, canAutoSetup, applied: true, setupSql };
    }
    return {
      ready: false,
      canAutoSetup,
      error: migration.error ?? "Tables still missing after migration.",
      setupSql,
    };
  }

  return {
    ready: false,
    canAutoSetup,
    setupSql,
    error: canAutoSetup
      ? "Outreach tables missing — click Create tables now."
      : "Outreach tables missing. Add SUPABASE_DB_PASSWORD in Vercel, or copy SQL below into Supabase SQL Editor.",
  };
}
