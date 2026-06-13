import { NextResponse } from "next/server";
import { resendVerificationCode } from "@/lib/listing-submit";

export async function POST(request: Request) {
  const body = (await request.json()) as { verificationId?: string };
  if (!body.verificationId) {
    return NextResponse.json({ error: "Verification ID required." }, { status: 400 });
  }

  const result = await resendVerificationCode(body.verificationId);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    email: result.email,
    devCode: result.devCode,
    emailDelivery: result.emailDelivery,
  });
}
