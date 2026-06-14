import { NextResponse } from "next/server";
import { hashValue } from "@/lib/gbp";
import {
  findPendingReviewAuth,
  markReviewAuthVerified,
} from "@/lib/review-auth-store";
import { upsertVerifiedReviewUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { verificationId?: string; code?: string };
    const { verificationId, code } = body;

    if (!verificationId || !code) {
      return NextResponse.json({ error: "Verification ID and code are required." }, { status: 400 });
    }

    const record = findPendingReviewAuth(verificationId);
    if (!record) {
      return NextResponse.json({ error: "Verification session expired. Start again." }, { status: 400 });
    }

    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "Verification code expired. Request a new one." }, { status: 400 });
    }

    if (record.codeHash !== hashValue(code.trim())) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    markReviewAuthVerified(verificationId);
    const { user, tempPassword } = upsertVerifiedReviewUser({
      name: record.name,
      email: record.email,
      phone: record.phone,
    });

    return NextResponse.json({
      email: user.email,
      tempPassword,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    console.error("Review OTP verify failed:", err);
    return NextResponse.json({ error: "Could not verify code." }, { status: 500 });
  }
}
