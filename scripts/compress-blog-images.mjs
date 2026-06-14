import sharp from "sharp";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "blog");
const MAX_BYTES = 20 * 1024;

const ASSET_DIR = path.join(
  process.env.USERPROFILE ?? "C:\\Users\\PC",
  ".cursor",
  "projects",
  "c-Users-PC-Desktop-submit-your-store",
  "assets",
);

const SOURCES = [
  {
    slug: "dallas",
    file: "c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-102dca18-d48b-418c-a2ae-04d78a69679e.png",
  },
  {
    slug: "houston",
    file: "c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-789ef233-b549-4a17-a795-efc79ca04d2f.png",
  },
  {
    slug: "austin",
    file: "c__Users_PC_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_image-f3ae94a2-07bd-47e0-ad0c-fbd2ad5eb1b0.png",
  },
];

async function encodeBanner(input, width, quality) {
  const height = Math.round(width * (9 / 16));
  return sharp(input)
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" })
    .modulate({ saturation: 1.04 })
    .sharpen({ sigma: 1.3, m1: 0.6, m2: 2.8 })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
}

async function compressBanner(inputPath, outputPath) {
  const input = await readFile(inputPath);
  let best = null;

  for (const width of [768, 720, 680, 640, 600, 560, 520, 480]) {
    for (let quality = 58; quality >= 22; quality -= 2) {
      const buf = await encodeBanner(input, width, quality);
      const meta = { buf, bytes: buf.length, width, height: Math.round(width * (9 / 16)), quality };

      if (!best || (meta.bytes <= MAX_BYTES && meta.bytes > best.bytes) || (best.bytes > MAX_BYTES && meta.bytes < best.bytes)) {
        best = meta;
      }

      if (buf.length <= MAX_BYTES) {
        await writeFile(outputPath, buf);
        return meta;
      }
    }
  }

  if (!best) throw new Error("Could not encode image");
  await writeFile(outputPath, best.buf);
  return best;
}

await mkdir(OUT_DIR, { recursive: true });

for (const { slug, file } of SOURCES) {
  const src = path.join(ASSET_DIR, file);
  const out = path.join(OUT_DIR, `${slug}.webp`);
  try {
    const meta = await compressBanner(src, out);
    const kb = (meta.bytes / 1024).toFixed(1);
    const ok = meta.bytes <= MAX_BYTES ? "OK" : "WARN";
    console.log(`${ok} ${slug}.webp — ${kb} KB (${meta.width}×${meta.height}, q${meta.quality})`);
  } catch (err) {
    console.error(`FAIL ${slug}:`, err.message);
  }
}
