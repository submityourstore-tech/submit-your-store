import type { ToolErrorCode } from "@/types/tools";

/** Maximum URLs per scan */
export const MAX_URLS = 500;

/** Default concurrent requests */
export const DEFAULT_CONCURRENCY = 5;

/** Per-URL timeout in milliseconds */
export const URL_CHECK_TIMEOUT_MS = 30_000;

/** Daily rate limit per tool per IP */
export const TOOL_DAILY_LIMIT = 100;

/** Default page size for results table */
export const DEFAULT_PAGE_SIZE = 25;

export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export const ERROR_MESSAGES: Record<ToolErrorCode, string> = {
  invalid_url: "Invalid URL format",
  timeout: "Request timed out",
  ssl_error: "SSL certificate error",
  dns_error: "DNS lookup failed",
  network_error: "Network connection failed",
  blocked: "Website blocked the request",
  redirect_loop: "Too many redirects",
  rate_limited: "Rate limit exceeded",
  checker_not_found: "Checker not registered for this tool",
  unknown: "An unknown error occurred",
};

export const SAMPLE_URLS = [
  "https://example.com",
  "https://google.com",
  "https://github.com",
  "https://stackoverflow.com",
  "https://wikipedia.org",
];
