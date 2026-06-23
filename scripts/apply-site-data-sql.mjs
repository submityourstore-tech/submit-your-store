/**
 * Apply site data tables via direct Postgres (needs SUPABASE_DB_URL in .env.local).
 * Falls back to printing SQL for manual Supabase SQL Editor run.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const FILES = [
  "20250614160000_create_blog_comments.sql",
  "20250614170000_create_site_data_tables.sql",
];

const COMBINED = FILES.map((f) =>
  readFileSync(path.join(process.cwd(), "supabase", "migrations", f), "utf8"),
).join("\n\n");

async function main() {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) {
    console.error("SUPABASE_DB_URL is empty in .env.local.");
    console.error("Supabase Dashboard → Project Settings → Database → Connection string (URI)");
    console.error("Paste into .env.local then re-run: npm run supabase:site-data\n");
    process.exit(1);
  }

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(COMBINED);
  await client.end();
  console.log("Site data tables created (blog_comments, site_reviews, business_votes).");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
