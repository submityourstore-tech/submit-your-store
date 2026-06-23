import { NextResponse } from "next/server";
import { resendVerificationLink } from "@/lib/listing-submit";

export async function POST(request: Request) {
  const body = (await request.json()) as { verificationId?: string; token?: string };
  const verificationId = body.verificationId ?? body.token;

  if (!verificationId) {
    return NextResponse.json({ error: "Verification token required." }, { status: 400 });
  }

  const result = await resendVerificationLink(verificationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    verificationId: result.verificationId,
    email: result.email,
    verifyUrl: result.verifyUrl,
    devVerifyUrl: result.devVerifyUrl,
    emailDelivery: result.emailDelivery,
    emailWarning: "emailWarning" in result ? result.emailWarning : undefined,
  });
}
