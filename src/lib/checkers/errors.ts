import type { ToolErrorCode } from "@/types/tools";
import { ERROR_MESSAGES } from "@/constants/tools";

export class ToolCheckError extends Error {
  code: ToolErrorCode;

  constructor(code: ToolErrorCode, message?: string) {
    super(message ?? ERROR_MESSAGES[code]);
    this.name = "ToolCheckError";
    this.code = code;
  }
}

/**
 * Classify an unknown error into a ToolErrorCode.
 */
export function classifyError(err: unknown): ToolErrorCode {
  if (err instanceof ToolCheckError) return err.code;

  const message = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

  if (message.includes("abort") || message.includes("cancel")) return "unknown";
  if (message.includes("timeout") || message.includes("timed out")) return "timeout";
  if (message.includes("ssl") || message.includes("certificate") || message.includes("cert"))
    return "ssl_error";
  if (message.includes("dns") || message.includes("enotfound") || message.includes("getaddrinfo"))
    return "dns_error";
  if (message.includes("redirect") && message.includes("loop")) return "redirect_loop";
  if (message.includes("403") || message.includes("blocked") || message.includes("forbidden"))
    return "blocked";
  if (message.includes("network") || message.includes("fetch failed") || message.includes("econnrefused"))
    return "network_error";
  if (message.includes("invalid url") || message.includes("invalid hostname")) return "invalid_url";
  if (message.includes("rate limit") || message.includes("429")) return "rate_limited";

  return "unknown";
}

export function errorMessage(code: ToolErrorCode): string {
  return ERROR_MESSAGES[code];
}
