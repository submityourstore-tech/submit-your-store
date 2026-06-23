import { NextResponse } from "next/server";
import { sendReviewOtpEmail } from "@/lib/email";
import { isValidEmail } from "@/lib/gbp";
import {
  createReviewAuthCode,
  saveReviewAuth,
} from "@/lib/review-auth-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      phone?: string;
    };

    const name = body.name?.trim() ?? "";
    const email = body.email?.trim().toLowerCase() ?? "";
    const phone = body.phone?.trim() ?? "";

    if (name.length < 2) {
      return NextResponse.json({ error: "Enter your name." }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }
    if (phone.replace(/\D/g, "").length < 10) {
      return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
    }

    const { id, code, codeHash } = createReviewAuthCode();
    saveReviewAuth({
      id,
      email,
      name,
      phone,
      codeHash,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    });

    const sent = await sendReviewOtpEmail({ to: email, code, name });
    if (!sent.ok) {
      return NextResponse.json(
        { error: sent.error ?? "Could not send verification email." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      verificationId: id,
      devCode: sent.delivery === "dev" ? sent.devCode : undefined,
    });
  } catch (err) {
    console.error("Review OTP send failed:", err);
    return NextResponse.json({ error: "Could not send verification code." }, { status: 500 });
  }
}
