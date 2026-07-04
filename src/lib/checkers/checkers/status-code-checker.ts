import type { CheckerContext } from "@/types/tools";
import { ToolCheckError } from "@/lib/checkers/errors";
import {
  fetchWithHeadFallback,
  isRedirectStatus,
  MAX_REDIRECT_HOPS,
} from "@/lib/fetch/http-request";

function httpStatusLabel(code: number): string {
  const labels: Record<number, string> = {
    200: "OK",
    301: "Moved Permanently",
    302: "Found",
    304: "Not Modified",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };
  return labels[code] ?? "Unknown";
}

type HttpCheckResult = {
  statusCode: number;
  statusMessage: string;
  finalUrl: string;
  redirectCount: number;
  contentType: string;
  server: string;
  contentLength: string;
  lastModified: string;
  responseTimeMs: number;
};

async function checkHttpStatus(url: string, signal: AbortSignal): Promise<HttpCheckResult> {
  const startTime = Date.now();
  let currentUrl = url;
  let redirectCount = 0;

  for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
    const response = await fetchWithHeadFallback(currentUrl, signal);

    if (isRedirectStatus(response.status)) {
      const location = response.headers.get("location");
      if (!location) {
        return buildResult(response, currentUrl, redirectCount, Date.now() - startTime);
      }
      currentUrl = new URL(location, currentUrl).href;
      redirectCount++;
      continue;
    }

    return buildResult(response, currentUrl, redirectCount, Date.now() - startTime);
  }

  throw new ToolCheckError("redirect_loop", "Too many redirects");
}

function buildResult(
  response: Response,
  finalUrl: string,
  redirectCount: number,
  responseTimeMs: number,
): HttpCheckResult {
  const statusCode = response.status;
  const statusMessage = response.statusText || httpStatusLabel(statusCode);

  return {
    statusCode,
    statusMessage,
    finalUrl,
    redirectCount,
    responseTimeMs,
    contentType: response.headers.get("content-type") ?? "—",
    server: response.headers.get("server") ?? "—",
    contentLength: response.headers.get("content-length") ?? "—",
    lastModified: response.headers.get("last-modified") ?? "—",
  };
}

function mapRowStatus(statusCode: number): "success" | "warning" | "failed" {
  if (statusCode >= 500) return "failed";
  if (statusCode >= 400) return "warning";
  if (statusCode >= 300) return "warning";
  if (statusCode >= 200) return "success";
  return "warning";
}

async function check(url: string, ctx: CheckerContext) {
  const data = await checkHttpStatus(url, ctx.signal);

  return {
    status: mapRowStatus(data.statusCode),
    responseTimeMs: data.responseTimeMs,
    finalUrl: data.finalUrl,
    httpStatus: data.statusCode,
    statusMessage: data.statusMessage,
    redirectCount: data.redirectCount,
    contentType: data.contentType,
    server: data.server,
    contentLength: data.contentLength,
    lastModified: data.lastModified,
  };
}

export { check };
