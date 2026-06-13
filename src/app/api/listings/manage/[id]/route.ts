import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getBusinessById } from "@/lib/businesses";
import { updateBusiness } from "@/lib/businesses-write";
import { validateManageToken } from "@/lib/listing-verification-store";
import type { SocialLinks } from "@/types/business";

type RouteContext = { params: Promise<{ id: string }> };

async function getToken(request: Request, businessId: string) {
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");
  if (queryToken) return queryToken;
  const cookieStore = await cookies();
  return cookieStore.get(`manage_${businessId}`)?.value ?? null;
}

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const business = getBusinessById(id);
  if (!business) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  const token = await getToken(request, id);
  if (!token || !validateManageToken(id, token)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ business, authorized: true });
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const token = await getToken(request, id);
  const session = token ? validateManageToken(id, token) : null;
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    address?: string;
    social?: SocialLinks;
    logo?: string | null;
    gallery?: string[];
  };

  const patch: Record<string, unknown> = {};
  if (body.name?.trim()) patch.name = body.name.trim();
  if (body.phone?.trim()) patch.phone = body.phone.trim();
  if (body.website !== undefined) patch.website = body.website?.trim() || null;
  if (body.description !== undefined) patch.description = body.description.trim();
  if (body.address !== undefined) patch.address = body.address?.trim() || null;

  if (body.social) {
    patch.social = {
      facebook: body.social.facebook?.trim() || null,
      instagram: body.social.instagram?.trim() || null,
      linkedin: body.social.linkedin?.trim() || null,
      youtube: body.social.youtube?.trim() || null,
      twitter: body.social.twitter?.trim() || null,
    };
  }

  if (body.logo !== undefined) {
    patch.logo = body.logo ?? undefined;
  }
  if (body.gallery !== undefined) {
    patch.gallery = body.gallery.length ? body.gallery : undefined;
  }

  if (body.email !== undefined) {
    const email = body.email.trim().toLowerCase();
    const domain = session.email.split("@")[1];
    if (!email.endsWith(`@${domain}`)) {
      return NextResponse.json(
        { error: `Email must stay on your verified @${domain} domain.` },
        { status: 400 },
      );
    }
    patch.email = email;
  }

  const updated = updateBusiness(id, patch as Partial<import("@/types/business").Business>);
  if (!updated) {
    return NextResponse.json({ error: "Business not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true, business: updated });
}
