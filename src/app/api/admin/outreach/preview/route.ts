import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { previewOutreachWithTemplate } from "@/lib/outreach.server";

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      businessId?: string;
      subject?: string;
      htmlBody?: string;
    };

    if (!body.businessId?.trim() || !body.subject?.trim() || !body.htmlBody?.trim()) {
      return NextResponse.json(
        { error: "businessId, subject, and htmlBody are required." },
        { status: 400 },
      );
    }

    const preview = await previewOutreachWithTemplate(body.businessId.trim(), {
      subject: body.subject.trim(),
      htmlBody: body.htmlBody.trim(),
    });

    if (!preview) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }

    return NextResponse.json({ preview });
  } catch (err) {
    console.error("Outreach preview failed:", err);
    return NextResponse.json({ error: "Preview failed." }, { status: 500 });
  }
}
