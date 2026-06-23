/**
 * Generate ADMIN_SECRET (if missing), save to .env.local, push to Vercel.
 * Usage: node scripts/setup-admin-secret.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { loadEnvLocal } from "./lib/load-env.mjs";

loadEnvLocal();

const envPath = resolve(process.cwd(), ".env.local");
let secret = process.env.ADMIN_SECRET?.trim();

if (!secret) {
  secret = randomBytes(24).toString("base64url");
  let content = readFileSync(envPath, "utf8");
  if (/^ADMIN_SECRET=/m.test(content)) {
    content = content.replace(/^ADMIN_SECRET=.*$/m, `ADMIN_SECRET=${secret}`);
  } else {
    content = content.trimEnd() + `\n\n# Admin panel (/admin/listings)\nADMIN_SECRET=${secret}\n`;
  }
  writeFileSync(envPath, content, "utf8");
  console.log("Generated ADMIN_SECRET and saved to .env.local");
} else {
  console.log("ADMIN_SECRET already set in .env.local");
}

for (const env of ["production", "preview", "development"]) {
  const result = spawnSync("vercel", ["env", "add", "ADMIN_SECRET", env, "--force"], {
    input: secret,
    encoding: "utf8",
    shell: true,
    stdio: ["pipe", "pipe", "pipe"],
  });
  if (result.status === 0) {
    console.log(`OK ADMIN_SECRET (${env})`);
  } else {
    console.error(`FAIL ADMIN_SECRET (${env}):`, result.stderr?.trim() || result.stdout?.trim());
  }
}

console.log("\nAdmin panel: https://www.submityourstore.com/admin/listings");
console.log("Use the ADMIN_SECRET value from .env.local as the login password.");
