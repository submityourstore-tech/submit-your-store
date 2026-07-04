/**
 * Validate a URL string.
 * Accepts domains, URLs with or without protocol.
 */
export function validateUrl(input: string): { valid: boolean; error?: string } {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: "URL is empty" };

  try {
    const normalized = normalizeUrl(trimmed);
    const parsed = new URL(normalized);
    if (!parsed.hostname || !parsed.hostname.includes(".")) {
      return { valid: false, error: "Invalid hostname" };
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { valid: false, error: "Only HTTP/HTTPS URLs are supported" };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

/**
 * Normalize a URL — adds https:// if missing, lowercases hostname.
 */
export function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url) return "";

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    parsed.hostname = parsed.hostname.toLowerCase();
    // Remove trailing slash from pathname if it's just "/"
    if (parsed.pathname === "/" && !parsed.search && !parsed.hash) {
      return `${parsed.protocol}//${parsed.hostname}`;
    }
    return parsed.href;
  } catch {
    return url;
  }
}

/**
 * Remove duplicate URLs (case-insensitive, normalized).
 */
export function removeDuplicates(urls: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of urls) {
    const normalized = normalizeUrl(raw);
    const key = normalized.toLowerCase();
    if (normalized && !seen.has(key)) {
      seen.add(key);
      result.push(normalized);
    }
  }

  return result;
}

/**
 * Parse raw text input into URL strings.
 */
export function parseUrlLines(text: string): string[] {
  return text
    .split(/[\n\r,;|\t]+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * Extract hostname from URL for display.
 */
export function extractHostname(url: string): string {
  try {
    return new URL(normalizeUrl(url)).hostname;
  } catch {
    return url;
  }
}
