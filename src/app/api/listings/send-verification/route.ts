import { NextResponse } from "next/server";
import { startVerification } from "@/lib/listing-submit";
import { mediaUrlsForPending } from "@/lib/listing-media";
import type { NewListingPayload } from "@/types/listing";
import type { SocialLinks } from "@/types/business";

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

export async function POST(request: Request) {
  const body = (await request.json()) as {
    type?: "new" | "claim";
    gbpUrl?: string;
    businessEmail?: string;
    businessName?: string;
    businessId?: string;
    phone?: string;
    website?: string;
    category?: string;
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

  if (!body.type || !body.gbpUrl || !body.businessEmail || !body.businessName) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  let payload: NewListingPayload | undefined;
  if (body.type === "new") {
    const sessionId = body.uploadSessionId?.trim();
    const media = sessionId ? mediaUrlsForPending(sessionId) : { gallery: [] as string[] };

    payload = {
      businessName: body.businessName.trim(),
      gbpUrl: body.gbpUrl.trim(),
      businessEmail: body.businessEmail.trim().toLowerCase(),
      phone: body.phone?.trim() ?? "",
      address: body.address?.trim() ?? "",
      website: body.website?.trim(),
      category: body.category?.trim(),
      city: body.city?.trim() || "Dallas",
      state: body.state?.trim() || "TX",
      lat: body.lat,
      lon: body.lon,
      description: body.description?.trim(),
      social: parseSocial(body),
      uploadSessionId: sessionId,
      logo: body.logo?.trim() || media.logo,
      gallery: body.gallery?.length ? body.gallery : media.gallery,
    };
  }

  if (body.type === "new" && !payload?.phone) {
    return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
  }

  if (body.type === "new" && !payload?.address) {
    return NextResponse.json({ error: "Business address is required." }, { status: 400 });
  }

  const result = await startVerification({
    type: body.type,
    gbpUrl: body.gbpUrl,
    businessEmail: body.businessEmail,
    businessName: body.businessName,
    businessId: body.businessId,
    payload,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    verificationId: result.verificationId,
    email: result.email,
    devCode: result.devCode,
    emailDelivery: result.emailDelivery,
  });
}
