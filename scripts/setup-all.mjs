/**
 * Full setup: Cloudinary upload → Supabase migration → JSON import
 * Usage: node scripts/setup-all.mjs
 */
import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const steps = [
  { name: "Cloudinary media upload", cmd: "node", args: ["scripts/upload-business-media-cloudinary.mjs"] },
];

if (process.env.SUPABASE_DB_URL?.trim()) {
  steps.push({ name: "Supabase migration", cmd: "node", args: ["scripts/apply-supabase-migration.mjs"] });
} else {
  console.log("SKIP migration — set SUPABASE_DB_URL in .env.local to auto-apply SQL");
}

if (process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
  steps.push({ name: "Supabase import", cmd: "node", args: ["scripts/import-businesses-to-supabase.mjs"] });
} else {
  console.log("SKIP import — set SUPABASE_SERVICE_ROLE_KEY in .env.local");
}

for (const step of steps) {
  console.log(`\n=== ${step.name} ===`);
  const result = spawnSync(step.cmd, step.args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`Failed: ${step.name}`);
    process.exit(result.status ?? 1);
  }
}

console.log("\nAll configured steps completed.");
