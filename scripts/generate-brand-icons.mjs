import { existsSync, mkdirSync } from "fs";
import path from "path";
import sharp from "sharp";
import { readFileSync } from "fs";

const root = path.resolve(import.meta.dirname, "..");
const brandDir = path.join(root, "public", "brand");
const appDir = path.join(root, "src", "app");
mkdirSync(brandDir, { recursive: true });

const sourcePng = path.join(brandDir, "logo.png");
const sourceSvg = path.join(brandDir, "logo.svg");
const input = existsSync(sourcePng) ? sourcePng : sourceSvg;

if (!existsSync(input)) {
  console.error("Missing public/brand/logo.png or logo.svg");
  process.exit(1);
}

async function fromSource(size, dest) {
  const base = existsSync(sourcePng)
    ? sharp(sourcePng)
    : sharp(readFileSync(sourceSvg), { density: 300 });
  await base.resize(size, size, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } }).png().toFile(dest);
}

await fromSource(512, path.join(brandDir, "logo.png"));
await fromSource(192, path.join(brandDir, "logo-192.png"));
await fromSource(32, path.join(appDir, "icon.png"));
await fromSource(180, path.join(appDir, "apple-icon.png"));

console.log(`Brand icons generated from ${path.basename(input)}.`);
