"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type PendingBusiness = {
  id: string;
  name: string;
  gbpUrl: string | null;
  city: string;
  state: string;
};

type PendingFieldSummary = {
  id: string;
  label: string;
  description: string;
  csvHeader: string;
  copyHeader: string;
  pendingCount: number;
  pendingBusinesses: PendingBusiness[];
};

type BulkResult = {
  label: string;
  ok: boolean;
  businessUrl?: string;
  error?: string;
};

export function AdminDataPendingClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [fields, setFields] = useState<PendingFieldSummary[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadResults, setUploadResults] = useState<Record<string, BulkResult[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-pending");
      const data = (await res.json()) as {
        error?: string;
        totalBusinesses?: number;
        fields?: PendingFieldSummary[];
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to load pending data.");
        return;
      }
      setTotalBusinesses(data.totalBusinesses ?? 0);
      setFields(data.fields ?? []);
    } catch {
      setError("Network error loading pending data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function copyText(text: string, fieldId: string, kind: "gbp" | "format") {
    try {
      await navigator.clipboard.writeText(text);
      if (kind === "gbp") {
        setCopiedField(fieldId);
        setTimeout(() => setCopiedField(null), 2000);
      } else {
        setCopiedFormat(fieldId);
        setTimeout(() => setCopiedFormat(null), 2000);
      }
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  function buildGbpCopyList(field: PendingFieldSummary): string {
    if (field.id === "gbp_url") {
      return [field.copyHeader, ...field.pendingBusinesses.map((b) => `${b.id}\t${b.name}`)].join(
        "\n",
      );
    }
    const urls = field.pendingBusinesses
      .map((b) => b.gbpUrl?.trim())
      .filter(Boolean) as string[];
    return urls.join("\n");
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
        updated?: number;
        failed?: number;
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
    return <p className="text-sm text-[#717171]">Loading pending data…</p>;
  }

  const totalPending = fields.reduce((sum, f) => sum + f.pendingCount, 0);

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
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Pending gaps</p>
          <p className="mt-1 text-2xl font-bold text-[#b45309]">{totalPending}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Field types</p>
          <p className="mt-1 text-2xl font-bold text-[#111]">{fields.length}</p>
        </div>
      </div>

      <p className="text-sm text-[#555]">
        For each missing field: copy GBP URLs → scrape in Google Sheets → paste data into the CSV
        format → upload here. Updates match by <strong>gbp_url</strong> (or <strong>id</strong> for
        GBP URL missing). Use sidebar <strong>Verify data</strong> and <strong>Data issues</strong> for
        batch verification and problem fixes.
      </p>

      <div className="space-y-4">
        {fields.map((field) => {
          const gbpCopyCount =
            field.id === "gbp_url"
              ? field.pendingCount
              : field.pendingBusinesses.filter((b) => b.gbpUrl?.trim()).length;
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
                    <span
                      className={`ml-2 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
                        field.pendingCount > 0
                          ? "bg-[#fffbeb] text-[#b45309]"
                          : "bg-[#f0fdf4] text-[#25a244]"
                      }`}
                    >
                      {field.pendingCount} pending
                    </span>
                  </h2>
                  <p className="mt-1 text-sm text-[#717171]">{field.description}</p>
                </div>
              </div>

              {field.pendingCount > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void copyText(buildGbpCopyList(field), field.id, "gbp")}
                    className="rounded border border-[#1274c0] bg-[#f0f7fd] px-4 py-2 text-sm font-semibold text-[#1274c0] hover:bg-[#e0eef8]"
                  >
                    {copiedField === field.id
                      ? "Copied!"
                      : field.id === "gbp_url"
                        ? `Copy ${field.pendingCount} id + name`
                        : `Copy ${gbpCopyCount} GBP URL${gbpCopyCount === 1 ? "" : "s"}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyText(field.csvHeader, field.id, "format")}
                    className="rounded border border-[#ccc] bg-white px-4 py-2 text-sm font-medium text-[#333] hover:border-[#1274c0]"
                  >
                    {copiedFormat === field.id ? "Format copied!" : "Copy CSV header"}
                  </button>
                </div>
              )}

              <div className="mt-3 rounded border border-[#eee] bg-[#fafafa] px-3 py-2 font-mono text-xs text-[#555]">
                {field.csvHeader}
              </div>

              {field.pendingCount > 0 && (
                <>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium text-[#1274c0] hover:underline">
                      Show {Math.min(field.pendingCount, 20)} pending businesses
                      {field.pendingCount > 20 ? ` (of ${field.pendingCount})` : ""}
                    </summary>
                    <ul className="mt-2 max-h-48 overflow-y-auto text-sm text-[#555]">
                      {field.pendingBusinesses.slice(0, 20).map((b) => (
                        <li key={b.id} className="border-b border-[#eee] py-1.5">
                          <Link href={`/admin/edit/${b.id}`} className="font-medium text-[#1274c0] hover:underline">
                            {b.name}
                          </Link>
                          <span className="text-[#999]"> · {b.city}, {b.state}</span>
                          {b.gbpUrl && (
                            <span className="mt-0.5 block truncate text-xs text-[#717171]">{b.gbpUrl}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </details>

                  <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-[#eee] pt-4">
                    <label className="block text-sm">
                      <span className="font-medium text-[#333]">Upload CSV for {field.label.toLowerCase()}</span>
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
                    Last upload: {updatedCount} updated, {results.length - updatedCount} failed
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
