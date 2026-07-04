/** Shared native HTTP helpers for SEO tool checkers. */

export const HTTP_USER_AGENT = "Mozilla/5.0 (compatible; SubmitYourStore-SEO-Tools/1.0)";

export const MAX_REDIRECT_HOPS = 10;

export function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

export async function fetchManual(
  url: string,
  method: "HEAD" | "GET",
  signal: AbortSignal,
): Promise<Response> {
  return fetch(url, {
    method,
    redirect: "manual",
    signal,
    headers: {
      "User-Agent": HTTP_USER_AGENT,
      Accept: "*/*",
    },
  });
}

/** HEAD request with GET fallback when the server rejects HEAD. */
export async function fetchWithHeadFallback(url: string, signal: AbortSignal): Promise<Response> {
  let response = await fetchManual(url, "HEAD", signal);
  if (response.status === 405 || response.status === 501) {
    response = await fetchManual(url, "GET", signal);
  }
  return response;
}
