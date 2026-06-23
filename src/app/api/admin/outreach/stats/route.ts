import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import { OUTREACH_QUEUE_LIMIT } from "@/lib/outreach-ranking.server";
import { getOutreachStats, listOutreachCandidates, listOutreachLogs } from "@/lib/outreach.server";
import { getSiteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [stats, candidates, logs] = await Promise.all([
    getOutreachStats(),
    listOutreachCandidates({ skipContacted: true, limit: OUTREACH_QUEUE_LIMIT }),
    listOutreachLogs(100),
  ]);

  return NextResponse.json({
    stats,
    webhookUrl: `${getSiteUrl()}/api/webhooks/brevo`,
    candidates: candidates.map((b) => ({
      id: b.id,
      name: b.name,
      email: b.email,
      city: b.city,
      state: b.state,
      voteScore: b.voteScore,
      marketRank: b.marketRank,
      marketTotal: b.marketTotal,
      competitorsAbove: b.competitorsAbove,
      claimUrl: `/claim/${b.id}`,
      businessUrl: `/business/${b.id}`,
    })),
    logs,
  });
}
