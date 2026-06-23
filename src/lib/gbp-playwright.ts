import { chromium } from "playwright";

import type { GbpAddressResult } from "@/lib/gbp-address";

const INVISIBLE_CHARS = /[\uE000-\uF8FF\u200B-\u200D\uFEFF]/g;

function cleanText(text: string): string {
  return text.replace(INVISIBLE_CHARS, "").replace(/\s+/g, " ").trim();
}

function normalizeAddress(raw: string): string {
  const cleaned = cleanText(raw);
  if (!cleaned) return "";
  if (/, United States$/i.test(cleaned)) return cleaned;
  if (/, USA$/i.test(cleaned)) return cleaned.replace(/, USA$/i, ", United States");
  return `${cleaned}, United States`;
}

function parseCityState(address: string): { city: string; state: string } {
  const parts = address.replace(/, United States$/i, "").split(",").map((p) => p.trim());
  const cityStateZip = parts[parts.length - 1] ?? "";
  const match = cityStateZip.match(/^(.+?)\s+([A-Z]{2})\s+\d{5}$/);
  return {
    city: match?.[1] ?? "Dallas",
    state: match?.[2] ?? "TX",
  };
}

function parseCoordsFromUrl(url: string): { lat: number; lon: number } | null {
  const decoded = decodeURIComponent(url);
  const atMatch = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return { lat: parseFloat(atMatch[1]!), lon: parseFloat(atMatch[2]!) };
  }
  const dataMatch = decoded.match(/3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (dataMatch) {
    return { lat: parseFloat(dataMatch[1]!), lon: parseFloat(dataMatch[2]!) };
  }
  return null;
}

function playwrightAllowed(): boolean {
  if (process.env.PLAYWRIGHT_GBP_ENABLED === "false") return false;
  // Playwright/Chromium is unreliable on Vercel serverless (timeouts, missing browsers).
  if (process.env.VERCEL === "1" && process.env.PLAYWRIGHT_GBP_ENABLED !== "true") {
    return false;
  }
  return true;
}

/** Headless Chromium scrape — exact address shown on the live GBP page (no API key). */
export async function scrapeGbpAddressWithPlaywright(
  gbpUrl: string,
): Promise<GbpAddressResult | null> {
  if (!playwrightAllowed()) return null;

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(gbpUrl.trim(), { waitUntil: "domcontentloaded", timeout: 60_000 });

    const addressBtn = page.locator('button[data-item-id="address"]').first();
    await addressBtn.waitFor({ state: "visible", timeout: 20_000 });

    let rawAddress = cleanText(
      (await addressBtn.locator(".fontBodyMedium").first().textContent()) ?? "",
    );

    if (!rawAddress) {
      const aria = await addressBtn.getAttribute("aria-label");
      rawAddress = cleanText(aria?.replace(/^Address:\s*/i, "") ?? "");
    }

    if (!rawAddress) {
      rawAddress = cleanText((await addressBtn.textContent()) ?? "");
    }

    if (!rawAddress || rawAddress.length < 8) return null;

    const address = normalizeAddress(rawAddress);
    const { city, state } = parseCityState(address);
    const coords = parseCoordsFromUrl(page.url()) ?? parseCoordsFromUrl(gbpUrl);

    const businessName = cleanText((await page.locator("h1").first().textContent()) ?? "") || undefined;

    let phone: string | undefined;
    try {
      const phoneBtn = page.locator('button[data-item-id^="phone"]').first();
      if (await phoneBtn.isVisible({ timeout: 3000 })) {
        const phoneText = cleanText(
          (await phoneBtn.locator(".fontBodyMedium").first().textContent()) ?? "",
        );
        if (phoneText) {
          phone = phoneText;
        } else {
          const aria = await phoneBtn.getAttribute("aria-label");
          const fromAria = aria?.replace(/^Phone:\s*/i, "").trim();
          if (fromAria) phone = fromAria;
        }
      }
    } catch {
      // Phone not always present on GBP
    }

    return {
      businessName,
      address,
      addressLabel: address.replace(/, United States$/i, ""),
      city,
      state,
      lat: coords?.lat ?? 0,
      lon: coords?.lon ?? 0,
      phone,
      source: "gbp-playwright",
    };
  } catch (error) {
    console.error("Playwright GBP scrape failed:", error);
    return null;
  } finally {
    await browser?.close();
  }
}
