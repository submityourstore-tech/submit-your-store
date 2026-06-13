import sharp from "sharp";

const LOGO_MAX = 256;
const GALLERY_MAX_WIDTH = 1200;

export async function processLogoImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(LOGO_MAX, LOGO_MAX, {
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.8 })
    .webp({ quality: 86, effort: 4 })
    .toBuffer();
}

export async function processGalleryImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize(GALLERY_MAX_WIDTH, GALLERY_MAX_WIDTH, {
      fit: "inside",
      withoutEnlargement: false,
      kernel: sharp.kernel.lanczos3,
    })
    .sharpen({ sigma: 0.6 })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export async function validateImageBuffer(input: Buffer): Promise<{ width: number; height: number }> {
  const meta = await sharp(input).metadata();
  if (!meta.width || !meta.height) {
    throw new Error("Invalid image file.");
  }
  if (meta.width < 32 || meta.height < 32) {
    throw new Error("Image is too small (minimum 32×32).");
  }
  return { width: meta.width, height: meta.height };
}
