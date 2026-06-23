import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

const OUTREACH_MIGRATION_FILES = [
  "20250614210000_create_outreach_tables.sql",
  "20250614220000_outreach_tracking.sql",
] as const;

function isOutreachTableMissing(error: { message?: string; code?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("outreach_settings") ||
    msg.includes("outreach_logs") ||
    msg.includes("does not exist") ||
    (msg.includes("relation") && msg.includes("outreach"))
  );
}

export function resolveSupabaseDbUrl(): string | null {
  return (
    process.env.SUPABASE_DB_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    null
  );
}

export async function checkOutreachTablesReady(): Promise<boolean> {
  try {
    const supabase = createSupabaseAdmin();
    const { error: settingsError } = await supabase.from("outreach_settings").select("id").limit(1);
    if (settingsError && isOutreachTableMissing(settingsError)) return false;
    if (settingsError) return false;

    const { error: logsError } = await supabase.from("outreach_logs").select("id").limit(1);
    if (logsError && isOutreachTableMissing(logsError)) return false;
    if (logsError) return false;

    return true;
  } catch {
    return false;
  }
}

export async function applyOutreachMigrations(): Promise<{ ok: boolean; error?: string }> {
  const dbUrl = resolveSupabaseDbUrl();
  if (!dbUrl) {
    return {
      ok: false,
      error:
        "SUPABASE_DB_URL is not set. In Supabase → Settings → Database → Connection string → URI, copy and add to Vercel env vars.",
    };
  }

  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();

    for (const file of OUTREACH_MIGRATION_FILES) {
      const sqlPath = path.join(process.cwd(), "supabase", "migrations", file);
      const sql = readFileSync(sqlPath, "utf8");
      await client.query(sql);
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
};

export async function ensureOutreachTables(options?: {
  autoApply?: boolean;
}): Promise<EnsureOutreachTablesResult> {
  const canAutoSetup = Boolean(resolveSupabaseDbUrl());

  if (await checkOutreachTablesReady()) {
    return { ready: true, canAutoSetup };
  }

  if (options?.autoApply !== false && canAutoSetup) {
    const migration = await applyOutreachMigrations();
    if (migration.ok && (await checkOutreachTablesReady())) {
      return { ready: true, canAutoSetup, applied: true };
    }
    return {
      ready: false,
      canAutoSetup,
      error: migration.error ?? "Tables still missing after migration.",
    };
  }

  return {
    ready: false,
    canAutoSetup,
    error: canAutoSetup
      ? "Outreach tables missing — use the Setup button below."
      : "Outreach tables missing. Add SUPABASE_DB_URL in Vercel (Supabase → Database → URI) or run the SQL migrations manually.",
  };
}
