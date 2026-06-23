import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { defaultOutreachTemplate, OUTREACH_TEMPLATE_VARIABLES } from "@/lib/outreach-templates";
import { loadOutreachTemplate, saveOutreachTemplate } from "@/lib/outreach.server";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = await loadOutreachTemplate();
  return NextResponse.json({
    template,
    variables: OUTREACH_TEMPLATE_VARIABLES,
    defaults: defaultOutreachTemplate(),
  });
}

export async function PUT(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { subject?: string; htmlBody?: string };
    if (!body.subject?.trim() || !body.htmlBody?.trim()) {
      return NextResponse.json({ error: "Subject and HTML body are required." }, { status: 400 });
    }

    await saveOutreachTemplate({
      subject: body.subject.trim(),
      htmlBody: body.htmlBody.trim(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save template." },
      { status: 500 },
    );
  }
}
