import { existsSync, readdirSync } from "fs";
import path from "path";
import { getCloudinary, cloudinaryBusinessFolder } from "@/lib/cloudinary.server";
import { pendingMediaDir } from "@/lib/listing-media";

async function uploadImage(filePath: string, folder: string, publicId: string): Promise<string> {
  const result = await getCloudinary().uploader.upload(filePath, {
    folder,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });
  return result.secure_url;
}

/** Upload pending session files to Cloudinary; returns public URLs for Supabase. */
export async function uploadPendingMediaToCloudinary(
  sessionId: string | undefined,
  businessId: string,
): Promise<{ logo?: string; gallery: string[] }> {
  if (!sessionId) return { gallery: [] };

  const dir = pendingMediaDir(sessionId);
  if (!existsSync(dir)) return { gallery: [] };

  const folder = cloudinaryBusinessFolder(businessId);
  const gallery: string[] = [];
  let logo: string | undefined;

  const logoPath = path.join(dir, "logo.webp");
  if (existsSync(logoPath)) {
    logo = await uploadImage(logoPath, folder, "logo");
  }

  const galleryFiles = readdirSync(dir)
    .filter((f) => f.startsWith("gallery-") && f.endsWith(".webp"))
    .sort();

  for (const fileName of galleryFiles) {
    const match = fileName.match(/^gallery-(\d+)\.webp$/);
    const index = match?.[1] ?? String(gallery.length + 1);
    const url = await uploadImage(path.join(dir, fileName), folder, `gallery-${index}`);
    gallery.push(url);
  }

  return { logo, gallery };
}

function isLocalMediaUrl(url: string): boolean {
  return url.startsWith("/businesses/") || url.startsWith("/uploads/pending/");
}

/** Normalize payload media URLs — local paths become Cloudinary URLs when possible. */
export async function resolveListingMediaUrls(
  businessId: string,
  sessionId: string | undefined,
  logo?: string,
  gallery?: string[],
): Promise<{ logo?: string; gallery: string[] }> {
  const uploaded = await uploadPendingMediaToCloudinary(sessionId, businessId);

  const resolvedLogo = logo?.trim();
  let finalLogo = uploaded.logo;
  if (resolvedLogo && !isLocalMediaUrl(resolvedLogo)) {
    finalLogo = resolvedLogo;
  }

  const payloadGallery = gallery?.filter((url) => url.trim()) ?? [];
  if (payloadGallery.length > 0) {
    const remote = payloadGallery.filter((url) => !isLocalMediaUrl(url));
    return {
      logo: finalLogo,
      gallery: remote.length > 0 ? remote : uploaded.gallery,
    };
  }

  return { logo: finalLogo, gallery: uploaded.gallery };
}
