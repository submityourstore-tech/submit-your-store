const RESEND_API = "https://api.resend.com/emails";

type SendVerificationEmailParams = {
  to: string;
  code: string;
  businessName: string;
  purpose: "new" | "claim";
};

export type EmailDeliveryResult = {
  ok: boolean;
  delivery: "email" | "dev" | "failed";
  devCode?: string;
  error?: string;
};

export async function sendVerificationEmail({
  to,
  code,
  businessName,
  purpose,
}: SendVerificationEmailParams): Promise<EmailDeliveryResult> {
  const from = process.env.LISTING_EMAIL_FROM ?? "Submit Your Store <onboarding@resend.dev>";
  const subject =
    purpose === "claim"
      ? `Verify ownership of ${businessName} on Submit Your Store`
      : `Verify your business listing on Submit Your Store`;

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#1274c0">Submit Your Store</h2>
      <p>Your verification code for <strong>${businessName}</strong>:</p>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#111">${code}</p>
      <p style="color:#717171;font-size:14px">This code expires in 15 minutes. We only send verification to your business email address.</p>
      ${
        purpose === "claim"
          ? "<p style='font-size:14px'>After verification you can edit and manage your existing listing.</p>"
          : "<p style='font-size:14px'>After verification your listing request will be submitted for review.</p>"
      }
    </div>
  `;

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(`[dev] Verification email to ${to}: code ${code}`);
    return { ok: true, delivery: "dev", devCode: code };
  }

  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      return { ok: false, delivery: "failed", error: detail };
    }

    return { ok: true, delivery: "email" };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed.";
    console.error("Email send error", message);
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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.info(`[dev] Manage access email to ${params.to}: ${params.manageUrl}`);
    return { ok: true };
  }

  const res = await fetch(RESEND_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
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
