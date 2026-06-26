import { readFileSync } from "node:fs";
import path from "node:path";

const MIGRATION_FILES = [
  "20250622000000_fix_security_rls.sql",
  "20250614210000_create_outreach_tables.sql",
  "20250614220000_outreach_tracking.sql",
] as const;

/** Combined SQL for Supabase SQL Editor — outreach tables + RLS security fix. */
export function getOutreachSetupSql(): string {
  const parts: string[] = [];
  for (const file of MIGRATION_FILES) {
    try {
      const sqlPath = path.join(process.cwd(), "supabase", "migrations", file);
      parts.push(`-- ${file}\n${readFileSync(sqlPath, "utf8").trim()}`);
    } catch {
      // skip missing file at runtime
    }
  }
  return parts.join("\n\n");
}
