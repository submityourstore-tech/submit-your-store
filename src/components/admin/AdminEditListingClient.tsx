"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingCategorySelect } from "@/components/ListingCategorySelect";
import { ListingSocialFields, emptySocialForm, socialFormToLinks } from "@/components/ListingMediaUpload";
import { getDefaultListingCategoryKey } from "@/lib/categories-config";
import type { AboutBlock, Business, BusinessFaq, WeeklyHoursEntry } from "@/types/business";

type AdminEditListingClientProps = {
  businessId: string;
};

function categoryKeyFromBusiness(b: Business): string {
  const vertical = b.vertical ?? "home-services";
  return `${vertical}:${b.categorySlug}`;
}

function socialFromBusiness(b: Business) {
  return {
    facebook: b.social.facebook ?? "",
    instagram: b.social.instagram ?? "",
    linkedin: b.social.linkedin ?? "",
    youtube: b.social.youtube ?? "",
    twitter: b.social.twitter ?? "",
  };
}

function weeklyHoursToText(hours: WeeklyHoursEntry[] | undefined): string {
  if (!hours?.length) return "";
  return hours.map((h) => `${h.day}: ${h.hours}`).join("\n");
}

function textToWeeklyHours(text: string): WeeklyHoursEntry[] {
  return text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { day: line, hours: "Hours vary" };
      return { day: line.slice(0, idx).trim(), hours: line.slice(idx + 1).trim() || "Hours vary" };
    });
}

function emptyAboutBlock(): AboutBlock {
  return { heading: "", body: "", bullets: [] };
}

function emptyFaq(): BusinessFaq {
  return { question: "", answer: "" };
}

export function AdminEditListingClient({ businessId }: AdminEditListingClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "hidden">("active");
  const [categoryKey, setCategoryKey] = useState(getDefaultListingCategoryKey);
  const [gbpUrl, setGbpUrl] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [review1, setReview1] = useState("");
  const [review2, setReview2] = useState("");
  const [review3, setReview3] = useState("");
  const [hoursStatus, setHoursStatus] = useState("");
  const [weeklyHoursText, setWeeklyHoursText] = useState("");
  const [social, setSocial] = useState(emptySocialForm());
  const [aboutBlocks, setAboutBlocks] = useState<AboutBlock[]>([]);
  const [faqs, setFaqs] = useState<BusinessFaq[]>([]);

  useEffect(() => {
    void fetch(`/api/admin/businesses/${businessId}`)
      .then((r) => r.json())
      .then((d: { business?: Business; error?: string }) => {
        if (!d.business) {
          setError(d.error ?? "Not found.");
          return;
        }
        const b = d.business;
        setName(b.name);
        setStatus(b.status ?? "active");
        setCategoryKey(categoryKeyFromBusiness(b));
        setGbpUrl(b.googleMapsUrl ?? "");
        setAddress(b.address ?? "");
        setCity(b.city);
        setState(b.state);
        setWebsite(b.website ?? "");
        setEmail(b.email ?? "");
        setPhone(b.phone);
        setDescription(b.description);
        setLogoUrl(b.logo ?? "");
        setGalleryUrls((b.gallery ?? []).join("\n"));
        setRating(b.googleRating != null ? String(b.googleRating) : "");
        setReviewCount(b.googleReviewCount != null ? String(b.googleReviewCount) : "");
        setReview1(b.googleReviews?.[0] ?? "");
        setReview2(b.googleReviews?.[1] ?? "");
        setReview3(b.googleReviews?.[2] ?? "");
        setHoursStatus(b.hoursStatus ?? "");
        setWeeklyHoursText(weeklyHoursToText(b.weeklyHours));
        setSocial(socialFromBusiness(b));
        setAboutBlocks(b.aboutBlocks?.length ? b.aboutBlocks : []);
        setFaqs(b.faqs?.length ? b.faqs : []);
      })
      .catch(() => setError("Failed to load listing."))
      .finally(() => setLoading(false));
  }, [businessId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const googleReviews = [review1, review2, review3].map((r) => r.trim()).filter(Boolean);
    const gallery = galleryUrls
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await fetch(`/api/admin/businesses/${businessId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        status,
        categoryKey,
        gbpUrl: gbpUrl || null,
        address,
        city,
        state,
        website: website || null,
        email: email || null,
        phone,
        description,
        logoUrl: logoUrl || null,
        galleryUrls: gallery,
        googleRating: rating ? Number(rating) : null,
        googleReviewCount: reviewCount ? Number(reviewCount) : null,
        googleReviews,
        hoursStatus: hoursStatus || undefined,
        weeklyHours: textToWeeklyHours(weeklyHoursText),
        social: socialFormToLinks(social),
        aboutBlocks: aboutBlocks.filter((b) => b.heading.trim() || b.body.trim()),
        faqs: faqs.filter((f) => f.question.trim() && f.answer.trim()),
      }),
    });

    const data = (await res.json()) as { error?: string; business?: Business };
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Save failed.");
      return;
    }

    setSuccess("Listing updated successfully.");
    if (data.business) {
      setGalleryUrls((data.business.gallery ?? []).join("\n"));
      if (data.business.logo) setLogoUrl(data.business.logo);
    }
  }

  async function handleDelete() {
    if (!confirm(`Permanently delete "${name}"? This cannot be undone.`)) return;
    setSaving(true);
    const res = await fetch(`/api/admin/businesses/${businessId}`, { method: "DELETE" });
    setSaving(false);
    if (!res.ok) {
      setError("Delete failed.");
      return;
    }
    router.push("/admin/dashboard");
  }

  if (loading) return <p className="text-sm text-[#717171]">Loading listing…</p>;
  if (error && !name) {
    return (
      <div className="rounded border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}{" "}
        <Link href="/admin/dashboard" className="font-semibold underline">
          Back to listings
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href="/admin/dashboard" className="text-sm text-[#1274c0] hover:underline">
          ← All listings
        </Link>
        <a
          href={`/business/${businessId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#717171] hover:underline"
        >
          View live page
        </a>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">{error}</p>}
      {success && <p className="rounded bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#1274c0]">General</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Business name *</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Status</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as "active" | "hidden")} className="mt-1 w-full rounded border px-3 py-2 text-sm">
              <option value="active">Active (published)</option>
              <option value="hidden">Hidden (unpublished)</option>
            </select>
          </label>
          <div className="sm:col-span-2">
            <ListingCategorySelect value={categoryKey} onChange={setCategoryKey} />
          </div>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Description</span>
            <textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#1274c0]">Location & contact</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Google Business Profile URL</span>
            <input value={gbpUrl} onChange={(e) => setGbpUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Address</span>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">City</span>
            <input value={city} onChange={(e) => setCity(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">State</span>
            <input value={state} onChange={(e) => setState(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Phone</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Email</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Website</span>
            <input value={website} onChange={(e) => setWebsite(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
        </div>
        <div className="mt-4">
          <ListingSocialFields value={social} onChange={setSocial} />
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#1274c0]">Media</h2>
        <p className="mt-1 text-xs text-[#717171]">Paste Cloudinary URLs or remote http URLs (auto-converts to WebP).</p>
        <div className="mt-4 space-y-4">
          <label className="block text-sm">
            <span className="font-medium">Logo URL</span>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Gallery URLs (one per line)</span>
            <textarea rows={4} value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-[#1274c0]">Reviews & hours</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="font-medium">Google rating</span>
            <input value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm">
            <span className="font-medium">Review count</span>
            <input value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Top review 1</span>
            <textarea rows={2} value={review1} onChange={(e) => setReview1(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Top review 2</span>
            <textarea rows={2} value={review2} onChange={(e) => setReview2(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Top review 3</span>
            <textarea rows={2} value={review3} onChange={(e) => setReview3(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Hours status (e.g. Open now)</span>
            <input value={hoursStatus} onChange={(e) => setHoursStatus(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="font-medium">Weekly hours (one per line: Mon: 9 AM – 5 PM)</span>
            <textarea rows={4} value={weeklyHoursText} onChange={(e) => setWeeklyHoursText(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm font-mono text-xs" />
          </label>
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#1274c0]">About blocks</h2>
          <button
            type="button"
            onClick={() => setAboutBlocks([...aboutBlocks, emptyAboutBlock()])}
            className="rounded border px-2 py-1 text-xs font-semibold hover:bg-[#fafafa]"
          >
            + Add block
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {aboutBlocks.length === 0 && (
            <p className="text-sm text-[#717171]">No about blocks — default description shows on the page.</p>
          )}
          {aboutBlocks.map((block, i) => (
            <div key={i} className="rounded border border-[#eee] p-4">
              <div className="mb-2 flex justify-between">
                <span className="text-xs font-semibold text-[#717171]">Block {i + 1}</span>
                <button type="button" onClick={() => setAboutBlocks(aboutBlocks.filter((_, j) => j !== i))} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
              <input
                placeholder="Heading"
                value={block.heading}
                onChange={(e) => {
                  const next = [...aboutBlocks];
                  next[i] = { ...block, heading: e.target.value };
                  setAboutBlocks(next);
                }}
                className="mb-2 w-full rounded border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Body text"
                rows={3}
                value={block.body}
                onChange={(e) => {
                  const next = [...aboutBlocks];
                  next[i] = { ...block, body: e.target.value };
                  setAboutBlocks(next);
                }}
                className="mb-2 w-full rounded border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Bullets (one per line, optional)"
                rows={2}
                value={(block.bullets ?? []).join("\n")}
                onChange={(e) => {
                  const next = [...aboutBlocks];
                  next[i] = {
                    ...block,
                    bullets: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  };
                  setAboutBlocks(next);
                }}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#1274c0]">FAQs</h2>
          <button type="button" onClick={() => setFaqs([...faqs, emptyFaq()])} className="rounded border px-2 py-1 text-xs font-semibold hover:bg-[#fafafa]">
            + Add FAQ
          </button>
        </div>
        <div className="mt-4 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded border border-[#eee] p-4">
              <div className="mb-2 flex justify-between">
                <span className="text-xs font-semibold text-[#717171]">FAQ {i + 1}</span>
                <button type="button" onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="text-xs text-red-600 hover:underline">
                  Remove
                </button>
              </div>
              <input
                placeholder="Question"
                value={faq.question}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...faq, question: e.target.value };
                  setFaqs(next);
                }}
                className="mb-2 w-full rounded border px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Answer"
                rows={2}
                value={faq.answer}
                onChange={(e) => {
                  const next = [...faqs];
                  next[i] = { ...faq, answer: e.target.value };
                  setFaqs(next);
                }}
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3 border-t pt-4">
        <button type="submit" disabled={saving} className="jd-btn-primary rounded px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          disabled={saving}
          onClick={() => void handleDelete()}
          className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Delete listing
        </button>
      </div>
    </form>
  );
}
