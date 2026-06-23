import { NextResponse } from "next/server";
import { verifyAccountVerificationToken } from "@/lib/account-verification.server";
import { findUserById, markUserEmailVerified, toPublicUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string };
    const token = body.token?.trim();
    if (!token) {
      return NextResponse.json({ error: "Verification token is required." }, { status: 400 });
    }

    const parsed = await verifyAccountVerificationToken(token);
    if (!parsed) {
      return NextResponse.json({ error: "Invalid or expired verification link." }, { status: 400 });
    }

    const user = await findUserById(parsed.userId);
    if (!user || user.email.toLowerCase() !== parsed.email) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (!user.emailVerified) {
      await markUserEmailVerified(user.id);
    }

    const updated = await findUserById(user.id);
    return NextResponse.json({
      success: true,
      user: updated ? toPublicUser(updated) : toPublicUser({ ...user, emailVerified: true }),
    });
  } catch (err) {
    console.error("Account verification failed:", err);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
