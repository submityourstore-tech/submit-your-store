/**
 * Apply supabase/migrations/*.sql using direct Postgres connection.
 * Requires SUPABASE_DB_URL in .env.local (Database → Connection string → URI).
 *
 * Usage: node scripts/apply-supabase-migration.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

async function main() {
  const dbUrl = requireEnv("SUPABASE_DB_URL");
  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
    console.log(`Applying ${file}…`);
    await client.query(sql);
    console.log(`  OK`);
  }

  const { rows } = await client.query(`
    select count(*)::int as n from information_schema.tables
    where table_schema = 'public' and table_name = 'businesses'
  `);
  console.log("businesses table exists:", rows[0]?.n === 1);

  await client.end();
  console.log("Migration complete.");
}

main().catch((err) => {
  console.error("Migration failed:", err.message ?? err);
  process.exit(1);
});
