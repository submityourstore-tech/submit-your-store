import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { summarizeVerificationFields } from "@/lib/admin-field-verify.server";
import { readBusinesses } from "@/lib/businesses-data";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await readBusinesses();
  const active = businesses.filter((b) => b.status !== "hidden");
  const fields = summarizeVerificationFields(active);

  const totalVerified = fields.reduce((sum, f) => sum + f.verifiedCount, 0);
  const totalUnverified = fields.reduce((sum, f) => sum + f.unverifiedCount, 0);

  return NextResponse.json({
    totalBusinesses: active.length,
    totalVerified,
    totalUnverified,
    fields,
  });
}
