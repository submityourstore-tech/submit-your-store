"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Business } from "@/types/business";
import {
  emptySocialForm,
  ListingMediaUpload,
  ListingSocialFields,
  socialFormToLinks,
  type SocialFormState,
} from "@/components/ListingMediaUpload";

type ManageListingEditorProps = {
  businessId: string;
};

function socialFromBusiness(b: Business): SocialFormState {
  return {
    facebook: b.social.facebook ?? "",
    instagram: b.social.instagram ?? "",
    linkedin: b.social.linkedin ?? "",
    youtube: b.social.youtube ?? "",
    twitter: b.social.twitter ?? "",
  };
}

export function ManageListingEditor({ businessId }: ManageListingEditorProps) {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [social, setSocial] = useState(() => emptySocialForm());
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);
  const [uploadSessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `manage-${Date.now()}`,
  );
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    address: "",
  });

  useEffect(() => {
    async function load() {
      const qs = token ? `?token=${encodeURIComponent(token)}` : "";
      const res = await fetch(`/api/listings/manage/${businessId}${qs}`);
      const data = (await res.json()) as { business?: Business; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Access denied.");
        setLoading(false);
        return;
      }
      const b = data.business!;
      setBusiness(b);
      setForm({
        name: b.name,
        phone: b.phone,
        email: b.email ?? "",
        website: b.website ?? "",
        description: b.description,
        address: b.address ?? "",
      });
      setSocial(socialFromBusiness(b));
      setLogoUrl(b.logo ?? null);
      setGalleryUrls(b.gallery ?? []);
      setLoading(false);
    }
    load();
  }, [businessId, token]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaved(false);
    setError("");
    const qs = token ? `?token=${encodeURIComponent(token)}` : "";
    const res = await fetch(`/api/listings/manage/${businessId}${qs}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        social: socialFormToLinks(social),
        logo: logoUrl,
        gallery: galleryUrls,
      }),
    });
    const data = (await res.json()) as { error?: string; business?: Business };
    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }
    if (data.business) setBusiness(data.business);
    setSaved(true);
  }

  if (loading) return <p className="text-sm text-[#717171]">Loading…</p>;
  if (error && !business) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {error}. Verify your business email from{" "}
        <a href="/list-your-business" className="font-semibold underline">
          List your business
        </a>
        .
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-4 rounded border border-[#e0e0e0] bg-white p-6 shadow-sm">
      <p className="text-sm text-[#717171]">
        You verified your business email. Changes apply to your published listing.
      </p>
      {(["name", "phone", "email", "website", "address"] as const).map((key) => (
        <label key={key} className="block text-sm">
          <span className="font-medium capitalize text-[#333]">{key}</span>
          <input
            type={key === "email" ? "email" : "text"}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
          />
        </label>
      ))}
      <label className="block text-sm">
        <span className="font-medium text-[#333]">Description</span>
        <textarea
          rows={5}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
      </label>
      <ListingSocialFields value={social} onChange={setSocial} />
      <ListingMediaUpload
        sessionId={uploadSessionId}
        businessId={businessId}
        manageToken={token ?? undefined}
        logoUrl={logoUrl}
        galleryUrls={galleryUrls}
        onLogoChange={setLogoUrl}
        onGalleryChange={setGalleryUrls}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-[#25a244]">Listing updated successfully.</p>}
      <button type="submit" className="jd-btn-primary rounded px-5 py-2.5 text-sm font-semibold">
        Save changes
      </button>
    </form>
  );
}
