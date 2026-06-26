import { OUTREACH_REPLY_TO_EMAIL, OUTREACH_SENDER_EMAIL } from "@/lib/site-config";

const BREVO_API = "https://api.brevo.com/v3/smtp/email";

export type BrevoSendResult = {
  ok: boolean;
  messageId?: string;
  error?: string;
};

export type BrevoSenderInfo = {
  email: string;
  name: string;
  replyTo: string;
  apiConfigured: boolean;
};

export function getBrevoSenderInfo(): BrevoSenderInfo {
  const email =
    process.env.BREVO_SENDER_EMAIL?.trim() ||
    process.env.OUTREACH_SENDER_EMAIL?.trim() ||
    OUTREACH_SENDER_EMAIL;
  const name = process.env.BREVO_SENDER_NAME?.trim() || "Submit Your Store";
  const replyTo =
    process.env.BREVO_REPLY_TO?.trim() ||
    process.env.OUTREACH_REPLY_TO?.trim() ||
    OUTREACH_REPLY_TO_EMAIL;

  return {
    email,
    name,
    replyTo,
    apiConfigured: Boolean(process.env.BREVO_API_KEY?.trim()),
  };
}

function resolveBrevoConfig():
  | { ok: true; apiKey: string; senderEmail: string; senderName: string; replyTo: string }
  | { ok: false; error: string } {
  const apiKey = process.env.BREVO_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error:
        "BREVO_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.",
    };
  }

  const sender = getBrevoSenderInfo();
  return {
    ok: true,
    apiKey,
    senderEmail: sender.email,
    senderName: sender.name,
    replyTo: sender.replyTo,
  };
}

export async function sendBrevoEmail(params: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  tags?: string[];
}): Promise<BrevoSendResult> {
  const config = resolveBrevoConfig();
  if (!config.ok) {
    return { ok: false, error: config.error };
  }

  if (process.env.NODE_ENV !== "production" && !process.env.BREVO_API_KEY?.trim()) {
    console.info(`[dev] Brevo email to ${params.to}: ${params.subject}`);
    return { ok: true, messageId: "dev" };
  }

  try {
    const res = await fetch(BREVO_API, {
      method: "POST",
      headers: {
        "api-key": config.apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: config.senderName, email: config.senderEmail },
        to: [{ email: params.to.trim() }],
        replyTo: { email: (params.replyTo ?? config.replyTo).trim() },
        subject: params.subject,
        htmlContent: params.html,
        tags: params.tags?.length ? params.tags : ["outreach"],
      }),
    });

    if (!res.ok) {
      let detail = "Brevo rejected the email request.";
      try {
        const body = (await res.json()) as { message?: string; code?: string };
        if (body.message) detail = body.message;
      } catch {
        detail = await res.text();
      }
      return { ok: false, error: detail };
    }

    const data = (await res.json()) as { messageId?: string };
    return { ok: true, messageId: data.messageId };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Brevo send failed." };
  }
}

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}
