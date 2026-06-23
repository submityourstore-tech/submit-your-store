import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { previewOutreachEmail, previewOutreachWithTemplate, sendOutreachBatch } from "@/lib/outreach.server";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      action?: "send" | "preview";
      count?: number;
      businessIds?: string[];
      businessId?: string;
      subject?: string;
      htmlBody?: string;
      resend?: boolean;
    };

    if (body.action === "preview") {
      if (!body.businessId) {
        return NextResponse.json({ error: "businessId required for preview." }, { status: 400 });
      }
      const template =
        body.subject && body.htmlBody
          ? { subject: body.subject, htmlBody: body.htmlBody }
          : undefined;
      const preview = template
        ? await previewOutreachWithTemplate(body.businessId, template)
        : await previewOutreachEmail(body.businessId);
      if (!preview) {
        return NextResponse.json({ error: "Business not found." }, { status: 404 });
      }
      return NextResponse.json({ preview });
    }

    const count = body.count != null ? Math.max(1, Math.min(500, body.count)) : undefined;
    const result = await sendOutreachBatch({
      count,
      businessIds: body.businessIds,
      resend: body.resend === true,
    });

    return NextResponse.json({
      success: true,
      sent: result.sent,
      failed: result.failed,
      results: result.results,
    });
  } catch (err) {
    console.error("Outreach send failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Outreach send failed." },
      { status: 500 },
    );
  }
}
