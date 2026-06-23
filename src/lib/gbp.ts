import { createHash, randomBytes, randomInt } from "crypto";
import type { Business } from "@/types/business";

const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "mail.com",
  "yandex.com",
]);

const GBP_SHARE_HOSTS = [
  "maps.app.goo.gl",
  "goo.gl",
  "g.page",
  "g.co",
  "business.google.com",
  "share.google.com",
  "share.google",
];

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

function extractPlaceIdFromText(text: string): string | null {
  const decoded = decodeURIComponent(text.trim());
  const patterns = [
    /19s(ChI[A-Za-z0-9_-]+)/,
    /[?&]place_id=([^&]+)/i,
    /[?&]query_place_id=([^&]+)/i,
    /place_id:(ChI[A-Za-z0-9_-]+)/i,
    /!(ChI[A-Za-z0-9_-]{20,})/,
  ];
  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (match?.[1]) return decodeURIComponent(match[1]);
  }
  return null;
}

function parseInputUrl(input: string): URL | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }
}

export function looksLikeGbpShareUrl(input: string): boolean {
  const parsed = parseInputUrl(input);
  if (!parsed) return false;

  const host = parsed.hostname.replace(/^www\./, "");
  if (host.includes("google.") && (parsed.pathname.includes("/maps") || parsed.search.includes("place_id"))) {
    return true;
  }

  return GBP_SHARE_HOSTS.some((shareHost) => host === shareHost || host.endsWith(`.${shareHost}`));
}

export function normalizeGbpUrl(url: string): string | null {
  const parsed = parseInputUrl(url);
  if (!parsed) return null;

  const host = parsed.hostname.replace(/^www\./, "");
  const isGoogleMapsHost =
    host.includes("google.") && (parsed.pathname.includes("/maps") || parsed.search.includes("place_id"));

  if (!isGoogleMapsHost && !looksLikeGbpShareUrl(url)) {
    return null;
  }

  if (!isGoogleMapsHost) {
    return null;
  }

  const decoded = decodeURIComponent(parsed.toString());
  const placeId =
    extractPlaceIdFromText(decoded) ??
    decoded.match(/!1s([^!?\s]+)/i)?.[1] ??
    decoded.match(/\/place\/([^/]+)/i)?.[1];

  if (placeId && placeId.startsWith("ChI")) {
    return placeId.toLowerCase();
  }

  if (placeId) return placeId.toLowerCase().replace(/\s+/g, "+");
  return decoded.split("?")[0]!.toLowerCase();
}

export function buildGbpMapsUrl(placeId: string): string {
  return `https://www.google.com/maps/search/?api=1&query_place_id=${encodeURIComponent(placeId)}`;
}

function pickMapsUrlFromHtml(html: string): string | null {
  const matches = html.match(/https:\/\/(?:www\.)?google\.[^"'\\s<>]+\/maps[^"'\\s<>]*/gi) ?? [];
  for (const candidate of matches) {
    const cleaned = candidate.replace(/&amp;/g, "&");
    if (normalizeGbpUrl(cleaned)) return cleaned;
  }
  return null;
}

/** Follow GBP share links (maps.app.goo.gl, g.page, etc.) to a usable Maps URL. */
export async function resolveGbpUrl(input: string): Promise<string | null> {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (normalizeGbpUrl(trimmed)) {
    const placeId = extractPlaceIdFromText(trimmed);
    if (placeId?.startsWith("ChI")) return buildGbpMapsUrl(placeId);
    return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
  }

  if (!looksLikeGbpShareUrl(trimmed)) return null;

  const startUrl = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;

  try {
    const res = await fetch(startUrl, {
      method: "GET",
      redirect: "follow",
      headers: FETCH_HEADERS,
    });

    if (normalizeGbpUrl(res.url)) {
      const placeId = extractPlaceIdFromText(res.url);
      if (placeId?.startsWith("ChI")) return buildGbpMapsUrl(placeId);
      return res.url;
    }

    const html = await res.text();
    const fromHtml = pickMapsUrlFromHtml(html);
    if (fromHtml) {
      const placeId = extractPlaceIdFromText(fromHtml);
      if (placeId?.startsWith("ChI")) return buildGbpMapsUrl(placeId);
      return fromHtml;
    }

    const placeId =
      extractPlaceIdFromText(res.url) ?? extractPlaceIdFromText(html) ?? extractPlaceIdFromText(startUrl);
    if (placeId?.startsWith("ChI")) return buildGbpMapsUrl(placeId);
  } catch (error) {
    console.error("resolveGbpUrl failed:", error);
  }

  return null;
}

export async function ensureResolvedGbpUrl(
  input: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, error: "Enter your Google Business Profile link." };
  }

  if (normalizeGbpUrl(trimmed)) {
    const resolved = await resolveGbpUrl(trimmed);
    return { ok: true, url: resolved ?? (trimmed.startsWith("http") ? trimmed : `https://${trimmed}`) };
  }

  if (!looksLikeGbpShareUrl(trimmed)) {
    return {
      ok: false,
      error:
        "Paste your Google Business Profile share link (Share → Copy link) or a Google Maps place URL.",
    };
  }

  const resolved = await resolveGbpUrl(trimmed);
  if (!resolved) {
    return {
      ok: false,
      error:
        "Could not open that Google profile link. Copy the share link again from your Business Profile (Share → Copy link).",
    };
  }

  return { ok: true, url: resolved };
}

export function extractEmailDomain(email: string): string | null {
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  return parts[1];
}

export function isBusinessEmail(email: string): boolean {
  const domain = extractEmailDomain(email);
  if (!domain) return false;
  return !FREE_EMAIL_DOMAINS.has(domain);
}

export function emailMatchesBusinessDomain(email: string, businessEmail: string | null): boolean {
  const submitDomain = extractEmailDomain(email);
  const listedDomain = extractEmailDomain(businessEmail ?? "");
  if (!submitDomain || !listedDomain) return false;
  return submitDomain === listedDomain;
}

export function findBusinessByGbp(
  gbpUrl: string,
  businesses: Business[],
): Business | undefined {
  const key = normalizeGbpUrl(gbpUrl);
  if (!key) return undefined;
  return businesses.find((b) => {
    if (!b.googleMapsUrl) return false;
    const existing = normalizeGbpUrl(b.googleMapsUrl);
    return existing === key || existing?.includes(key) || key.includes(existing ?? "");
  });
}

export class DuplicateGbpError extends Error {
  readonly gbpUrl: string;
  readonly existingId: string;
  readonly existingName: string;

  constructor(gbpUrl: string, existing: Pick<Business, "id" | "name">, inFile = false) {
    const message = formatDuplicateGbpMessage(gbpUrl, existing, inFile);
    super(message);
    this.name = "DuplicateGbpError";
    this.gbpUrl = gbpUrl;
    this.existingId = existing.id;
    this.existingName = existing.name;
  }
}

export function formatDuplicateGbpMessage(
  gbpUrl: string,
  existing: Pick<Business, "id" | "name">,
  inFile = false,
): string {
  const where = inFile
    ? "This GBP URL appears more than once in your upload file."
    : `This Google Business Profile is already listed as "${existing.name}" (/business/${existing.id}).`;
  return `${where} Remove this duplicate GBP URL and upload again:\n${gbpUrl}`;
}

export function findDuplicateGbpListing(
  gbpUrl: string | undefined | null,
  businesses: Business[],
): { gbpUrl: string; existing: Business } | null {
  const trimmed = gbpUrl?.trim();
  if (!trimmed) return null;

  const existing = findBusinessByGbp(trimmed, businesses);
  if (!existing) return null;

  return { gbpUrl: trimmed, existing };
}

export function gbpUrlDedupeKey(gbpUrl: string): string | null {
  return normalizeGbpUrl(gbpUrl) ?? gbpUrl.trim().toLowerCase();
}

export function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateVerificationCode(): string {
  return String(randomInt(100000, 999999));
}

export function generateManageToken(): string {
  return randomBytes(32).toString("hex");
}

export function isValidGbpUrl(url: string): boolean {
  return normalizeGbpUrl(url) !== null || looksLikeGbpShareUrl(url);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Domain from business website URL, e.g. texasairzone.com */
export function domainFromWebsite(website: string | null | undefined): string | null {
  if (!website?.trim()) return null;
  try {
    const url = website.trim().startsWith("http") ? website.trim() : `https://${website.trim()}`;
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return null;
  }
}

export function emailMatchesDomain(email: string, domain: string): boolean {
  return extractEmailDomain(email) === domain.toLowerCase();
}
