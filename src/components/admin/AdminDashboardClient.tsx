"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type BusinessRow = {
  id: string;
  name: string;
  city: string;
  state: string;
  category: string;
  status: string;
  phone: string;
  email: string | null;
};

type OverviewStats = {
  totalListings: number;
  pendingGaps: number;
  outreachReady: number;
  issueCount: number;
};

const QUICK_LINKS = [
  { href: "/admin/data-pending", label: "Data pending", desc: "Copy GBP URLs & upload field CSVs", icon: "📊" },
  { href: "/admin/data-verify", label: "Verify data", desc: "Batch verify scraped fields", icon: "✅" },
  { href: "/admin/data-issues", label: "Data issues", desc: "404 sites, name mismatches", icon: "⚠️" },
  { href: "/admin/outreach", label: "Outreach", desc: "Email unclaimed businesses", icon: "📧" },
  { href: "/admin/listings", label: "Publish new", desc: "Single or CSV bulk upload", icon: "➕" },
] as const;

export function AdminDashboardClient() {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [rows, setRows] = useState<BusinessRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewStats | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const loadOverview = useCallback(async () => {
    try {
      const [bizRes, pendingRes, outreachRes, issuesRes] = await Promise.all([
        fetch("/api/admin/businesses"),
        fetch("/api/admin/data-pending"),
        fetch("/api/admin/outreach/stats"),
        fetch("/api/admin/data-issues"),
      ]);

      const biz = (await bizRes.json()) as { total?: number };
      const pending = (await pendingRes.json()) as {
        fields?: { pendingCount: number }[];
      };
      const outreach = outreachRes.ok
        ? ((await outreachRes.json()) as { stats?: { readyToSend?: number } })
        : { stats: { readyToSend: 0 } };
      const issues = issuesRes.ok
        ? ((await issuesRes.json()) as { businessesWithIssues?: number })
        : { businessesWithIssues: 0 };

      const pendingGaps = (pending.fields ?? []).reduce((sum, f) => sum + f.pendingCount, 0);

      setOverview({
        totalListings: biz.total ?? 0,
        pendingGaps,
        outreachReady: outreach.stats?.readyToSend ?? 0,
        issueCount: issues.businessesWithIssues ?? 0,
      });
    } catch {
      setOverview(null);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const qs = debounced ? `?q=${encodeURIComponent(debounced)}` : "";
      const res = await fetch(`/api/admin/businesses${qs}`);
      const data = (await res.json()) as { businesses?: BusinessRow[]; total?: number };
      setRows(data.businesses ?? []);
      setTotal(data.total ?? 0);
    } finally {
      setLoading(false);
    }
  }, [debounced]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      {overview && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded border border-[#c3c4c7] bg-[#f6f7f7] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#646970]">Listings</p>
            <p className="mt-1 text-2xl font-bold text-[#1d2327]">{overview.totalListings}</p>
          </div>
          <div className="rounded border border-[#c3c4c7] bg-[#fffbeb] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#646970]">Pending gaps</p>
            <p className="mt-1 text-2xl font-bold text-[#b45309]">{overview.pendingGaps}</p>
          </div>
          <div className="rounded border border-[#c3c4c7] bg-[#f0f7fd] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#646970]">Outreach ready</p>
            <p className="mt-1 text-2xl font-bold text-[#1274c0]">{overview.outreachReady}</p>
          </div>
          <div className="rounded border border-[#c3c4c7] bg-[#fef2f2] p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#646970]">Data issues</p>
            <p className="mt-1 text-2xl font-bold text-red-600">{overview.issueCount}</p>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-sm font-semibold text-[#1d2327]">Quick links</h2>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-start gap-3 rounded border border-[#c3c4c7] bg-white p-3 hover:border-[#1274c0] hover:bg-[#f0f7fd]"
            >
              <span className="text-lg" aria-hidden>
                {link.icon}
              </span>
              <span>
                <span className="block text-sm font-semibold text-[#1274c0]">{link.label}</span>
                <span className="block text-xs text-[#646970]">{link.desc}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-[#1d2327]">All listings</h2>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, city, email, ID…"
            className="min-w-[220px] flex-1 rounded border border-[#8c8f94] px-3 py-2 text-sm"
          />
          <span className="text-sm text-[#646970]">
            {loading ? "Loading…" : `${total} listing${total === 1 ? "" : "s"}`}
          </span>
        </div>

        <div className="mt-3 overflow-x-auto rounded border border-[#c3c4c7]">
          <table className="min-w-full text-sm">
            <thead className="bg-[#f6f7f7] text-left text-xs uppercase tracking-wide text-[#646970]">
              <tr>
                <th className="px-3 py-2.5">Business</th>
                <th className="px-3 py-2.5">Location</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-[#dcdcde] hover:bg-[#f6f7f7]">
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-[#1d2327]">{row.name}</p>
                    <p className="text-xs text-[#646970]">{row.id}</p>
                  </td>
                  <td className="px-3 py-2.5 text-[#50575e]">
                    {row.city}, {row.state}
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-2.5 text-[#50575e]" title={row.category}>
                    {row.category}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${
                        row.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/edit/${row.id}`}
                        className="rounded bg-[#1274c0] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0d5a96]"
                      >
                        Edit
                      </Link>
                      <a
                        href={`/business/${row.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded border border-[#c3c4c7] px-2.5 py-1 text-xs font-semibold text-[#1274c0] hover:bg-[#eef4fb]"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-[#646970]">
                    No listings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
