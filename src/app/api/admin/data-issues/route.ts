import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { scanAllBusinessIssues } from "@/lib/admin-data-issues.server";
import { readBusinesses } from "@/lib/businesses-data";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const businesses = await readBusinesses();
  const active = businesses.filter((b) => b.status !== "hidden");
  const issueRows = scanAllBusinessIssues(active);

  const byType: Record<string, number> = {};
  for (const row of issueRows) {
    for (const issue of row.issues) {
      byType[issue.type] = (byType[issue.type] ?? 0) + 1;
    }
  }

  return NextResponse.json({
    totalBusinesses: active.length,
    businessesWithIssues: issueRows.length,
    issueCount: issueRows.reduce((sum, r) => sum + r.issueCount, 0),
    byType,
    rows: issueRows,
  });
}
