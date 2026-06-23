/**
 * Create public.blog_comments table (run once in Supabase SQL Editor or via SUPABASE_DB_URL).
 * Usage: node scripts/apply-blog-comments-migration.mjs
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

const SQL_PATH = path.join(
  process.cwd(),
  "supabase",
  "migrations",
  "20250614160000_create_blog_comments.sql",
);

async function applyViaPg() {
  const dbUrl = process.env.SUPABASE_DB_URL?.trim();
  if (!dbUrl) return false;

  const client = new pg.Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  await client.query(readFileSync(SQL_PATH, "utf8"));
  await client.end();
  return true;
}

async function verifyTable() {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { error } = await supabase.from("blog_comments").select("id", { head: true, count: "exact" });
  if (error) throw new Error(error.message);
  console.log("blog_comments table OK");
}

async function main() {
  const viaPg = await applyViaPg();
  if (!viaPg) {
    console.log("SUPABASE_DB_URL not set — paste this SQL in Supabase Dashboard → SQL Editor:\n");
    console.log(readFileSync(SQL_PATH, "utf8"));
    console.log("\nThen run this script again to verify.");
    return;
  }
  console.log("Migration applied via Postgres.");
  await verifyTable();
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
