import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { hashValue } from "@/lib/gbp";
import { getClaimableBusiness } from "@/lib/claim-otp.server";
import {
  findPendingClaimOtp,
  markClaimOtpVerified,
} from "@/lib/claim-otp-store";
import { updateBusiness } from "@/lib/businesses-write";
import { createManageSession } from "@/lib/listing-verification-store";
import { getSiteUrl } from "@/lib/site-config";
import { revalidateBusinessListingPaths } from "@/lib/revalidate-paths";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      businessId?: string;
      verificationId?: string;
      code?: string;
    };

    const businessId = body.businessId?.trim();
    const verificationId = body.verificationId?.trim();
    const code = body.code?.trim();

    if (!businessId || !verificationId || !code) {
      return NextResponse.json(
        { error: "Business ID, verification ID, and code are required." },
        { status: 400 },
      );
    }

    const loaded = await getClaimableBusiness(businessId);
    if (!loaded.ok) {
      return NextResponse.json({ error: loaded.error }, { status: 400 });
    }

    const record = await findPendingClaimOtp(verificationId);
    if (!record || record.businessId !== businessId) {
      return NextResponse.json({ error: "Verification session expired. Start again." }, { status: 400 });
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Verification code expired. Request a new one." }, { status: 400 });
    }

    if (record.codeHash !== hashValue(code)) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    markClaimOtpVerified(verificationId);

    const business = await updateBusiness(businessId, {
      claimStatus: "claimed",
      email: record.email,
    });

    if (!business) {
      return NextResponse.json({ error: "Could not update listing." }, { status: 500 });
    }

    revalidateBusinessListingPaths(business);
    revalidatePath(`/business/${businessId}`);
    revalidatePath(`/claim/${businessId}`);

    const { token } = createManageSession(businessId, record.email);
    const manageUrl = `${getSiteUrl()}/manage-listing/${businessId}?token=${token}`;

    const cookieStore = await cookies();
    cookieStore.set(`manage_${businessId}`, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Business verified! You now have owner access to this listing.",
      manageUrl,
      businessUrl: `/business/${businessId}`,
    });
  } catch (err) {
    console.error("Claim OTP verify failed:", err);
    return NextResponse.json({ error: "Could not verify code." }, { status: 500 });
  }
}
