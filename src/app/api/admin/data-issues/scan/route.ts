import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminSession } from "@/lib/admin-auth.server";
import { scanWebsitesForBusinesses } from "@/lib/admin-data-issues.server";
import { readBusinesses } from "@/lib/businesses-data";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export const maxDuration = 120;

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    const limit = Math.max(1, Math.min(50, body.limit ?? 20));

    const businesses = await readBusinesses();
    const active = businesses.filter((b) => b.status !== "hidden" && b.website?.trim());
    const scanResults = await scanWebsitesForBusinesses(active, limit);

    const supabase = createSupabaseAdmin();
    const checkedAt = new Date().toISOString();

    for (const result of scanResults) {
      const { data } = await supabase
        .from("businesses")
        .select("metadata")
        .eq("id", result.businessId)
        .maybeSingle();

      const metadata = {
        ...((data?.metadata as Record<string, unknown> | null) ?? {}),
        website_check: {
          status: result.status,
          error: result.error ?? null,
          checked_at: checkedAt,
        },
      };

      await supabase.from("businesses").update({ metadata }).eq("id", result.businessId);
    }

    revalidateTag("businesses");

    const problemCount = scanResults.filter(
      (r) => r.status === 404 || r.status == null || (r.status != null && r.status >= 400),
    ).length;

    return NextResponse.json({
      success: true,
      scanned: scanResults.length,
      problemCount,
      results: scanResults,
    });
  } catch (err) {
    console.error("Website scan failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Website scan failed." },
      { status: 500 },
    );
  }
}
