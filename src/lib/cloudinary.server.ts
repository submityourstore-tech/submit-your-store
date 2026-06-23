import { v2 as cloudinary } from "cloudinary";

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) return;

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      "Missing Cloudinary env vars. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.",
    );
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  configured = true;
}

export function getCloudinary() {
  ensureCloudinaryConfig();
  return cloudinary;
}

export function cloudinaryBusinessFolder(businessId: string): string {
  return `submit-your-store/businesses/${businessId.replace(/[^a-zA-Z0-9-]/g, "")}`;
}

export function cloudinaryLogoUrl(businessId: string): string {
  ensureCloudinaryConfig();
  return cloudinary.url(`${cloudinaryBusinessFolder(businessId)}/logo`, {
    secure: true,
    fetch_format: "webp",
  });
}

export function cloudinaryGalleryUrl(businessId: string, index: number): string {
  ensureCloudinaryConfig();
  return cloudinary.url(`${cloudinaryBusinessFolder(businessId)}/gallery-${index}`, {
    secure: true,
    fetch_format: "webp",
  });
}
