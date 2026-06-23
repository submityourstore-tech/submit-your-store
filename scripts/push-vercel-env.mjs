/**
 * Push env vars from .env.local to Vercel (production, preview, development).
 * Usage: node scripts/push-vercel-env.mjs
 */
import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const KEYS = [
  "AUTH_URL",
  "NEXT_PUBLIC_SITE_URL",
  "AUTH_SECRET",
  "AUTH_GOOGLE_ID",
  "AUTH_GOOGLE_SECRET",
  "ADMIN_SECRET",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "BREVO_API_KEY",
  "BREVO_SENDER_EMAIL",
  "BREVO_SENDER_NAME",

const TARGETS = ["production", "preview", "development"];

function pushEnv(name, value, env) {
  if (!value?.trim()) {
    console.log(`SKIP ${name} (${env}, empty)`);
    return;
  }
  const result = spawnSync("vercel", ["env", "add", name, env, "--force"], {
    input: value.trim(),
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status === 0) {
    console.log(`OK ${name} (${env})`);
  } else {
    console.error(`FAIL ${name} (${env}):`, result.stderr?.trim() || result.stdout?.trim());
  }
}

for (const target of TARGETS) {
  console.log(`\n--- ${target} ---`);
  for (const key of KEYS) {
    pushEnv(key, process.env[key], target);
  }
}

console.log("\nDone. Run: vercel env ls");
