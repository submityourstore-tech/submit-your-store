/**
 * Apply site_reviews + business_votes + blog_comments tables.
 * Usage: node scripts/apply-site-data-migration.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const MIGRATIONS = [
  "20250614160000_create_blog_comments.sql",
  "20250614170000_create_site_data_tables.sql",
];

async function applyViaPg() {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) return false;

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  for (const file of MIGRATIONS) {
    const sql = readFileSync(path.join(process.cwd(), "supabase", "migrations", file), "utf8");
    console.log(`Applying ${file}…`);
    await client.query(sql);
  }
  await client.end();
  return true;
}

async function verify() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  for (const table of ["blog_comments", "site_reviews", "business_votes"]) {
    const { error } = await supabase.from(table).select("*", { head: true, count: "exact" });
    if (error) throw new Error(`${table}: ${error.message}`);
    console.log(`${table} OK`);
  }
}

async function main() {
  const applied = await applyViaPg();
  if (!applied) {
    console.log("SUPABASE_DB_URL not set. Run these in Supabase SQL Editor:\n");
    for (const file of MIGRATIONS) {
      console.log(`--- ${file} ---`);
      console.log(readFileSync(path.join(process.cwd(), "supabase", "migrations", file), "utf8"));
    }
    return;
  }
  await verify();
  console.log("Site data migration complete.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
