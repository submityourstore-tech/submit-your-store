/** Core types for the SEO Tools framework. */

export type ToolStatus = "success" | "failed" | "warning" | "pending" | "skipped";

export type ToolErrorCode =
  | "invalid_url"
  | "timeout"
  | "ssl_error"
  | "dns_error"
  | "network_error"
  | "blocked"
  | "redirect_loop"
  | "rate_limited"
  | "checker_not_found"
  | "unknown";

export type ToolScanError = {
  code: ToolErrorCode;
  message: string;
};

export type ToolResultRow = {
  /** Original input URL */
  url: string;
  /** Normalized URL used for checking */
  normalizedUrl: string;
  status: ToolStatus;
  /** Response time in milliseconds */
  responseTimeMs?: number;
  error?: ToolScanError;
  /** Tool-specific result fields */
  [key: string]: unknown;
};

export type ToolColumnDef = {
  key: string;
  label: string;
  /** Default visible */
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  /** Custom cell renderer key — falls back to string value */
  format?: "url" | "status" | "duration" | "bytes" | "text" | "httpStatus" | "yesNo" | "chain";
  /** Column width hint */
  width?: string;
};

export type ToolFaqItem = {
  question: string;
  answer: string;
};

export type SeoToolDefinition = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  keywords: string[];
  /** Columns for the results table */
  columns: ToolColumnDef[];
  /** FAQ for schema markup */
  faqs?: ToolFaqItem[];
  /** Sample URLs for the sample input button */
  sampleUrls?: string[];
  /** Submit button label */
  submitLabel?: string;
  /** Max URLs override (default 500) */
  maxUrls?: number;
  /** Concurrent scan requests (default 5) */
  concurrency?: number;
  /** Custom SEO title override */
  seoTitle?: string;
  /** Custom SEO meta description override */
  seoDescription?: string;
  /** Result display profile for summary cards and filters */
  resultProfile?: "default" | "http-status" | "redirect";
  /** Search box placeholder */
  searchPlaceholder?: string;
  /**
   * Whether a server-side checker implementation exists for this tool.
   * This is the single source of truth for availability, shared by client
   * and server. The server validates it against the registered checkers at
   * load time (see `lib/checkers/load-checkers.ts`).
   */
  available?: boolean;
};

export type ScanProgress = {
  status: "idle" | "running" | "paused" | "cancelled" | "completed";
  total: number;
  processed: number;
  successful: number;
  failed: number;
  warnings: number;
  currentUrl: string | null;
  startedAt: number | null;
  finishedAt: number | null;
  /** Estimated remaining ms based on average per URL */
  estimatedRemainingMs: number | null;
};

export type HttpStatusSummary = {
  total: number;
  successful: number;
  redirects: number;
  clientErrors: number;
  serverErrors: number;
  networkErrors: number;
  averageResponseTimeMs: number;
  fastestUrl: string | null;
  slowestUrl: string | null;
  startedAt: number | null;
  finishedAt: number | null;
  durationMs: number;
};

export type RedirectSummary = {
  total: number;
  noRedirect: number;
  redirected: number;
  permanent301: number;
  temporary: number;
  loops: number;
  broken: number;
  averageRedirectCount: number;
  averageResponseTimeMs: number;
  startedAt: number | null;
  finishedAt: number | null;
  durationMs: number;
};

export type ScanSummary = {
  total: number;
  successful: number;
  failed: number;
  warnings: number;
  averageResponseTimeMs: number;
  startedAt: number | null;
  finishedAt: number | null;
  durationMs: number;
};

export type SortDirection = "asc" | "desc";

export type TableSort = {
  key: string;
  direction: SortDirection;
};

export type ExportFormat = "csv" | "xlsx" | "json";

export type CheckerContext = {
  signal: AbortSignal;
  toolSlug: string;
};

/** Every future tool implements this in a single file. */
export type ToolCheckerFn = (
  url: string,
  ctx: CheckerContext,
) => Promise<Omit<ToolResultRow, "url" | "normalizedUrl" | "status"> & { status?: ToolStatus }>;

export type RegisteredChecker = {
  slug: string;
  check: ToolCheckerFn;
};

export type ScanApiRequest = {
  tool: string;
  url: string;
};

export type ScanApiResponse = {
  result?: ToolResultRow;
  error?: string;
};
