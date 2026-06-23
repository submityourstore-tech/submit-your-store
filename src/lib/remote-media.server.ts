import { cloudinaryBusinessFolder, getCloudinary } from "@/lib/cloudinary.server";

const UPLOAD_OPTS = {
  overwrite: true,
  resource_type: "image" as const,
  format: "webp" as const,
  quality: 85,
};

function uploadBufferToCloudinary(
  buffer: Buffer,
  folder: string,
  publicId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = getCloudinary().uploader.upload_stream(
      { folder, public_id: publicId, ...UPLOAD_OPTS },
      (error, result) => {
        if (error || !result?.secure_url) {
          reject(error ?? new Error(`Cloudinary upload failed for ${publicId}`));
          return;
        }
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
}

export async function uploadRemoteImageToCloudinary(
  imageUrl: string,
  businessId: string,
  publicId: string,
): Promise<string> {
  const trimmed = imageUrl.trim();
  if (!trimmed.startsWith("http")) {
    throw new Error(`Invalid image URL: ${trimmed}`);
  }

  const folder = cloudinaryBusinessFolder(businessId);
  const cloudinary = getCloudinary();

  try {
    const result = await cloudinary.uploader.upload(trimmed, {
      folder,
      public_id: publicId,
      ...UPLOAD_OPTS,
    });
    if (!result?.secure_url) {
      throw new Error(`Cloudinary upload failed for ${publicId}`);
    }
    return result.secure_url;
  } catch (remoteErr) {
    console.warn(`Cloudinary remote fetch failed for ${publicId}, downloading locally:`, remoteErr);

    const response = await fetch(trimmed, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) {
      throw new Error(`Failed to download image (${response.status}): ${trimmed}`);
    }

    const input = Buffer.from(await response.arrayBuffer());
    return uploadBufferToCloudinary(input, folder, publicId);
  }
}

export async function uploadBusinessMediaFromUrls(
  businessId: string,
  logoUrl?: string | null,
  galleryUrls: string[] = [],
): Promise<{ logo?: string; gallery: string[] }> {
  let logo: string | undefined;
  const gallery: string[] = [];

  if (logoUrl?.trim()) {
    try {
      logo = await uploadRemoteImageToCloudinary(logoUrl.trim(), businessId, "logo");
    } catch (err) {
      console.error(`Logo upload failed for ${businessId}:`, err);
    }
  }

  let index = 1;
  for (const url of galleryUrls) {
    if (!url?.trim()) continue;
    try {
      const uploaded = await uploadRemoteImageToCloudinary(url.trim(), businessId, `gallery-${index}`);
      gallery.push(uploaded);
      index += 1;
    } catch (err) {
      console.error(`Gallery upload failed for ${businessId} image ${index}:`, err);
    }
  }

  return { logo, gallery };
}
