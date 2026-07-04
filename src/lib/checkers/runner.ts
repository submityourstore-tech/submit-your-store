import { combineAbortSignals } from "@/lib/fetch/abort";
import type { CheckerContext, ToolResultRow } from "@/types/tools";
import { URL_CHECK_TIMEOUT_MS } from "@/constants/tools";
import { normalizeUrl, validateUrl } from "@/utils/url";
import { classifyError, ToolCheckError } from "@/lib/checkers/errors";
import { getChecker } from "@/lib/checkers/registry";

/**
 * Run a single URL check with timeout and error classification.
 */
export async function runChecker(
  toolSlug: string,
  rawUrl: string,
  signal?: AbortSignal,
): Promise<ToolResultRow> {
  const start = performance.now();
  const validation = validateUrl(rawUrl);

  if (!validation.valid) {
    return {
      url: rawUrl,
      normalizedUrl: normalizeUrl(rawUrl),
      status: "failed",
      responseTimeMs: Math.round(performance.now() - start),
      error: { code: "invalid_url", message: validation.error ?? "Invalid URL" },
    };
  }

  const normalizedUrl = normalizeUrl(rawUrl);
  const checker = getChecker(toolSlug);

  if (!checker) {
    return {
      url: rawUrl,
      normalizedUrl,
      status: "failed",
      responseTimeMs: Math.round(performance.now() - start),
      error: { code: "checker_not_found", message: "Checker not registered for this tool" },
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), URL_CHECK_TIMEOUT_MS);

  const combinedSignal = signal
    ? combineAbortSignals([signal, controller.signal])
    : controller.signal;

  const ctx: CheckerContext = { signal: combinedSignal, toolSlug };

  try {
    const partial = await checker(normalizedUrl, ctx);
    const { status: partialStatus, ...rest } = partial;
    const responseTimeMs = Math.round(performance.now() - start);

    return {
      url: rawUrl,
      normalizedUrl,
      responseTimeMs,
      ...rest,
      status: partialStatus ?? "success",
    };
  } catch (err) {
    if (combinedSignal.aborted && signal?.aborted) {
      throw err; // Propagate cancellation
    }

    const code = classifyError(err);
    return {
      url: rawUrl,
      normalizedUrl,
      status: "failed",
      responseTimeMs: Math.round(performance.now() - start),
      error: {
        code,
        message: err instanceof ToolCheckError ? err.message : err instanceof Error ? err.message : "Check failed",
      },
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
