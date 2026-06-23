"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type VerificationBusiness = {
  id: string;
  name: string;
  gbpUrl: string | null;
  city: string;
  state: string;
  hasData: boolean;
  verifiedAt: string | null;
};

type VerificationField = {
  id: string;
  label: string;
  description: string;
  csvHeader: string;
  verifiedCount: number;
  unverifiedCount: number;
  pendingDataCount: number;
  unverifiedBusinesses: VerificationBusiness[];
};

type BulkResult = {
  label: string;
  ok: boolean;
  businessUrl?: string;
  error?: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function AdminDataVerifyClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [fields, setFields] = useState<VerificationField[]>([]);
  const [batchSizes, setBatchSizes] = useState<Record<string, number>>({});
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<Record<string, BulkResult[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-verify");
      const data = (await res.json()) as {
        error?: string;
        totalBusinesses?: number;
        fields?: VerificationField[];
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to load verification data.");
        return;
      }
      setTotalBusinesses(data.totalBusinesses ?? 0);
      setFields(data.fields ?? []);
    } catch {
      setError("Network error loading verification data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function getBatchSize(fieldId: string): number {
    return batchSizes[fieldId] ?? 10;
  }

  function buildBatchCopy(field: VerificationField): string {
    const batchSize = getBatchSize(field.id);
    const batch = field.unverifiedBusinesses.slice(0, batchSize);

    if (field.id === "gbp_url") {
      return ["id\tbusiness_name", ...batch.map((b) => `${b.id}\t${b.name}`)].join("\n");
    }

    const urls = batch.map((b) => b.gbpUrl?.trim()).filter(Boolean) as string[];
    return urls.join("\n");
  }

  async function copyBatch(field: VerificationField) {
    const text = buildBatchCopy(field);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field.id);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  async function handleUpload(fieldId: string, file: File | null) {
    if (!file) return;
    setUploadingField(fieldId);
    setError("");
    try {
      const body = new FormData();
      body.append("field", fieldId);
      body.append("file", file);
      const res = await fetch("/api/admin/businesses/bulk-update/csv", { method: "POST", body });
      const data = (await res.json()) as {
        error?: string;
        results?: BulkResult[];
      };
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setUploadResults((prev) => ({ ...prev, [fieldId]: data.results ?? [] }));
      await load();
    } catch {
      setError("Network error during upload.");
    } finally {
      setUploadingField(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#717171]">Loading verification dashboard…</p>;
  }

  const totalUnverified = fields.reduce((sum, f) => sum + f.unverifiedCount, 0);
  const totalVerified = fields.reduce((sum, f) => sum + f.verifiedCount, 0);

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Active listings</p>
          <p className="mt-1 text-2xl font-bold text-[#111]">{totalBusinesses}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Field verifications done</p>
          <p className="mt-1 text-2xl font-bold text-[#25a244]">{totalVerified}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Still unverified</p>
          <p className="mt-1 text-2xl font-bold text-[#b45309]">{totalUnverified}</p>
        </div>
      </div>

      <p className="text-sm text-[#555]">
        Har field alag verify hoti hai. Batch size daalo (e.g. 10) → copy GBP URLs → scrape → upload CSV.
        Successful upload par field <strong>verified</strong> mark ho jati hai with date. Next batch mein sirf
        unverified listings aayengi.
      </p>

      <div className="space-y-4">
        {fields.map((field) => {
          const batchSize = getBatchSize(field.id);
          const batchCount = Math.min(batchSize, field.unverifiedCount);
          const results = uploadResults[field.id] ?? [];
          const updatedCount = results.filter((r) => r.ok).length;

          return (
            <section
              key={field.id}
              className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#111]">
                    {field.label}
                    <span className="ml-2 rounded-full bg-[#f0fdf4] px-2.5 py-0.5 text-sm font-semibold text-[#25a244]">
                      {field.verifiedCount} verified
                    </span>
                    <span
                      className={`ml-1 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                        field.unverifiedCount > 0
                          ? "bg-[#fffbeb] text-[#b45309]"
                          : "bg-[#f0fdf4] text-[#25a244]"
                      }`}
                    >
                      {field.unverifiedCount} unverified
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-[#717171]">{field.description}</p>
                  {field.pendingDataCount > 0 && (
                    <p className="mt-1 text-xs text-[#b45309]">
                      {field.pendingDataCount} of unverified still need data scraped
                    </p>
                  )}
                </div>
              </div>

              {field.unverifiedCount > 0 && (
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="text-sm">
                    <span className="font-medium text-[#333]">Batch size</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={batchSize}
                      onChange={(e) =>
                        setBatchSizes((prev) => ({
                          ...prev,
                          [field.id]: Math.max(1, Number(e.target.value) || 10),
                        }))
                      }
                      className="ml-2 w-20 rounded border px-2 py-1"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void copyBatch(field)}
                    className="rounded border border-[#1274c0] bg-[#f0f7fd] px-4 py-2 text-sm font-semibold text-[#1274c0] hover:bg-[#e0eef8]"
                  >
                    {copiedField === field.id
                      ? "Copied!"
                      : field.id === "gbp_url"
                        ? `Copy next ${batchCount} id + name`
                        : `Copy next ${batchCount} GBP URL${batchCount === 1 ? "" : "s"}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(field.csvHeader)}
                    className="rounded border border-[#ccc] bg-white px-4 py-2 text-sm font-medium text-[#333] hover:border-[#1274c0]"
                  >
                    Copy CSV header
                  </button>
                </div>
              )}

              <div className="mt-3 rounded border border-[#eee] bg-[#fafafa] px-3 py-2 font-mono text-xs text-[#555]">
                {field.csvHeader}
              </div>

              {field.unverifiedCount > 0 && (
                <>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-[#1274c0] hover:underline">
                      Next {Math.min(batchSize, field.unverifiedCount)} in queue
                    </summary>
                    <ul className="mt-2 max-h-48 overflow-y-auto text-sm text-[#555]">
                      {field.unverifiedBusinesses.slice(0, batchSize).map((b) => (
                        <li key={b.id} className="border-b border-[#eee] py-1.5">
                          <Link
                            href={`/admin/edit/${b.id}`}
                            className="font-medium text-[#1274c0] hover:underline"
                          >
                            {b.name}
                          </Link>
                          <span className="text-[#999]"> · {b.city}, {b.state}</span>
                          {b.hasData ? (
                            <span className="ml-2 text-xs text-[#25a244]">has data</span>
                          ) : (
                            <span className="ml-2 text-xs text-[#b45309]">needs data</span>
                          )}
                          {b.verifiedAt && (
                            <span className="ml-2 text-xs text-[#717171]">
                              verified {formatDate(b.verifiedAt)}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>

                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#eee] pt-4">
                    <label className="block text-sm">
                      <span className="font-medium text-[#333]">Upload verified data CSV</span>
                      <input
                        type="file"
                        accept=".csv,.tsv,.txt"
                        disabled={uploadingField === field.id}
                        onChange={(e) => {
                          const file = e.target.files?.[0] ?? null;
                          void handleUpload(field.id, file);
                          e.target.value = "";
                        }}
                        className="mt-1 block w-full max-w-md text-sm"
                      />
                    </label>
                    {uploadingField === field.id && (
                      <p className="text-sm text-[#717171]">Uploading…</p>
                    )}
                  </div>
                </>
              )}

              {results.length > 0 && (
                <div className="mt-4 rounded border border-[#e8e8e8] bg-[#fafafa] p-3">
                  <p className="text-sm font-semibold text-[#111]">
                    Last upload: {updatedCount} verified, {results.length - updatedCount} failed
                  </p>
                  <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
                    {results.map((r, i) => (
                      <li key={`${r.label}-${i}`} className={r.ok ? "text-[#25a244]" : "text-red-600"}>
                        {r.ok ? "✓" : "✗"} {r.label}
                        {r.businessUrl && (
                          <Link href={r.businessUrl} className="ml-2 text-[#1274c0] hover:underline">
                            View
                          </Link>
                        )}
                        {r.error && <span className="ml-2 text-xs">— {r.error}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
