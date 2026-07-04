import type { CheckerContext } from "@/types/tools";
import { ToolCheckError } from "@/lib/checkers/errors";
import {
  fetchWithHeadFallback,
  isRedirectStatus,
  MAX_REDIRECT_HOPS,
} from "@/lib/fetch/http-request";

type RedirectHop = {
  url: string;
  status: number;
};

type RedirectTraceResult = {
  redirected: boolean;
  redirectChain: string;
  redirectCount: number;
  redirectTypes: number[];
  finalUrl: string;
  finalStatusCode: number;
  responseTimeMs: number;
  loopDetected: boolean;
  warnings: string;
  broken: boolean;
};

function formatChain(hops: RedirectHop[]): string {
  return hops.map((hop) => `${hop.url} (${hop.status})`).join(" → ");
}

function traceRedirects(url: string, signal: AbortSignal): Promise<RedirectTraceResult> {
  const startTime = Date.now();
  const hops: RedirectHop[] = [];
  const visited = new Set<string>();
  const redirectTypes: number[] = [];
  const warnings: string[] = [];
  let currentUrl = url;
  let loopDetected = false;
  let broken = false;

  return (async () => {
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop++) {
      const visitKey = currentUrl.toLowerCase();
      if (visited.has(visitKey)) {
        loopDetected = true;
        warnings.push("Redirect loop detected");
        break;
      }
      visited.add(visitKey);

      const response = await fetchWithHeadFallback(currentUrl, signal);
      hops.push({ url: currentUrl, status: response.status });

      if (isRedirectStatus(response.status)) {
        redirectTypes.push(response.status);
        const location = response.headers.get("location");
        if (!location) {
          warnings.push("Redirect missing Location header");
          broken = true;
          break;
        }
        try {
          currentUrl = new URL(location, currentUrl).href;
        } catch {
          warnings.push("Invalid redirect Location header");
          broken = true;
          break;
        }
        continue;
      }

      const finalStatusCode = response.status;
      if (finalStatusCode >= 400) {
        broken = true;
        if (finalStatusCode >= 500) {
          warnings.push(`Server error ${finalStatusCode} at destination`);
        } else {
          warnings.push(`Client error ${finalStatusCode} at destination`);
        }
      }

      const redirectCount = redirectTypes.length;
      return {
        redirected: redirectCount > 0,
        redirectChain: formatChain(hops),
        redirectCount,
        redirectTypes,
        finalUrl: currentUrl,
        finalStatusCode,
        responseTimeMs: Date.now() - startTime,
        loopDetected,
        warnings: warnings.join("; ") || "—",
        broken,
      };
    }

    if (loopDetected) {
      return {
        redirected: redirectTypes.length > 0,
        redirectChain: formatChain(hops),
        redirectCount: redirectTypes.length,
        redirectTypes,
        finalUrl: currentUrl,
        finalStatusCode: hops[hops.length - 1]?.status ?? 0,
        responseTimeMs: Date.now() - startTime,
        loopDetected: true,
        warnings: warnings.join("; ") || "Redirect loop detected",
        broken: true,
      };
    }

    throw new ToolCheckError("redirect_loop", "Too many redirects");
  })();
}

function mapRowStatus(result: RedirectTraceResult): "success" | "warning" | "failed" {
  if (result.loopDetected) return "warning";
  if (result.broken) return "warning";
  if (result.redirected) return "success";
  return "success";
}

async function check(url: string, ctx: CheckerContext) {
  const data = await traceRedirects(url, ctx.signal);

  return {
    status: mapRowStatus(data),
    responseTimeMs: data.responseTimeMs,
    redirected: data.redirected ? "Yes" : "No",
    redirectChain: data.redirectChain,
    redirectCount: data.redirectCount,
    redirectTypes: data.redirectTypes.join(", ") || "—",
    finalUrl: data.finalUrl,
    finalStatusCode: data.finalStatusCode,
    loopDetected: data.loopDetected ? "Yes" : "No",
    warnings: data.warnings,
    broken: data.broken,
  };
}

export { check };
