function cloudName(): string | null {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ||
    process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
    null
  );
}

function businessFolder(businessId: string): string {
  return `submit-your-store/businesses/${businessId.replace(/[^a-zA-Z0-9-]/g, "")}`;
}

function cloudinaryUrl(businessId: string, publicId: string): string | null {
  const name = cloudName();
  if (!name) return null;
  return `https://res.cloudinary.com/${name}/image/upload/f_webp/${businessFolder(businessId)}/${publicId}`;
}

function publicIdFromPath(url: string): string | null {
  const file = url.split("/").pop();
  if (!file) return null;
  return file.replace(/\.webp$/i, "");
}

export function resolveMediaUrl(businessId: string, url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const publicId = publicIdFromPath(url);
  if (!publicId) return url;

  return cloudinaryUrl(businessId, publicId) ?? url;
}

export function resolveGalleryUrls(businessId: string, gallery: string[] | null | undefined): string[] {
  if (!gallery?.length) return [];
  return gallery
    .map((url) => resolveMediaUrl(businessId, url) ?? url)
    .filter((url) => url.startsWith("http"));
}
