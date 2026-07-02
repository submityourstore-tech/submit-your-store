import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/admin-auth.server";
import {
  applySecurityRlsFix,
  checkSiteUsersRlsEnabled,
  getSecurityRlsSql,
} from "@/lib/security-db.server";
import { resolveSupabaseDbUrl } from "@/lib/outreach-db.server";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rlsEnabled = await checkSiteUsersRlsEnabled();
  return NextResponse.json({
    rlsEnabled,
    canAutoFix: Boolean(resolveSupabaseDbUrl()),
    sql: getSecurityRlsSql(),
  });
}

export async function POST() {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (await checkSiteUsersRlsEnabled()) {
    return NextResponse.json({
      ok: true,
      rlsEnabled: true,
      message: "RLS is already enabled on site_users.",
    });
  }

  const result = await applySecurityRlsFix();
  if (!result.ok) {
    return NextResponse.json(
      { ok: false, rlsEnabled: false, error: result.error, sql: getSecurityRlsSql() },
      { status: 500 },
    );
  }

  const rlsEnabled = await checkSiteUsersRlsEnabled();
  return NextResponse.json({
    ok: rlsEnabled,
    rlsEnabled,
    message: rlsEnabled
      ? "Security fix applied — RLS enabled on site_users."
      : "Migration ran but RLS status could not be verified.",
  });
}
