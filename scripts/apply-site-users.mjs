/**
 * Create public.site_users table in Supabase.
 * Usage: node scripts/apply-site-users.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const SQL = readFileSync(
  path.join(process.cwd(), "supabase", "migrations", "20250614200000_create_site_users.sql"),
  "utf8",
);

async function applyViaPg() {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) return false;

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Applying site_users migration via Postgres…");
  await client.query(SQL);
  await client.end();
  return true;
}

async function verify() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("site_users").select("id", { head: true, count: "exact" });
  if (error) throw new Error(error.message);
  console.log("site_users OK");
}

async function main() {
  const applied = await applyViaPg();
  if (!applied) {
    console.log("SUPABASE_DB_URL not set — paste this SQL in Supabase Dashboard → SQL Editor:\n");
    console.log(SQL);
    return;
  }
  await verify();
  console.log("site_users migration complete.");
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
