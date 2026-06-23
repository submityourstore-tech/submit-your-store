import { NextResponse } from "next/server";
import { sendReviewOtpEmail } from "@/lib/email";
import {
  getClaimableBusiness,
  validateClaimBusinessEmail,
} from "@/lib/claim-otp.server";
import {
  createClaimOtpCode,
  saveClaimOtp,
} from "@/lib/claim-otp-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { businessId?: string; email?: string };
    const businessId = body.businessId?.trim();
    const emailRaw = body.email?.trim() ?? "";

    if (!businessId) {
      return NextResponse.json({ error: "Business ID is required." }, { status: 400 });
    }

    const loaded = await getClaimableBusiness(businessId);
    if (!loaded.ok) {
      return NextResponse.json({ error: loaded.error }, { status: 400 });
    }

    const validated = validateClaimBusinessEmail(loaded.business, emailRaw);
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const { id, code, codeHash } = createClaimOtpCode();
    saveClaimOtp({
      id,
      businessId: loaded.business.id,
      businessName: loaded.business.name,
      email: validated.email,
      codeHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    const sent = await sendReviewOtpEmail({
      to: validated.email,
      code,
      name: loaded.business.name,
    });

    if (!sent.ok) {
      return NextResponse.json(
        { error: sent.error ?? "Could not send verification code." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      verificationId: id,
      email: validated.email,
      devCode: sent.delivery === "dev" ? sent.devCode : undefined,
    });
  } catch (err) {
    console.error("Claim OTP send failed:", err);
    return NextResponse.json({ error: "Could not send verification code." }, { status: 500 });
  }
}
