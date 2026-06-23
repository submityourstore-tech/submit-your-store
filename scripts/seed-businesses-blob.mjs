import { readFileSync, existsSync } from "fs";
import path from "path";
import { put } from "@vercel/blob";

const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
if (!token) {
  console.error(
    "BLOB_READ_WRITE_TOKEN is required. Connect a Blob store in the Vercel project dashboard, then run:\n  vercel env pull\n  npm run blob:seed-businesses",
  );
  process.exit(1);
}

const root = path.resolve(import.meta.dirname, "..");
const localPath = path.join(root, "data", "businesses.json");

if (!existsSync(localPath)) {
  console.error(`Missing ${localPath}`);
  process.exit(1);
}

const data = readFileSync(localPath, "utf-8");
JSON.parse(data);

const result = await put("data/businesses.json", data, {
  access: "private",
  token,
  addRandomSuffix: false,
  allowOverwrite: true,
  contentType: "application/json",
});

console.log(`Uploaded data/businesses.json to Vercel Blob (${result.url}).`);
