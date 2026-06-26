"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type ExportRow = Record<string, string>;

type ExportResponse = {
  total: number;
  grandTotal: number;
  columns: string[];
  previewColumns: string[];
  rows: ExportRow[];
  lastUpdated: string | null;
  downloadUrl: string;
  error?: string;
};

export function AdminDataExportClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [data, setData] = useState<ExportResponse | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (debounced) params.set("q", debounced);
      const res = await fetch(`/api/admin/data-export?${params.toString()}`, { cache: "no-store" });
      const json = (await res.json()) as ExportResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? "Failed to load export data.");
        return;
      }
      setData(json);
    } catch {
      setError("Network error loading data.");
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void load();
  }, [load]);

  const previewCols = data?.previewColumns ?? [];
  const rows = data?.rows ?? [];

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Total listings</p>
          <p className="mt-1 text-2xl font-bold text-[#111]">{data?.grandTotal ?? "—"}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Showing</p>
          <p className="mt-1 text-2xl font-bold text-[#1274c0]">{data?.total ?? "—"}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Last updated</p>
          <p className="mt-1 text-sm font-semibold text-[#111]">
            {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "—"}
          </p>
        </div>
      </div>

      <div className="rounded border border-[#1274c0]/30 bg-[#f0f7fd] p-4 text-sm text-[#333]">
        <strong>Live export</strong> — yeh table Supabase se direct aati hai. Naya CSV upload, single listing,
        ya field update — sab automatically yahan dikhega. Download button se poori file (.tsv) mil jayegi,
        same format jisme aap upload karte ho.
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, city, email, GBP…"
          className="min-w-[200px] flex-1 rounded border px-3 py-2 text-sm"
        />
        <a
          href="/api/admin/data-export?format=csv"
          className="jd-btn-primary rounded px-5 py-2.5 text-sm font-semibold"
        >
          Download full CSV / TSV
        </a>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded border border-[#ccc] bg-white px-4 py-2 text-sm font-medium hover:border-[#1274c0]"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-[#717171]">Loading all uploaded data…</p>
      ) : (
        <div className="overflow-hidden rounded border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="bg-[#fafafa] text-xs uppercase text-[#717171]">
                <tr>
                  {previewCols.map((col) => (
                    <th key={col} className="px-3 py-2 font-semibold">
                      {col}
                    </th>
                  ))}
                  <th className="px-3 py-2 font-semibold">Edit</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={previewCols.length + 1} className="px-3 py-8 text-center text-[#717171]">
                      No listings match your search.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id} className="border-t border-[#eee] align-top">
                      {previewCols.map((col) => (
                        <td key={col} className="max-w-[220px] truncate px-3 py-2 text-[#333]" title={row[col]}>
                          {row[col] || "—"}
                        </td>
                      ))}
                      <td className="px-3 py-2">
                        <Link
                          href={`/admin/edit/${row.id}`}
                          className="text-[#1274c0] hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {rows.length > 0 && (
            <p className="border-t border-[#eee] px-3 py-2 text-xs text-[#717171]">
              Table preview shows key columns. Download includes all {data?.columns.length ?? 0} fields (
              {data?.columns.slice(0, 6).join(", ")}…).
            </p>
          )}
        </div>
      )}
    </div>
  );
}
