/**
 * One-off Supabase connectivity check. Loads .env.local and pings the project.
 * Usage: node scripts/verify-supabase.mjs
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  const content = readFileSync(envPath, "utf8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error("FAIL: Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { error: authError } = await supabase.auth.getSession();
if (authError) {
  console.error("FAIL: Auth API unreachable:", authError.message);
  process.exit(1);
}

const health = await fetch(`${url}/auth/v1/health`, {
  headers: {
    apikey: key,
    Authorization: `Bearer ${key}`,
  },
});

if (!health.ok) {
  console.error("FAIL: Auth health check returned", health.status, health.statusText);
  process.exit(1);
}

console.log("OK: Supabase connection verified");
console.log("  URL:", url);
console.log("  Auth API: reachable");
console.log("  Auth health:", health.status, (await health.text()).slice(0, 80));
