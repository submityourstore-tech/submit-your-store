"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type DataIssue = {
  type: string;
  severity: "critical" | "warning" | "info";
  label: string;
  detail: string;
};

type IssueRow = {
  id: string;
  name: string;
  gbpUrl: string | null;
  website: string | null;
  city: string;
  state: string;
  issues: DataIssue[];
  issueCount: number;
  highestSeverity: string;
};

type ScanResult = {
  businessId: string;
  name: string;
  website: string;
  status: number | null;
  error?: string;
};

const SEVERITY_STYLES = {
  critical: "bg-red-100 text-red-800",
  warning: "bg-[#fffbeb] text-[#b45309]",
  info: "bg-[#f0f7fd] text-[#1274c0]",
};

export function AdminDataIssuesClient() {
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [totalBusinesses, setTotalBusinesses] = useState(0);
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [byType, setByType] = useState<Record<string, number>>({});
  const [scanResults, setScanResults] = useState<ScanResult[] | null>(null);
  const [filter, setFilter] = useState<string>("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-issues");
      const data = (await res.json()) as {
        error?: string;
        totalBusinesses?: number;
        rows?: IssueRow[];
        byType?: Record<string, number>;
      };
      if (!res.ok) {
        setError(data.error ?? "Failed to load issues.");
        return;
      }
      setTotalBusinesses(data.totalBusinesses ?? 0);
      setRows(data.rows ?? []);
      setByType(data.byType ?? {});
    } catch {
      setError("Network error loading issues.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function runWebsiteScan() {
    setScanning(true);
    setError("");
    try {
      const res = await fetch("/api/admin/data-issues/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 30 }),
      });
      const data = (await res.json()) as {
        error?: string;
        results?: ScanResult[];
        scanned?: number;
        problemCount?: number;
      };
      if (!res.ok) {
        setError(data.error ?? "Website scan failed.");
        return;
      }
      setScanResults(data.results ?? []);
      await load();
    } catch {
      setError("Network error during website scan.");
    } finally {
      setScanning(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#717171]">Loading data issues…</p>;
  }

  const filteredRows =
    filter === "all" ? rows : rows.filter((r) => r.issues.some((i) => i.type === filter));

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
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Listings with issues</p>
          <p className="mt-1 text-2xl font-bold text-[#b45309]">{rows.length}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Total issues</p>
          <p className="mt-1 text-2xl font-bold text-red-600">
            {rows.reduce((sum, r) => sum + r.issueCount, 0)}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded border bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-[#333]">Auto-detect website problems (404, unreachable):</p>
        <button
          type="button"
          onClick={() => void runWebsiteScan()}
          disabled={scanning}
          className="rounded bg-[#1274c0] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0d5a94] disabled:opacity-60"
        >
          {scanning ? "Scanning…" : "Scan 30 websites"}
        </button>
        {scanResults && (
          <p className="text-sm text-[#555]">
            Last scan: {scanResults.length} checked,{" "}
            {scanResults.filter((r) => r.status === 404 || r.status == null || (r.status ?? 0) >= 400).length}{" "}
            problems
          </p>
        )}
      </div>

      {Object.keys(byType).length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === "all" ? "bg-[#1274c0] text-white" : "bg-[#eee] text-[#555]"
            }`}
          >
            All ({rows.length})
          </button>
          {Object.entries(byType).map(([type, count]) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                filter === type ? "bg-[#1274c0] text-white" : "bg-[#eee] text-[#555]"
              }`}
            >
              {type.replace(/_/g, " ")} ({count})
            </button>
          ))}
        </div>
      )}

      <p className="text-sm text-[#555]">
        Yahan woh problems dikhti hain jo sabse pehle fix karni chahiye — naam GBP se alag, website 404,
        invalid GBP, duplicate links, short description, etc.
      </p>

      {filteredRows.length === 0 ? (
        <p className="rounded border bg-[#f0fdf4] px-4 py-6 text-center text-sm text-[#25a244]">
          No issues found — sab clean hai!
        </p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b bg-[#fafafa] text-xs uppercase tracking-wide text-[#717171]">
              <tr>
                <th className="px-4 py-3">Business</th>
                <th className="px-4 py-3">Issues</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-b border-[#eee] hover:bg-[#fafafa]">
                  <td className="px-4 py-3">
                    <p className="font-medium text-[#111]">{row.name}</p>
                    <p className="text-xs text-[#999]">
                      {row.city}, {row.state}
                    </p>
                    {row.gbpUrl && (
                      <p className="mt-0.5 max-w-xs truncate text-xs text-[#717171]">{row.gbpUrl}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <ul className="space-y-1">
                      {row.issues.map((issue, i) => (
                        <li key={`${issue.type}-${i}`} className="text-xs text-[#555]">
                          <span className="font-semibold text-[#333]">{issue.label}:</span> {issue.detail}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        SEVERITY_STYLES[row.highestSeverity as keyof typeof SEVERITY_STYLES] ??
                        SEVERITY_STYLES.info
                      }`}
                    >
                      {row.highestSeverity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/edit/${row.id}`}
                      className="text-[#1274c0] hover:underline"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
