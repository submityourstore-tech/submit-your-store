import { getRowValue } from "@/lib/admin-csv-header-mapping";
import { MIN_DESCRIPTION_LENGTH } from "@/lib/admin-pending-fields";
import { isValidGbpUrl, normalizeGbpUrl } from "@/lib/gbp";
import { hasValidPhone } from "@/lib/city-timezone";
import type { Business } from "@/types/business";

export type DataIssueType =
  | "name_gbp_mismatch"
  | "website_404"
  | "website_unreachable"
  | "website_error"
  | "invalid_gbp_url"
  | "missing_gbp_url"
  | "short_description"
  | "invalid_phone"
  | "duplicate_gbp";

export type DataIssueSeverity = "critical" | "warning" | "info";

export type DataIssue = {
  type: DataIssueType;
  severity: DataIssueSeverity;
  label: string;
  detail: string;
};

export type BusinessIssueRow = {
  id: string;
  name: string;
  gbpUrl: string | null;
  website: string | null;
  city: string;
  state: string;
  issues: DataIssue[];
  issueCount: number;
  highestSeverity: DataIssueSeverity;
};

const SEVERITY_RANK: Record<DataIssueSeverity, number> = {
  critical: 3,
  warning: 2,
  info: 1,
};

function maxSeverity(issues: DataIssue[]): DataIssueSeverity {
  let max: DataIssueSeverity = "info";
  for (const issue of issues) {
    if (SEVERITY_RANK[issue.severity] > SEVERITY_RANK[max]) max = issue.severity;
  }
  return max;
}

export function scanBusinessIssues(
  business: Business,
  options?: { gbpKeysSeen?: Map<string, string> },
): DataIssue[] {
  const issues: DataIssue[] = [];

  if (business.nameGbpMismatch) {
    const uploaded = business.csvUploadName ?? business.name;
    const gbpName = business.gbpPlaceName ?? "unknown";
    issues.push({
      type: "name_gbp_mismatch",
      severity: "warning",
      label: "Name ≠ GBP",
      detail: `Uploaded "${uploaded}" but GBP shows "${gbpName}"`,
    });
  }

  const gbp = business.googleMapsUrl?.trim();
  if (!gbp) {
    issues.push({
      type: "missing_gbp_url",
      severity: "critical",
      label: "No GBP URL",
      detail: "Google Business Profile link is missing.",
    });
  } else if (!isValidGbpUrl(gbp)) {
    issues.push({
      type: "invalid_gbp_url",
      severity: "critical",
      label: "Invalid GBP URL",
      detail: "GBP link format looks invalid.",
    });
  } else if (options?.gbpKeysSeen) {
    const key = normalizeGbpUrl(gbp);
    if (key) {
      const otherId = options.gbpKeysSeen.get(key);
      if (otherId && otherId !== business.id) {
        issues.push({
          type: "duplicate_gbp",
          severity: "critical",
          label: "Duplicate GBP",
          detail: `Same GBP as listing ${otherId}.`,
        });
      } else {
        options.gbpKeysSeen.set(key, business.id);
      }
    }
  }

  const desc = business.description?.trim() ?? "";
  if (!desc || desc.length < MIN_DESCRIPTION_LENGTH) {
    issues.push({
      type: "short_description",
      severity: "warning",
      label: "Short description",
      detail: `Description has ${desc.length} chars (need ${MIN_DESCRIPTION_LENGTH}+).`,
    });
  }

  if (business.phone && !hasValidPhone(business.phone) && business.phone !== "(000) 000-0000") {
    issues.push({
      type: "invalid_phone",
      severity: "info",
      label: "Invalid phone",
      detail: `Phone "${business.phone}" may be incorrect.`,
    });
  }

  const websiteCheck = business.websiteCheck;

  if (websiteCheck?.status === 404) {
    issues.push({
      type: "website_404",
      severity: "critical",
      label: "Website 404",
      detail: `Website returned HTTP 404.`,
    });
  } else if (websiteCheck?.error) {
    issues.push({
      type: "website_unreachable",
      severity: "warning",
      label: "Website unreachable",
      detail: websiteCheck.error,
    });
  } else if (
    websiteCheck?.status != null &&
    websiteCheck.status >= 400 &&
    websiteCheck.status !== 404
  ) {
    issues.push({
      type: "website_error",
      severity: "warning",
      label: `Website HTTP ${websiteCheck.status}`,
      detail: "Website returned an error status code.",
    });
  }

  return issues;
}

export function scanAllBusinessIssues(
  businesses: Business[],
): BusinessIssueRow[] {
  const gbpKeysSeen = new Map<string, string>();
  const rows: BusinessIssueRow[] = [];

  for (const business of businesses) {
    if (business.status === "hidden") continue;
    const issues = scanBusinessIssues(business, { gbpKeysSeen });
    if (!issues.length) continue;

    rows.push({
      id: business.id,
      name: business.name,
      gbpUrl: business.googleMapsUrl,
      website: business.website,
      city: business.city,
      state: business.state,
      issues,
      issueCount: issues.length,
      highestSeverity: maxSeverity(issues),
    });
  }

  rows.sort((a, b) => {
    const sev = SEVERITY_RANK[b.highestSeverity] - SEVERITY_RANK[a.highestSeverity];
    if (sev !== 0) return sev;
    return b.issueCount - a.issueCount;
  });

  return rows;
}

export async function checkWebsiteHttpStatus(
  rawUrl: string,
): Promise<{ status: number | null; error?: string }> {
  let url = rawUrl.trim();
  if (!url.startsWith("http")) url = `https://${url}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "User-Agent": "SubmitYourStore-HealthCheck/1.0" },
    });

    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "SubmitYourStore-HealthCheck/1.0" },
      });
    }

    return { status: res.status };
  } catch (err) {
    return {
      status: null,
      error: err instanceof Error ? err.message : "Request failed",
    };
  } finally {
    clearTimeout(timeout);
  }
}

export type WebsiteScanResult = {
  businessId: string;
  name: string;
  website: string;
  status: number | null;
  error?: string;
};

export async function scanWebsitesForBusinesses(
  businesses: Business[],
  limit = 30,
): Promise<WebsiteScanResult[]> {
  const targets = businesses
    .filter((b) => b.status !== "hidden" && b.website?.trim())
    .slice(0, limit);

  const results: WebsiteScanResult[] = [];

  for (const business of targets) {
    const website = business.website!.trim();
    const check = await checkWebsiteHttpStatus(website);
    results.push({
      businessId: business.id,
      name: business.name,
      website,
      status: check.status,
      error: check.error,
    });
  }

  return results;
}
