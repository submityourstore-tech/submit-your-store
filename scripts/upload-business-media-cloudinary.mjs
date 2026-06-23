/**
 * Upload all public/businesses/{id}/*.webp files to Cloudinary.
 * Writes data/cloudinary-media-map.json for Supabase import.
 *
 * Usage: node scripts/upload-business-media-cloudinary.mjs
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { v2 as cloudinary } from "cloudinary";
import { loadEnvLocal, requireEnv } from "./lib/load-env.mjs";

loadEnvLocal();

cloudinary.config({
  cloud_name: requireEnv("CLOUDINARY_CLOUD_NAME"),
  api_key: requireEnv("CLOUDINARY_API_KEY"),
  api_secret: requireEnv("CLOUDINARY_API_SECRET"),
  secure: true,
});

const PUBLIC_DIR = path.join(process.cwd(), "public", "businesses");
const MAP_PATH = path.join(process.cwd(), "data", "cloudinary-media-map.json");

function uploadFile(filePath, folder, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder,
        public_id: publicId,
        overwrite: true,
        resource_type: "image",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      },
    );
  });
}

async function main() {
  if (!existsSync(PUBLIC_DIR)) {
    console.error("No public/businesses directory found.");
    process.exit(1);
  }

  let existing = {};
  if (existsSync(MAP_PATH)) {
    existing = JSON.parse(readFileSync(MAP_PATH, "utf8"));
  }

  const map = { ...existing };
  const businessDirs = readdirSync(PUBLIC_DIR, { withFileTypes: true }).filter((d) => d.isDirectory());
  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const dir of businessDirs) {
    const businessId = dir.name;
    const absDir = path.join(PUBLIC_DIR, businessId);
    const folder = `submit-your-store/businesses/${businessId}`;
    const files = readdirSync(absDir).filter((f) => f.endsWith(".webp"));

    if (!map[businessId]) map[businessId] = { logo: null, gallery: [] };

    for (const file of files) {
      const publicId = file.replace(/\.webp$/i, "");
      const filePath = path.join(absDir, file);

      if (publicId === "logo" && map[businessId].logo) {
        skipped += 1;
        continue;
      }
      if (publicId.startsWith("gallery-")) {
        const already = map[businessId].gallery.some((u) => u.includes(`/${publicId}.`) || u.includes(`/${publicId}/`));
        if (already) {
          skipped += 1;
          continue;
        }
      }

      try {
        const result = await uploadFile(filePath, folder, publicId);
        if (publicId === "logo") {
          map[businessId].logo = result.secure_url;
        } else if (publicId.startsWith("gallery-")) {
          const idx = map[businessId].gallery.findIndex((g) => g.includes(`/${publicId}`));
          if (idx >= 0) map[businessId].gallery[idx] = result.secure_url;
          else map[businessId].gallery.push(result.secure_url);
          map[businessId].gallery.sort();
        }
        uploaded += 1;
        process.stdout.write(`\rUploaded ${uploaded} files…`);
      } catch (err) {
        failed += 1;
        console.error(`\nFAIL ${filePath}:`, err.message ?? err);
      }
    }
  }

  writeFileSync(MAP_PATH, JSON.stringify(map, null, 2) + "\n", "utf8");
  console.log(`\nDone. uploaded=${uploaded} skipped=${skipped} failed=${failed}`);
  console.log("Map saved:", MAP_PATH);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
