import { NextResponse } from "next/server";
import { recordBrevoWebhookEvent } from "@/lib/outreach.server";

type BrevoWebhookPayload = {
  event?: string;
  email?: string;
  date?: string;
  "message-id"?: string;
  messageId?: string;
};

export async function POST(request: Request) {
  try {
    const secret = process.env.BREVO_WEBHOOK_SECRET?.trim();
    if (secret) {
      const auth = request.headers.get("authorization");
      const token = request.headers.get("x-brevo-token");
      if (auth !== `Bearer ${secret}` && token !== secret) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const raw = (await request.json()) as BrevoWebhookPayload | BrevoWebhookPayload[];
    const events = Array.isArray(raw) ? raw : [raw];
    let handled = 0;

    for (const event of events) {
      const messageId = event["message-id"] ?? event.messageId;
      const eventName = event.event;
      if (!messageId || !eventName) continue;

      const ok = await recordBrevoWebhookEvent({
        messageId,
        event: eventName,
        email: event.email,
        date: event.date,
      });
      if (ok) handled += 1;
    }

    return NextResponse.json({ ok: true, handled });
  } catch (err) {
    console.error("Brevo webhook failed:", err);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
