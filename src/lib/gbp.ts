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

export function normalizeGbpUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const host = parsed.hostname.replace(/^www\./, "");
    if (!host.includes("google.") || !parsed.pathname.includes("/maps")) {
      return null;
    }
    const decoded = decodeURIComponent(parsed.toString());
    const placeId =
      decoded.match(/place_id=([^&]+)/i)?.[1] ??
      decoded.match(/!1s([^!?\s]+)/i)?.[1] ??
      decoded.match(/\/place\/([^/]+)/i)?.[1];
    if (placeId) return placeId.toLowerCase().replace(/\s+/g, "+");
    return decoded.split("?")[0]!.toLowerCase();
  } catch {
    return null;
  }
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
  return normalizeGbpUrl(url) !== null;
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
