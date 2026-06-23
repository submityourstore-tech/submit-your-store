import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { publishNewListing } from "@/lib/businesses-write";
import { checkListingAvailability } from "@/lib/listing-check";
import { ensureResolvedGbpUrl, isValidEmail } from "@/lib/gbp";
import { mediaUrlsForPending } from "@/lib/listing-media";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";
import { getCurrentUser } from "@/lib/user-auth.server";
import type { NewListingPayload } from "@/types/listing";
import type { SocialLinks } from "@/types/business";

const MIN_DESCRIPTION_LENGTH = 40;

function parseSocial(body: Record<string, unknown>): SocialLinks | undefined {
  const raw = body.social as Record<string, string> | undefined;
  if (!raw) return undefined;
  return {
    facebook: raw.facebook?.trim() || null,
    instagram: raw.instagram?.trim() || null,
    linkedin: raw.linkedin?.trim() || null,
    youtube: raw.youtube?.trim() || null,
    twitter: raw.twitter?.trim() || null,
  };
}

function buildNewListingPayload(body: {
  businessName?: string;
  gbpUrl?: string;
  businessEmail?: string;
  phone?: string;
  website?: string;
  category?: string;
  categoryKey?: string;
  city?: string;
  state?: string;
  address?: string;
  lat?: number;
  lon?: number;
  description?: string;
  social?: SocialLinks;
  uploadSessionId?: string;
  logo?: string;
  gallery?: string[];
}): NewListingPayload {
  const sessionId = body.uploadSessionId?.trim();
  const media = sessionId ? mediaUrlsForPending(sessionId) : { gallery: [] as string[] };

  return {
    businessName: body.businessName!.trim(),
    gbpUrl: body.gbpUrl!.trim(),
    businessEmail: body.businessEmail!.trim().toLowerCase(),
    phone: body.phone?.trim() ?? "",
    address: body.address?.trim() ?? "",
    website: body.website?.trim(),
    category: body.category?.trim(),
    categoryKey: body.categoryKey?.trim(),
    city: body.city?.trim() || "Dallas",
    state: body.state?.trim() || "TX",
    lat: body.lat,
    lon: body.lon,
    description: body.description?.trim(),
    social: body.social,
    uploadSessionId: sessionId,
    logo: body.logo?.trim() || media.logo,
    gallery: body.gallery?.length ? body.gallery : media.gallery,
  };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in required. Create an account or sign in to list your business for free." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      type?: "new" | "claim";
      gbpUrl?: string;
      businessEmail?: string;
      businessName?: string;
      phone?: string;
      website?: string;
      category?: string;
      categoryKey?: string;
      city?: string;
      state?: string;
      address?: string;
      lat?: number;
      lon?: number;
      description?: string;
      social?: SocialLinks;
      uploadSessionId?: string;
      logo?: string;
      gallery?: string[];
    };

    if (body.type !== "new") {
      return NextResponse.json(
        { error: "Direct submit is only for new listings. Use claim flow for existing listings." },
        { status: 400 },
      );
    }

    if (!body.gbpUrl?.trim() || !body.businessName?.trim() || !body.businessEmail?.trim()) {
      return NextResponse.json({ error: "Business name, GBP URL, and business email are required." }, { status: 400 });
    }

    if (!isValidEmail(body.businessEmail.trim())) {
      return NextResponse.json({ error: "Enter a valid business email address." }, { status: 400 });
    }

    const description = body.description?.trim() ?? "";
    if (description.length < MIN_DESCRIPTION_LENGTH) {
      return NextResponse.json(
        { error: `Description is required (at least ${MIN_DESCRIPTION_LENGTH} characters).` },
        { status: 400 },
      );
    }

    const resolved = await ensureResolvedGbpUrl(body.gbpUrl.trim());
    if (!resolved.ok) {
      return NextResponse.json({ error: resolved.error }, { status: 400 });
    }

    const check = await checkListingAvailability(resolved.url);
    if (check.status === "claimable" || check.status === "published") {
      return NextResponse.json(
        {
          error:
            "This Google Business Profile is already listed. Use “Claim existing listing” instead.",
        },
        { status: 400 },
      );
    }

    const payload = buildNewListingPayload({ ...body, gbpUrl: resolved.url });

    if (!payload.phone) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }
    if (!payload.address) {
      return NextResponse.json({ error: "Business address is required." }, { status: 400 });
    }

    const business = await publishNewListing(payload);

    revalidateBusinessListingPaths(business);
    revalidatePath(`/business/${business.id}`);
    revalidatePath("/listings");
    revalidatePath("/sitemap.xml");

    return NextResponse.json({
      success: true,
      businessId: business.id,
      businessUrl: `/business/${business.id}`,
      message: "Your listing is now live! It shows as Unclaimed until you verify your business email.",
    });
  } catch (err) {
    console.error("Direct listing submit failed:", err);
    const detail = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Could not publish your listing. Please try again.",
        detail: process.env.NODE_ENV === "development" ? detail : undefined,
      },
      { status: 500 },
    );
  }
}
