import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const sql = readFileSync(
  path.join(process.cwd(), "supabase/migrations/20250614150000_create_business_listings.sql"),
  "utf8",
);
const expr = `(() => { const sql = ${JSON.stringify(sql)}; const m = window.monaco?.editor?.getModels?.(); if (!m?.length) return "no monaco"; m[0].setValue(sql); return "ok " + sql.length; })()`;
writeFileSync(path.join(process.cwd(), "scripts/_cdp_expr.txt"), expr, "utf8");
console.log("expr bytes", Buffer.byteLength(expr));
