import { NextResponse } from "next/server";
import { createAccountVerificationToken } from "@/lib/account-verification.server";
import { sendAccountVerificationEmail } from "@/lib/email";
import { getSiteUrl } from "@/lib/site-config";
import { createUser } from "@/lib/user-store";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };

    const result = await createUser({
      name: body.name ?? "",
      email: body.email ?? "",
      password: body.password ?? "",
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const token = await createAccountVerificationToken(result.user.id, result.user.email);
    const verifyUrl = `${getSiteUrl()}/auth/verify-account?token=${encodeURIComponent(token)}`;
    const emailResult = await sendAccountVerificationEmail({
      to: result.user.email,
      name: result.user.name,
      verifyUrl,
    });

    return NextResponse.json({
      user: result.user,
      verificationSent: emailResult.ok,
      devVerifyUrl: emailResult.devVerifyUrl,
      verificationError: emailResult.ok ? undefined : emailResult.error,
    });
  } catch (err) {
    console.error("Sign up failed:", err);
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
