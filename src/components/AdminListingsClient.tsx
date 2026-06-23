"use client";

import { useState } from "react";
import Link from "next/link";
import { ListingCategorySelect } from "@/components/ListingCategorySelect";
import { ListingSocialFields, emptySocialForm, socialFormToLinks } from "@/components/ListingMediaUpload";
import { getDefaultListingCategoryKey } from "@/lib/categories-config";
import { ADMIN_CSV_FORMAT } from "@/lib/admin-csv-format";

type Tab = "single" | "csv";

type CsvResult = {
  businessName: string;
  ok: boolean;
  businessUrl?: string;
  error?: string;
  flagged?: string;
};

type CsvPreview = {
  rowCount: number;
  delimiter: string;
  headerMappings: { original: string; normalized: string; canonical: string }[];
  sampleValidation: { ok: boolean; error?: string; missingFields?: string[] };
};

export function AdminListingsClient() {
  const [tab, setTab] = useState<Tab>("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);
  const [csvResults, setCsvResults] = useState<CsvResult[]>([]);
  const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [businessName, setBusinessName] = useState("");
  const [gbpUrl, setGbpUrl] = useState("");
  const [categoryKey, setCategoryKey] = useState(getDefaultListingCategoryKey);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Dallas");
  const [state, setState] = useState("TX");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [galleryUrls, setGalleryUrls] = useState("");
  const [rating, setRating] = useState("");
  const [reviewCount, setReviewCount] = useState("");
  const [social, setSocial] = useState(emptySocialForm());

  async function handleSingleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const gallery = galleryUrls
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          gbpUrl: gbpUrl || undefined,
          categoryKey,
          address,
          city,
          state,
          website: website || undefined,
          email: email || undefined,
          phone,
          description: description || undefined,
          logoUrl: logoUrl || undefined,
          galleryUrls: gallery,
          googleRating: rating ? Number(rating) : undefined,
          googleReviewCount: reviewCount ? Number(reviewCount) : undefined,
          social: socialFormToLinks(social),
        }),
      });
      const data = (await res.json()) as { error?: string; businessUrl?: string; message?: string };
      if (!res.ok) {
        setError(data.error ?? "Publish failed.");
        return;
      }
      setSuccess(data.message ?? "Published!");
      if (data.businessUrl) {
        setTimeout(() => {
          window.location.href = data.businessUrl!;
        }, 1200);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCsvFileChange(file: File | null) {
    if (!file) {
      setCsvPreview(null);
      return;
    }
    setPreviewLoading(true);
    setCsvPreview(null);
    try {
      const body = new FormData();
      body.append("file", file);
      body.append("preview", "true");
      const res = await fetch("/api/admin/listings/csv", { method: "POST", body });
      const data = (await res.json()) as CsvPreview & { error?: string };
      if (res.ok) {
        setCsvPreview(data);
      }
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleCsvSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    setCsvResults([]);
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem("csvFile") as HTMLInputElement;
    const file = fileInput.files?.[0];
    if (!file) {
      setError("Choose a CSV file.");
      setLoading(false);
      return;
    }

    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/listings/csv", { method: "POST", body });
      const data = (await res.json()) as {
        error?: string;
        published?: number;
        failed?: number;
        results?: CsvResult[];
      };
      if (!res.ok) {
        setError(data.error ?? "CSV import failed.");
        return;
      }
      setCsvResults(data.results ?? []);
      setSuccess(`Published ${data.published ?? 0} listings (${data.failed ?? 0} failed).`);
    } finally {
      setLoading(false);
    }
  }

  async function copyFormat() {
    await navigator.clipboard.writeText(ADMIN_CSV_FORMAT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTab("single")}
            className={`rounded px-4 py-2 text-sm font-semibold ${tab === "single" ? "bg-[#1274c0] text-white" : "border border-[#ccc] bg-white"}`}
          >
            Single listing
          </button>
          <button
            type="button"
            onClick={() => setTab("csv")}
            className={`rounded px-4 py-2 text-sm font-semibold ${tab === "csv" ? "bg-[#1274c0] text-white" : "border border-[#ccc] bg-white"}`}
          >
            CSV upload
          </button>
        </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700 whitespace-pre-wrap">{error}</p>}
      {success && <p className="rounded bg-green-50 p-3 text-sm text-green-800">{success}</p>}

      {tab === "single" ? (
        <form onSubmit={handleSingleSubmit} className="space-y-4 rounded border bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Business name *</span>
              <input required value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Google Business Profile URL</span>
              <input value={gbpUrl} onChange={(e) => setGbpUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <div className="sm:col-span-2">
              <ListingCategorySelect value={categoryKey} onChange={setCategoryKey} />
            </div>
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
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Description</span>
              <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Logo URL (auto-converts to WebP on Cloudinary)</span>
              <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="font-medium">Gallery image URLs (one per line)</span>
              <textarea rows={3} value={galleryUrls} onChange={(e) => setGalleryUrls(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Google rating</span>
              <input value={rating} onChange={(e) => setRating(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
            <label className="block text-sm">
              <span className="font-medium">Review count</span>
              <input value={reviewCount} onChange={(e) => setReviewCount(e.target.value)} className="mt-1 w-full rounded border px-3 py-2 text-sm" />
            </label>
          </div>
          <ListingSocialFields value={social} onChange={setSocial} />
          <button type="submit" disabled={loading} className="jd-btn-primary rounded px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
            {loading ? "Publishing…" : "Publish listing now"}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="rounded border border-[#1274c0]/30 bg-[#f0f7fd] p-4">
            <p className="text-sm font-semibold text-[#1274c0]">Flexible upload — smart header detection</p>
            <p className="mt-2 text-sm text-[#555]">
              Sirf <strong>GBP URL + Business name + Description</strong> se publish ho jayega. Baaki fields optional.
              Headers flexible hain — <code className="text-xs">Mobile</code> → phone,{" "}
              <code className="text-xs">GBP</code> / <code className="text-xs">GBP URL</code> /{" "}
              <code className="text-xs">GBP urls</code> → gbp_url, <code className="text-xs">Company</code> → name.
              Agar naam GBP se alag hai toh <Link href="/admin/data-issues" className="text-[#1274c0] hover:underline">Data issues</Link> mein flag hoga.
            </p>
          </div>

          <div className="rounded border bg-[#f8fafc] p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#333]">CSV format (tab-separated — recommended)</p>
                <p className="mt-1 text-xs text-[#717171]">
                  Save as <strong>.tsv</strong> or tab-delimited. If using commas, quote any field that contains commas
                  (especially Google Maps URLs). Duplicate GBP URLs are rejected — remove them from the file and re-upload.
                  Images download and convert to WebP on Cloudinary.
                </p>
              </div>
              <button type="button" onClick={() => void copyFormat()} className="rounded border bg-white px-3 py-1.5 text-xs font-semibold hover:bg-[#fafafa]">
                {copied ? "Copied!" : "Copy format"}
              </button>
            </div>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-xs text-[#555]">{ADMIN_CSV_FORMAT}</pre>
          </div>

          <form onSubmit={handleCsvSubmit} className="rounded border bg-white p-6 shadow-sm">
            <label className="block text-sm">
              <span className="font-medium">Upload CSV / TSV file</span>
              <input
                name="csvFile"
                type="file"
                accept=".csv,.tsv,.txt"
                required
                onChange={(e) => void handleCsvFileChange(e.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm"
              />
            </label>

            {previewLoading && <p className="mt-3 text-sm text-[#717171]">Analyzing headers…</p>}

            {csvPreview && (
              <div className="mt-4 rounded border border-[#e8e8e8] bg-[#fafafa] p-4 text-sm">
                <p className="font-semibold text-[#111]">
                  {csvPreview.rowCount} rows · {csvPreview.delimiter === "tab" ? "Tab" : "Comma"} delimiter
                </p>
                {!csvPreview.sampleValidation.ok && (
                  <p className="mt-1 text-[#b45309]">
                    Sample row: {csvPreview.sampleValidation.error}
                  </p>
                )}
                <table className="mt-3 w-full text-xs">
                  <thead>
                    <tr className="text-left text-[#717171]">
                      <th className="py-1 pr-2">Your header</th>
                      <th className="py-1 pr-2">→</th>
                      <th className="py-1">Mapped to</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.headerMappings.map((m) => (
                      <tr key={m.original} className="border-t border-[#eee]">
                        <td className="py-1.5 font-mono">{m.original || "(empty)"}</td>
                        <td className="py-1.5">→</td>
                        <td className="py-1.5 font-mono text-[#1274c0]">{m.canonical}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <button type="submit" disabled={loading} className="mt-4 jd-btn-primary rounded px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
              {loading ? "Importing…" : "Import & publish CSV"}
            </button>
          </form>

          {csvResults.length > 0 && (
            <div className="overflow-x-auto rounded border bg-white">
              <table className="min-w-full text-sm">
                <thead className="bg-[#fafafa] text-left">
                  <tr>
                    <th className="px-3 py-2">Business</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {csvResults.map((row) => (
                    <tr key={row.businessName + (row.businessUrl ?? row.error)} className="border-t">
                      <td className="px-3 py-2">{row.businessName}</td>
                      <td className="max-w-md px-3 py-2 whitespace-pre-wrap">
                        {row.ok ? (
                          <>
                            Published
                            {row.flagged && (
                              <span className="mt-1 block text-xs text-[#b45309]">⚠ {row.flagged}</span>
                            )}
                          </>
                        ) : (
                          row.error
                        )}
                      </td>
                      <td className="px-3 py-2">
                        {row.businessUrl ? (
                          <Link href={row.businessUrl} className="text-[#1274c0] hover:underline">
                            View
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
