const RESEND_API = "https://api.resend.com/emails";

type SendVerificationEmailParams = {
  to: string;
  verifyUrl: string;
  businessName: string;
  purpose: "new" | "claim";
};

export type EmailDeliveryResult = {
  ok: boolean;
  delivery: "email" | "dev" | "link" | "failed";
  devVerifyUrl?: string;
  devCode?: string;
  error?: string;
};

function isProduction(): boolean {
  return process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
}

function resolveResendKey():
  | { ok: true; apiKey: string }
  | { ok: false; delivery: "dev" | "failed"; error?: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (apiKey) {
    return { ok: true, apiKey };
  }
  if (isProduction()) {
    return {
      ok: false,
      delivery: "failed",
      error:
        "Verification email is not configured. Add RESEND_API_KEY to your Vercel project environment variables (Settings → Environment Variables → Production).",
    };
  }
  return { ok: false, delivery: "dev" };
}

/** User-facing note when outbound email fails — never expose provider/admin setup steps. */
export function emailDeliveryWarning(detail?: string): string {
  if (!detail) {
    return "We couldn't email the verification link, but you can verify on the next screen.";
  }
  if (/only send testing emails|verified domains|resend\.com/i.test(detail)) {
    return "We couldn't email the verification link to that address, but you can verify on the next screen.";
  }
  return "We couldn't email the verification link, but you can verify on the next screen.";
}

export async function sendVerificationEmail({
  to,
  verifyUrl,
  businessName,
  purpose,
}: SendVerificationEmailParams): Promise<EmailDeliveryResult> {
  const from = process.env.LISTING_EMAIL_FROM ?? "Submit Your Store <onboarding@resend.dev>";
  const subject =
    purpose === "claim"
      ? `Verify ownership of ${businessName} on Submit Your Store`
      : `Verify your business listing on Submit Your Store`;

  const actionLabel = purpose === "claim" ? "Verify & manage listing" : "Verify & publish listing";

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1274c0">Submit Your Store</h2>
      <p>Click the button below to verify <strong>${businessName}</strong> using your business email address.</p>
      <p style="margin:28px 0">
        <a href="${verifyUrl}" style="background:#1274c0;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:bold;display:inline-block">${actionLabel}</a>
      </p>
      <p style="color:#717171;font-size:14px">Or copy this link into your browser:</p>
      <p style="font-size:13px;word-break:break-all;color:#555">${verifyUrl}</p>
      <p style="color:#717171;font-size:14px">This link expires in 15 minutes. We only send verification to your business email address.</p>
      ${
        purpose === "claim"
          ? "<p style='font-size:14px'>After verification you can edit and manage your existing listing.</p>"
          : "<p style='font-size:14px'>After verification your listing goes live on Submit Your Store.</p>"
      }
    </div>
  `;

  const keyResult = resolveResendKey();
  if (!keyResult.ok) {
    if (keyResult.delivery === "dev") {
      console.info(`[dev] Verification email to ${to}: ${verifyUrl}`);
      return { ok: true, delivery: "dev", devVerifyUrl: verifyUrl };
    }
    return { ok: false, delivery: "failed", error: keyResult.error };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyResult.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });

    if (!res.ok) {
      let detail = "Email provider rejected the request.";
      try {
        const errBody = (await res.json()) as { message?: string };
        if (errBody.message) detail = errBody.message;
      } catch {
        detail = await res.text();
      }
      console.error("Email send failed", detail);
      return { ok: false, delivery: "failed", error: emailDeliveryWarning(detail) };
    }

    return { ok: true, delivery: "email" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    console.error("Email send error", message);
    return { ok: false, delivery: "failed", error: message };
  }
}

export async function sendReviewOtpEmail(params: {
  to: string;
  code: string;
  name: string;
}): Promise<EmailDeliveryResult> {
  const from = process.env.LISTING_EMAIL_FROM ?? "Submit Your Store <onboarding@resend.dev>";
  const subject = "Your verification code — Submit Your Store";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1274c0">Submit Your Store</h2>
      <p>Hi ${params.name},</p>
      <p>Enter this code to verify your email and publish your review:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#111">${params.code}</p>
      <p style="color:#717171;font-size:14px">This code expires in 15 minutes.</p>
    </div>
  `;

  const keyResult = resolveResendKey();
  if (!keyResult.ok) {
    if (keyResult.delivery === "dev") {
      console.info(`[dev] Review OTP to ${params.to}: ${params.code}`);
      return { ok: true, delivery: "dev", devCode: params.code };
    }
    return { ok: false, delivery: "failed", error: keyResult.error };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyResult.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [params.to], subject, html }),
    });

    if (!res.ok) {
      let detail = "Email provider rejected the request.";
      try {
        const errBody = (await res.json()) as { message?: string };
        if (errBody.message) detail = errBody.message;
      } catch {
        detail = await res.text();
      }
      return { ok: false, delivery: "failed", error: detail };
    }

    return { ok: true, delivery: "email" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    return { ok: false, delivery: "failed", error: message };
  }
}

export async function sendAccountVerificationEmail(params: {
  to: string;
  name: string;
  verifyUrl: string;
}): Promise<EmailDeliveryResult> {
  const from = process.env.LISTING_EMAIL_FROM ?? "Submit Your Store <onboarding@resend.dev>";
  const subject = "Verify your email — Submit Your Store";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1274c0">Welcome to Submit Your Store</h2>
      <p>Hi ${params.name},</p>
      <p>Please verify your email address to publish reviews, vote, and list your business.</p>
      <p style="margin:28px 0">
        <a href="${params.verifyUrl}" style="background:#1274c0;color:#fff;text-decoration:none;padding:14px 24px;border-radius:6px;font-weight:bold;display:inline-block">Verify my email</a>
      </p>
      <p style="color:#717171;font-size:14px">Or copy this link:</p>
      <p style="font-size:13px;word-break:break-all;color:#555">${params.verifyUrl}</p>
      <p style="color:#717171;font-size:14px">This link expires in 24 hours.</p>
    </div>
  `;

  const keyResult = resolveResendKey();
  if (!keyResult.ok) {
    if (keyResult.delivery === "dev") {
      console.info(`[dev] Account verification to ${params.to}: ${params.verifyUrl}`);
      return { ok: true, delivery: "dev", devVerifyUrl: params.verifyUrl };
    }
    return { ok: false, delivery: "failed", error: keyResult.error };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keyResult.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to: [params.to], subject, html }),
    });

    if (!res.ok) {
      let detail = "Email provider rejected the request.";
      try {
        const errBody = (await res.json()) as { message?: string };
        if (errBody.message) detail = errBody.message;
      } catch {
        detail = await res.text();
      }
      return { ok: false, delivery: "failed", error: detail };
    }

    return { ok: true, delivery: "email" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    return { ok: false, delivery: "failed", error: message };
  }
}

export async function sendManageAccessEmail(params: {
  to: string;
  businessName: string;
  manageUrl: string;
}) {
  const from = process.env.LISTING_EMAIL_FROM ?? "Submit Your Store <onboarding@resend.dev>";
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1274c0">Listing access granted</h2>
      <p>You verified <strong>${params.businessName}</strong>. Use the link below to edit your listing:</p>
      <p><a href="${params.manageUrl}" style="color:#1274c0">${params.manageUrl}</a></p>
      <p style="color:#717171;font-size:14px">This link expires in 7 days.</p>
    </div>
  `;

  const keyResult = resolveResendKey();
  if (!keyResult.ok) {
    if (keyResult.delivery === "dev") {
      console.info(`[dev] Manage access email to ${params.to}: ${params.manageUrl}`);
      return { ok: true };
    }
    return { ok: false, error: keyResult.error };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${keyResult.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: `Manage ${params.businessName} on Submit Your Store`,
      html,
    }),
  });
  return { ok: res.ok };
}
