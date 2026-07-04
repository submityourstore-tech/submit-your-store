import type { HttpStatusSummary, RedirectSummary, ScanProgress, ScanSummary, ToolResultRow } from "@/types/tools";

export function computeSummary(
  results: ToolResultRow[],
  startedAt: number | null,
  finishedAt: number | null,
): ScanSummary {
  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const warnings = results.filter((r) => r.status === "warning").length;
  const times = results.map((r) => r.responseTimeMs ?? 0).filter((t) => t > 0);
  const averageResponseTimeMs =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return {
    total: results.length,
    successful,
    failed,
    warnings,
    averageResponseTimeMs,
    startedAt,
    finishedAt,
    durationMs: startedAt && finishedAt ? finishedAt - startedAt : 0,
  };
}

export function computeProgress(
  results: ToolResultRow[],
  total: number,
  currentUrl: string | null,
  status: ScanProgress["status"],
  startedAt: number | null,
  finishedAt: number | null,
): ScanProgress {
  const processed = results.length;
  const successful = results.filter((r) => r.status === "success").length;
  const failed = results.filter((r) => r.status === "failed").length;
  const warnings = results.filter((r) => r.status === "warning").length;

  let estimatedRemainingMs: number | null = null;
  if (startedAt && processed > 0 && status === "running") {
    const elapsed = Date.now() - startedAt;
    const avgPerUrl = elapsed / processed;
    const remaining = total - processed;
    estimatedRemainingMs = Math.round(avgPerUrl * remaining);
  }

  return {
    status,
    total,
    processed,
    successful,
    failed,
    warnings,
    currentUrl,
    startedAt,
    finishedAt,
    estimatedRemainingMs,
  };
}

export function computeHttpStatusSummary(
  results: ToolResultRow[],
  startedAt: number | null,
  finishedAt: number | null,
): HttpStatusSummary {
  const withCode = results.filter((r) => typeof r.httpStatus === "number");
  const networkErrors = results.filter((r) => r.status === "failed" && r.error).length;

  const successful = withCode.filter((r) => (r.httpStatus as number) >= 200 && (r.httpStatus as number) < 300).length;
  const redirects = withCode.filter(
    (r) =>
      ((r.httpStatus as number) >= 300 && (r.httpStatus as number) < 400) ||
      ((r.redirectCount as number) ?? 0) > 0,
  ).length;
  const clientErrors = withCode.filter(
    (r) => (r.httpStatus as number) >= 400 && (r.httpStatus as number) < 500,
  ).length;
  const serverErrors = withCode.filter((r) => (r.httpStatus as number) >= 500).length;

  const timed = results.filter((r) => (r.responseTimeMs ?? 0) > 0);
  const times = timed.map((r) => r.responseTimeMs ?? 0);
  const averageResponseTimeMs =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  const sorted = [...timed].sort((a, b) => (a.responseTimeMs ?? 0) - (b.responseTimeMs ?? 0));

  return {
    total: results.length,
    successful,
    redirects,
    clientErrors,
    serverErrors,
    networkErrors,
    averageResponseTimeMs,
    fastestUrl: sorted[0]?.url ?? null,
    slowestUrl: sorted[sorted.length - 1]?.url ?? null,
    startedAt,
    finishedAt,
    durationMs: startedAt && finishedAt ? finishedAt - startedAt : 0,
  };
}

function matchesHttpStatusFilter(row: ToolResultRow, filter: string): boolean {
  const code = row.httpStatus as number | undefined;
  const redirectCount = (row.redirectCount as number) ?? 0;

  switch (filter) {
    case "2xx":
      return code != null && code >= 200 && code < 300;
    case "3xx":
      return code != null && code >= 300 && code < 400;
    case "4xx":
      return code != null && code >= 400 && code < 500;
    case "5xx":
      return code != null && code >= 500;
    case "errors":
      return row.status === "failed" || (code != null && code >= 400);
    case "redirects":
      return redirectCount > 0 || (code != null && code >= 300 && code < 400);
    default:
      return true;
  }
}

function parseRedirectTypes(row: ToolResultRow): number[] {
  const raw = row.redirectTypes;
  if (typeof raw !== "string" || raw === "—") return [];
  return raw
    .split(",")
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !Number.isNaN(n));
}

function isBrokenRedirect(row: ToolResultRow): boolean {
  if (row.status === "failed") return true;
  if (row.broken === true) return true;
  if (row.loopDetected === "Yes") return true;
  const code = row.finalStatusCode as number | undefined;
  return code != null && code >= 400;
}

function matchesRedirectFilter(row: ToolResultRow, filter: string): boolean {
  const types = parseRedirectTypes(row);
  const redirectCount = (row.redirectCount as number) ?? 0;
  const loop = row.loopDetected === "Yes";
  const broken = isBrokenRedirect(row);

  switch (filter) {
    case "none":
      return redirectCount === 0 && !loop && !broken;
    case "301":
      return types.includes(301);
    case "302":
      return types.includes(302);
    case "307":
      return types.includes(307);
    case "308":
      return types.includes(308);
    case "loops":
      return loop;
    case "broken":
      return broken;
    default:
      return true;
  }
}

export function computeRedirectSummary(
  results: ToolResultRow[],
  startedAt: number | null,
  finishedAt: number | null,
): RedirectSummary {
  const ok = results.filter((r) => r.status !== "failed" || r.redirectCount != null);
  const noRedirect = ok.filter((r) => ((r.redirectCount as number) ?? 0) === 0 && r.loopDetected !== "Yes").length;
  const redirected = ok.filter((r) => ((r.redirectCount as number) ?? 0) > 0).length;
  const permanent301 = ok.filter((r) => parseRedirectTypes(r).includes(301)).length;
  const temporary = ok.filter((r) => {
    const types = parseRedirectTypes(r);
    return types.some((t) => t === 302 || t === 307 || t === 308);
  }).length;
  const loops = ok.filter((r) => r.loopDetected === "Yes").length;
  const broken = ok.filter((r) => isBrokenRedirect(r)).length;

  const counts = ok.map((r) => (r.redirectCount as number) ?? 0);
  const averageRedirectCount =
    counts.length > 0 ? Math.round((counts.reduce((a, b) => a + b, 0) / counts.length) * 10) / 10 : 0;

  const times = ok.map((r) => r.responseTimeMs ?? 0).filter((t) => t > 0);
  const averageResponseTimeMs =
    times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;

  return {
    total: results.length,
    noRedirect,
    redirected,
    permanent301,
    temporary,
    loops,
    broken,
    averageRedirectCount,
    averageResponseTimeMs,
    startedAt,
    finishedAt,
    durationMs: startedAt && finishedAt ? finishedAt - startedAt : 0,
  };
}

export function filterResults(
  results: ToolResultRow[],
  search: string,
  statusFilter: string | null,
  resultProfile: "default" | "http-status" | "redirect" = "default",
): ToolResultRow[] {
  let filtered = results;

  if (statusFilter && statusFilter !== "all") {
    if (resultProfile === "http-status") {
      filtered = filtered.filter((r) => matchesHttpStatusFilter(r, statusFilter));
    } else if (resultProfile === "redirect") {
      filtered = filtered.filter((r) => matchesRedirectFilter(r, statusFilter));
    } else {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    if (resultProfile === "redirect") {
      filtered = filtered.filter((row) => {
        const url = String(row.url ?? "").toLowerCase();
        const finalUrl = String(row.finalUrl ?? "").toLowerCase();
        return url.includes(q) || finalUrl.includes(q);
      });
    } else {
      filtered = filtered.filter((row) =>
        Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(q)),
      );
    }
  }

  return filtered;
}

export function sortResults(
  results: ToolResultRow[],
  sortKey: string | null,
  direction: "asc" | "desc",
): ToolResultRow[] {
  if (!sortKey) return results;

  return [...results].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    let cmp = 0;
    if (typeof aVal === "number" && typeof bVal === "number") {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal).localeCompare(String(bVal));
    }

    return direction === "asc" ? cmp : -cmp;
  });
}

export function paginateResults<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export function getVisibleColumns<T extends { key: string; visible?: boolean }>(
  columns: T[],
  visibility: Record<string, boolean>,
): T[] {
  return columns.filter((col) => visibility[col.key] ?? col.visible !== false);
}
