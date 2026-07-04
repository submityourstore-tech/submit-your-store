import type { ToolColumnDef, SeoToolDefinition } from "@/types/tools";

/** Default columns every tool result row includes */
export const BASE_COLUMNS: ToolColumnDef[] = [
  { key: "url", label: "URL", format: "url", sortable: true, filterable: true },
  { key: "status", label: "Status", format: "status", sortable: true, filterable: true },
  { key: "responseTimeMs", label: "Response Time", format: "duration", sortable: true },
];

export const DEFAULT_FAQS = [
  {
    question: "How many URLs can I check at once?",
    answer: "You can scan up to 500 URLs per session. Paste URLs, upload a CSV or TXT file, or drag and drop.",
  },
  {
    question: "Can I export my results?",
    answer: "Yes. Export results as CSV, Excel (.xlsx), or JSON. You can also copy the table to paste into Excel or Google Sheets.",
  },
  {
    question: "Is this tool free?",
    answer: "Yes. Submit Your Store SEO tools are free to use with reasonable daily limits.",
  },
];

/**
 * Shared tool registry — metadata only, safe to import from both client and
 * server. Each tool's checking logic lives in `lib/checkers/checkers/{slug}.ts`
 * and is wired up server-side in `lib/checkers/load-checkers.ts`.
 *
 * The `available` flag is the single source of truth for whether a tool can be
 * scanned. The server validates that every `available` tool has a registered
 * checker (and vice versa) at load time, so the client can rely on this flag
 * without importing any server-only module.
 */
export const SEO_TOOLS: SeoToolDefinition[] = [
  {
    slug: "status-code-checker",
    name: "Bulk HTTP Status Code Checker",
    available: true,
    description:
      "Check HTTP status codes for up to 500 URLs at once. View redirects, response times, and server headers instantly.",
    icon: "🌐",
    keywords: [
      "http status checker",
      "bulk status code",
      "status code checker",
      "url status checker",
      "redirect checker",
    ],
    seoTitle: "Bulk HTTP Status Code Checker – Free Online Tool | SubmitYourStore",
    seoDescription:
      "Check up to 500 URLs at once and instantly view HTTP status codes, redirects, response times and server headers using SubmitYourStore's free Bulk HTTP Status Code Checker.",
    resultProfile: "http-status",
    concurrency: 10,
    submitLabel: "Check Status Codes",
    searchPlaceholder: "Search any URL…",
    columns: [
      { key: "url", label: "Original URL", format: "url", sortable: true, filterable: true },
      { key: "finalUrl", label: "Final URL", format: "url", sortable: true },
      { key: "httpStatus", label: "HTTP Status", format: "httpStatus", sortable: true },
      { key: "statusMessage", label: "Status Message", sortable: true },
      { key: "redirectCount", label: "Redirects", sortable: true },
      { key: "responseTimeMs", label: "Response Time", format: "duration", sortable: true },
      { key: "contentType", label: "Content Type" },
      { key: "server", label: "Server" },
      { key: "contentLength", label: "Content Length" },
      { key: "lastModified", label: "Last Modified" },
      { key: "status", label: "Scan Status", format: "status", visible: false },
    ],
    sampleUrls: [
      "https://example.com",
      "https://httpstat.us/200",
      "https://httpstat.us/301",
      "https://httpstat.us/404",
      "https://httpstat.us/500",
    ],
    faqs: [
      ...DEFAULT_FAQS,
      {
        question: "What HTTP status codes does this tool detect?",
        answer:
          "The checker detects all standard HTTP status codes including 2xx success, 3xx redirects, 4xx client errors, and 5xx server errors. It follows redirect chains and reports the final URL.",
      },
      {
        question: "Does it follow redirects?",
        answer:
          "Yes. The tool follows up to 10 redirects per URL and reports the redirect count and final destination URL.",
      },
    ],
  },
  {
    slug: "redirect-checker",
    name: "Bulk Redirect Checker",
    available: true,
    description:
      "Trace redirect chains for up to 500 URLs. Detect 301, 302, 307, 308 redirects, loops, and final destinations.",
    icon: "↪️",
    keywords: ["redirect checker", "301 redirect", "redirect chain", "bulk redirect", "307 redirect"],
    seoTitle: "Bulk Redirect Checker – Free Online Tool | SubmitYourStore",
    seoDescription:
      "Check up to 500 URLs at once and instantly detect 301, 302, 307 and 308 redirects, redirect chains, loops and final destination URLs.",
    resultProfile: "redirect",
    concurrency: 10,
    submitLabel: "Check Redirects",
    searchPlaceholder: "Search by URL or final URL…",
    columns: [
      { key: "url", label: "Original URL", format: "url", sortable: true, filterable: true },
      { key: "redirected", label: "Redirected", format: "yesNo", sortable: true },
      { key: "redirectChain", label: "Redirect Chain", format: "chain" },
      { key: "redirectCount", label: "Redirect Count", sortable: true },
      { key: "finalUrl", label: "Final URL", format: "url", sortable: true },
      { key: "finalStatusCode", label: "Final Status Code", format: "httpStatus", sortable: true },
      { key: "responseTimeMs", label: "Total Response Time", format: "duration", sortable: true },
      { key: "loopDetected", label: "Loop Detected", format: "yesNo", sortable: true },
      { key: "warnings", label: "Warnings" },
      { key: "redirectTypes", label: "Redirect Types", visible: false },
      { key: "status", label: "Scan Status", format: "status", visible: false },
    ],
    sampleUrls: [
      "https://example.com",
      "https://google.com",
      "https://github.com",
      "https://bit.ly",
    ],
    faqs: [
      ...DEFAULT_FAQS,
      {
        question: "What redirect types does this tool detect?",
        answer:
          "The checker identifies 301 (permanent), 302 (found), 307 (temporary redirect), and 308 (permanent redirect) responses, and follows each hop to the final destination.",
      },
      {
        question: "Can it detect redirect loops?",
        answer:
          "Yes. If a URL redirects back to a previously visited URL in the chain, the tool flags it as a redirect loop.",
      },
    ],
  },
  {
    slug: "ssl-checker",
    name: "SSL Certificate Checker",
    description: "Verify SSL/TLS certificates for bulk domains. Check expiry, issuer, and certificate validity.",
    icon: "🔒",
    keywords: ["ssl checker", "certificate checker", "tls", "https checker"],
    columns: [
      ...BASE_COLUMNS,
      { key: "valid", label: "Valid" },
      { key: "issuer", label: "Issuer" },
      { key: "expiresAt", label: "Expires" },
      { key: "daysRemaining", label: "Days Left", sortable: true },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "whois-checker",
    name: "WHOIS Lookup",
    description: "Bulk WHOIS lookup for domain registration date, registrar, and expiration.",
    icon: "📋",
    keywords: ["whois checker", "domain whois", "bulk whois", "domain registration"],
    columns: [
      ...BASE_COLUMNS,
      { key: "registrar", label: "Registrar" },
      { key: "createdDate", label: "Created" },
      { key: "expiresDate", label: "Expires" },
      { key: "nameServers", label: "Name Servers" },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "meta-tags-checker",
    name: "Meta Tags Analyzer",
    description: "Extract and analyze title, description, Open Graph, and Twitter Card meta tags from URLs.",
    icon: "🏷️",
    keywords: ["meta tags", "title tag", "meta description", "og tags"],
    columns: [
      ...BASE_COLUMNS,
      { key: "title", label: "Title" },
      { key: "description", label: "Description" },
      { key: "ogTitle", label: "OG Title" },
      { key: "ogImage", label: "OG Image", format: "url" },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "robots-txt-checker",
    name: "Robots.txt Checker",
    description: "Fetch and validate robots.txt files. Check allow/disallow rules and sitemap declarations.",
    icon: "🤖",
    keywords: ["robots txt", "robots checker", "crawl rules"],
    columns: [
      ...BASE_COLUMNS,
      { key: "found", label: "Found" },
      { key: "statusCode", label: "Status Code", sortable: true },
      { key: "sitemapUrls", label: "Sitemaps" },
      { key: "userAgents", label: "User Agents" },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "sitemap-checker",
    name: "Sitemap Checker",
    description: "Discover and validate XML sitemaps. Count URLs and check accessibility.",
    icon: "🗺️",
    keywords: ["sitemap checker", "xml sitemap", "sitemap validator"],
    columns: [
      ...BASE_COLUMNS,
      { key: "sitemapUrl", label: "Sitemap URL", format: "url" },
      { key: "urlCount", label: "URL Count", sortable: true },
      { key: "lastModified", label: "Last Modified" },
    ],
    faqs: DEFAULT_FAQS,
  },
  {
    slug: "page-speed-checker",
    name: "Page Speed Checker",
    description: "Measure page load time and response headers for bulk URLs.",
    icon: "⚡",
    keywords: ["page speed", "load time", "performance checker"],
    columns: [
      ...BASE_COLUMNS,
      { key: "loadTimeMs", label: "Load Time", format: "duration", sortable: true },
      { key: "contentLength", label: "Size", format: "bytes", sortable: true },
      { key: "contentType", label: "Content Type" },
    ],
    faqs: DEFAULT_FAQS,
  },
];

export function getTool(slug: string): SeoToolDefinition | undefined {
  return SEO_TOOLS.find((t) => t.slug === slug);
}

export function getAllToolSlugs(): string[] {
  return SEO_TOOLS.map((t) => t.slug);
}

/**
 * Whether a tool is available for scanning. Reads the shared metadata registry,
 * so it works identically on the client and the server without touching any
 * server-only checker module.
 */
export function isToolAvailable(slug: string): boolean {
  return getTool(slug)?.available === true;
}

/** Slugs of tools that declare a server-side checker implementation. */
export function getAvailableToolSlugs(): string[] {
  return SEO_TOOLS.filter((t) => t.available === true).map((t) => t.slug);
}

/** @deprecated Use SeoToolDefinition */
export type SeoTool = SeoToolDefinition;
