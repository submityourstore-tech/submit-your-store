import { NextResponse } from "next/server";
import { checkListingAvailability } from "@/lib/listing-submit";
import { isValidGbpUrl } from "@/lib/gbp";
import { resolveListingPrefill, parseGbpUrlDetails } from "@/lib/listing-prefill";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { gbpUrl?: string };
    const gbpUrl = body.gbpUrl?.trim() ?? "";

    if (!gbpUrl || !isValidGbpUrl(gbpUrl)) {
      return NextResponse.json({ error: "Invalid Google Business Profile link." }, { status: 400 });
    }

    const status = checkListingAvailability(gbpUrl);

    let prefill;
    try {
      prefill = await resolveListingPrefill(gbpUrl);
    } catch (err) {
      console.error("Prefill failed:", err);
      const parsed = parseGbpUrlDetails(gbpUrl);
      prefill = {
        businessName: parsed.name ?? undefined,
        source: "gbp-name-only" as const,
      };
    }

    return NextResponse.json({ ...status, prefill });
  } catch (err) {
    console.error("Listing check failed:", err);
    return NextResponse.json({ error: "Could not check Google profile. Try again." }, { status: 500 });
  }
}
