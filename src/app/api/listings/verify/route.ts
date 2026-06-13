import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getBusinessById } from "@/lib/businesses";
import { publishNewListing } from "@/lib/businesses-write";
import { toLocationSlug } from "@/lib/location-utils";
import { hashValue } from "@/lib/gbp";
import { sendManageAccessEmail } from "@/lib/email";
import {
  createManageSession,
  findPendingVerification,
  markVerificationComplete,
} from "@/lib/listing-verification-store";

export async function POST(request: Request) {
  const body = (await request.json()) as { verificationId?: string; code?: string };
  const { verificationId, code } = body;

  if (!verificationId || !code) {
    return NextResponse.json({ error: "Verification ID and code are required." }, { status: 400 });
  }

  const record = findPendingVerification(verificationId);
  if (!record) {
    return NextResponse.json({ error: "Verification expired or not found." }, { status: 400 });
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Verification code expired." }, { status: 400 });
  }

  if (record.codeHash !== hashValue(code.trim())) {
    return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
  }

  markVerificationComplete(verificationId);

  if (record.type === "new" && record.payload) {
    const business = publishNewListing(record.payload);

    revalidatePath("/");
    revalidatePath("/hvac/texas");
    revalidatePath(`/hvac/${toLocationSlug(business.city, business.state)}`);
    revalidatePath(`/business/${business.id}`);

    return NextResponse.json({
      success: true,
      type: "new",
      businessId: business.id,
      businessUrl: `/business/${business.id}`,
      message: "Business email verified. Your listing is now live!",
    });
  }

  if (record.type === "claim" && record.businessId) {
    const business = getBusinessById(record.businessId);
    const businessName = business?.name ?? "your business";
    const { token } = createManageSession(record.businessId, record.businessEmail);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const manageUrl = `${baseUrl}/manage-listing/${record.businessId}?token=${token}`;

    await sendManageAccessEmail({
      to: record.businessEmail,
      businessName,
      manageUrl,
    });

    const cookieStore = await cookies();
    cookieStore.set(`manage_${record.businessId}`, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      type: "claim",
      businessId: record.businessId,
      manageUrl,
      message: "Email verified. Manage access link sent to your business email.",
    });
  }

  return NextResponse.json({ error: "Unable to complete verification." }, { status: 400 });
}
