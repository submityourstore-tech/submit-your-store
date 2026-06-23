import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { applyOutreachMigrations, checkOutreachTablesReady } from "@/lib/outreach-db.server";

export const dynamic = "force-dynamic";

export async function POST() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await checkOutreachTablesReady()) {
    return NextResponse.json({ ready: true, message: "Outreach tables already exist." });
  }

  const result = await applyOutreachMigrations();
  if (!result.ok) {
    return NextResponse.json({ ready: false, error: result.error }, { status: 500 });
  }

  const ready = await checkOutreachTablesReady();
  if (!ready) {
    return NextResponse.json(
      { ready: false, error: "Migration ran but tables are still not accessible." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ready: true, message: "Outreach tables created successfully." });
}
