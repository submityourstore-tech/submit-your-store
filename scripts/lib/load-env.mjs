import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/** Load .env.local into process.env (does not overwrite existing vars). */
export function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  let content;
  try {
    content = readFileSync(envPath, "utf8");
  } catch {
    throw new Error("Missing .env.local — create it with Supabase and Cloudinary credentials.");
  }

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

export function requireEnv(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}
