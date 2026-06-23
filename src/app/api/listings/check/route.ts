import { NextResponse } from "next/server";
import { checkListingAvailability } from "@/lib/listing-check";
import { ensureResolvedGbpUrl } from "@/lib/gbp";
import { resolveListingPrefill, parseGbpUrlDetails, type ListingPrefill } from "@/lib/listing-prefill";

export const maxDuration = 10;

const PREFILL_TIMEOUT_MS = 12_000;

async function resolvePrefillWithTimeout(gbpUrl: string): Promise<ListingPrefill> {
  const parsed = parseGbpUrlDetails(gbpUrl);
  const fallback: ListingPrefill = {
    businessName: parsed.name ?? undefined,
    source: "gbp-name-only",
  };

  try {
    return await Promise.race([
      resolveListingPrefill(gbpUrl),
      new Promise<ListingPrefill>((_, reject) => {
        setTimeout(() => reject(new Error("Prefill timed out")), PREFILL_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    console.error("Prefill failed or timed out:", err);
    return fallback;
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { gbpUrl?: string };
    const gbpUrl = body.gbpUrl?.trim() ?? "";

    const resolved = await ensureResolvedGbpUrl(gbpUrl);
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const status = await checkListingAvailability(resolved.url);

    const prefill = await resolvePrefillWithTimeout(resolved.url);

    return NextResponse.json({ ...status, prefill, resolvedGbpUrl: resolved.url });
  } catch (err) {
    console.error("Listing check failed:", err);
    return NextResponse.json({ error: "Could not check Google profile. Try again." }, { status: 500 });
  }
}
