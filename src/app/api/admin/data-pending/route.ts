import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { readBusinesses } from "@/lib/businesses-data";
import { summarizePendingFields } from "@/lib/admin-pending-fields";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await readBusinesses();
  const active = businesses.filter((b) => b.status !== "hidden");
  const fields = summarizePendingFields(active);

  return NextResponse.json({
    totalBusinesses: active.length,
    fields,
  });
}
