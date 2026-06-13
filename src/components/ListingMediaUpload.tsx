"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { SocialLinks } from "@/types/business";

type ListingMediaUploadProps = {
  sessionId: string;
  businessId?: string;
  manageToken?: string;
  logoUrl: string | null;
  galleryUrls: string[];
  onLogoChange: (url: string | null) => void;
  onGalleryChange: (urls: string[]) => void;
};

export function ListingMediaUpload({
  sessionId,
  businessId,
  manageToken,
  logoUrl,
  galleryUrls,
  onLogoChange,
  onGalleryChange,
}: ListingMediaUploadProps) {
  const logoRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"logo" | "gallery" | null>(null);
  const [error, setError] = useState("");

  async function upload(file: File, type: "logo" | "gallery") {
    setError("");
    setUploading(type);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("type", type);
      fd.append("sessionId", sessionId);
      if (businessId) fd.append("businessId", businessId);
      if (manageToken) fd.append("token", manageToken);

      const res = await fetch("/api/listings/upload-media", { method: "POST", body: fd });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      if (type === "logo") {
        onLogoChange(data.url);
      } else {
        onGalleryChange([...galleryUrls, data.url]);
      }
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploading(null);
    }
  }

  function removeGallery(url: string) {
    onGalleryChange(galleryUrls.filter((u) => u !== url));
  }

  return (
    <div className="space-y-4 rounded border border-[#e8e8e8] bg-[#fafafa] p-4">
      <p className="text-sm font-semibold text-[#111]">Photos</p>
      <p className="text-xs text-[#717171]">
        Images are auto-converted to WebP, enhanced, and compressed on upload.
      </p>

      <div>
        <span className="text-sm font-medium text-[#333]">Business logo</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          {logoUrl ? (
            <div className="relative h-20 w-20 overflow-hidden rounded border border-[#ddd] bg-white">
              <Image src={logoUrl} alt="Logo preview" width={80} height={80} className="object-contain p-1" />
            </div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded border border-dashed border-[#ccc] bg-white text-xs text-[#999]">
              No logo
            </div>
          )}
          <div>
            <input
              ref={logoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "logo");
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading === "logo"}
              onClick={() => logoRef.current?.click()}
              className="rounded border border-[#1274c0] px-3 py-1.5 text-sm font-medium text-[#1274c0] hover:bg-[#f0f7fd] disabled:opacity-50"
            >
              {uploading === "logo" ? "Uploading…" : logoUrl ? "Replace logo" : "Upload logo"}
            </button>
            {logoUrl && (
              <button
                type="button"
                onClick={() => onLogoChange(null)}
                className="ml-2 text-sm text-[#717171] hover:underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div>
        <span className="text-sm font-medium text-[#333]">Store / gallery photos</span>
        <p className="text-xs text-[#717171]">Up to 3 photos of your shop, team, or work.</p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {galleryUrls.map((url) => (
            <div key={url} className="relative overflow-hidden rounded border border-[#ddd] bg-white">
              <Image src={url} alt="" width={200} height={150} className="h-auto w-full object-cover" />
              <button
                type="button"
                onClick={() => removeGallery(url)}
                className="absolute top-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        {galleryUrls.length < 3 && (
          <>
            <input
              ref={galleryRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void upload(f, "gallery");
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading === "gallery"}
              onClick={() => galleryRef.current?.click()}
              className="mt-2 rounded border border-[#1274c0] px-3 py-1.5 text-sm font-medium text-[#1274c0] hover:bg-[#f0f7fd] disabled:opacity-50"
            >
              {uploading === "gallery" ? "Uploading…" : "Add photo"}
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

const SOCIAL_FIELDS = [
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "X (Twitter)" },
] as const;

export type SocialFormState = {
  facebook: string;
  instagram: string;
  linkedin: string;
  youtube: string;
  twitter: string;
};

export const emptySocialForm = (): SocialFormState => ({
  facebook: "",
  instagram: "",
  linkedin: "",
  youtube: "",
  twitter: "",
});

export function ListingSocialFields({
  value,
  onChange,
}: {
  value: SocialFormState;
  onChange: (v: SocialFormState) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#111]">Social links</p>
      <p className="text-xs text-[#717171]">Optional — full URL for each profile.</p>
      {SOCIAL_FIELDS.map(({ key, label }) => (
        <label key={key} className="block text-sm">
          <span className="font-medium text-[#333]">{label}</span>
          <input
            type="url"
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            placeholder={`https://${key === "twitter" ? "x.com" : key + ".com"}/your-page`}
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>
      ))}
    </div>
  );
}

export function socialFormToLinks(form: SocialFormState): SocialLinks {
  return {
    facebook: form.facebook.trim() || null,
    instagram: form.instagram.trim() || null,
    linkedin: form.linkedin.trim() || null,
    youtube: form.youtube.trim() || null,
    twitter: form.twitter.trim() || null,
  };
}
