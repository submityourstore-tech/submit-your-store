import { sendBrevoEmail } from "@/lib/brevo.server";
import { readBusinesses } from "@/lib/businesses-data";
import { isUnclaimedListing } from "@/lib/claim-status";
import {
  OUTREACH_QUEUE_LIMIT,
  getMarketRank,
  rankOutreachCandidates,
  type OutreachCandidateRanked,
} from "@/lib/outreach-ranking.server";
import { createSupabaseAdmin } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/site-config";
import {
  buildCompetitorsHtml,
  buildListingPreviewHtml,
  buildMarketRankHtml,
  defaultOutreachTemplate,
  renderOutreachTemplate,
  type OutreachTemplate,
} from "@/lib/outreach-templates";
import type { Business } from "@/types/business";

export type OutreachLogRow = {
  id: string;
  business_id: string;
  business_name: string;
  business_email: string;
  status: "sent" | "failed" | "skipped";
  error_message: string | null;
  sent_at: string;
  brevo_message_id: string | null;
  delivery_status: string;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  delivered_at: string | null;
  last_event: string | null;
  last_event_at: string | null;
  open_count: number;
  click_count: number;
};

export type OutreachTrackingStats = {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  failed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
};

export type OutreachStats = {
  brevoConfigured: boolean;
  totalActive: number;
  unclaimedTotal: number;
  unclaimedWithEmail: number;
  alreadyContacted: number;
  readyToSend: number;
  queueSize: number;
  sentTotal: number;
  failedTotal: number;
  tracking: OutreachTrackingStats;
};

function isOutreachTableMissing(error: { message?: string; code?: string }): boolean {
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("outreach_settings") ||
    msg.includes("outreach_logs") ||
    msg.includes("does not exist")
  );
}

export async function loadOutreachTemplate(): Promise<OutreachTemplate> {
  const fallback = defaultOutreachTemplate();
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("outreach_settings")
      .select("subject, html_body")
      .eq("id", "default")
      .maybeSingle();

    if (error) {
      if (isOutreachTableMissing(error)) return fallback;
      throw error;
    }

    if (!data?.subject || !data?.html_body) return fallback;
    return { subject: data.subject, htmlBody: data.html_body };
  } catch (err) {
    console.warn("loadOutreachTemplate fallback:", err);
    return fallback;
  }
}

export async function saveOutreachTemplate(template: OutreachTemplate): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { error } = await supabase.from("outreach_settings").upsert(
    {
      id: "default",
      subject: template.subject,
      html_body: template.htmlBody,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    if (isOutreachTableMissing(error)) {
      throw new Error(
        "Outreach tables not found. Run supabase/migrations/20250614210000_create_outreach_tables.sql in Supabase SQL Editor.",
      );
    }
    throw new Error(error.message);
  }
}

export async function listOutreachLogs(limit = 100): Promise<OutreachLogRow[]> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("outreach_logs")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(limit);

    if (error) {
      if (isOutreachTableMissing(error)) return [];
      throw error;
    }
    return (data ?? []) as OutreachLogRow[];
  } catch {
    return [];
  }
}

export function computeTrackingStats(logs: OutreachLogRow[]): OutreachTrackingStats {
  const sent = logs.filter((l) => l.status === "sent").length;
  const delivered = logs.filter((l) => l.delivered_at || l.delivery_status === "delivered").length;
  const opened = logs.filter((l) => l.opened_at || l.open_count > 0).length;
  const clicked = logs.filter((l) => l.clicked_at || l.click_count > 0).length;
  const bounced = logs.filter((l) => l.bounced_at || l.delivery_status === "bounced").length;
  const failed = logs.filter((l) => l.status === "failed").length;
  const base = sent || 1;
  return {
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    failed,
    openRate: Math.round((opened / base) * 100),
    clickRate: Math.round((clicked / base) * 100),
    bounceRate: Math.round((bounced / base) * 100),
  };
}

async function successfulContactIds(): Promise<Set<string>> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("outreach_logs")
      .select("business_id")
      .eq("status", "sent");

    if (error) {
      if (isOutreachTableMissing(error)) return new Set();
      throw error;
    }
    return new Set((data ?? []).map((r) => r.business_id as string));
  } catch {
    return new Set();
  }
}

export async function getOutreachStats(): Promise<OutreachStats> {
  const businesses = await readBusinesses();
  const active = businesses.filter((b) => b.status !== "hidden");
  const unclaimed = active.filter(isUnclaimedListing);
  const unclaimedWithEmail = unclaimed.filter((b) => b.email?.trim());
  const contacted = await successfulContactIds();
  const alreadyContacted = unclaimedWithEmail.filter((b) => contacted.has(b.id)).length;
  const queue = await rankOutreachCandidates(businesses, {
    skipContacted: true,
    contactedIds: contacted,
    limit: OUTREACH_QUEUE_LIMIT,
  });
  const logs = await listOutreachLogs(500);

  return {
    brevoConfigured: Boolean(process.env.BREVO_API_KEY?.trim()),
    totalActive: active.length,
    unclaimedTotal: unclaimed.length,
    unclaimedWithEmail: unclaimedWithEmail.length,
    alreadyContacted,
    readyToSend: unclaimedWithEmail.length - alreadyContacted,
    queueSize: queue.length,
    sentTotal: logs.filter((l) => l.status === "sent").length,
    failedTotal: logs.filter((l) => l.status === "failed").length,
    tracking: computeTrackingStats(logs),
  };
}

export async function listOutreachCandidates(options?: {
  skipContacted?: boolean;
  limit?: number;
}): Promise<OutreachCandidateRanked[]> {
  const businesses = await readBusinesses();
  const contacted =
    options?.skipContacted !== false ? await successfulContactIds() : new Set<string>();
  return rankOutreachCandidates(businesses, {
    skipContacted: options?.skipContacted,
    contactedIds: contacted,
    limit: options?.limit ?? OUTREACH_QUEUE_LIMIT,
  });
}

async function logOutreach(entry: {
  businessId: string;
  businessName: string;
  businessEmail: string;
  status: "sent" | "failed" | "skipped";
  errorMessage?: string;
  brevoMessageId?: string;
}): Promise<string | null> {
  try {
    const supabase = createSupabaseAdmin();
    const { data, error } = await supabase
      .from("outreach_logs")
      .insert({
        business_id: entry.businessId,
        business_name: entry.businessName,
        business_email: entry.businessEmail,
        status: entry.status,
        error_message: entry.errorMessage ?? null,
        brevo_message_id: entry.brevoMessageId ?? null,
        delivery_status: entry.status === "sent" ? "sent" : entry.status,
      })
      .select("id")
      .single();
    if (error) throw error;
    return data?.id as string | null;
  } catch (err) {
    console.warn("outreach log insert failed:", err);
    return null;
  }
}

export async function attachBrevoMessageId(logId: string, messageId: string): Promise<void> {
  try {
    const supabase = createSupabaseAdmin();
    await supabase
      .from("outreach_logs")
      .update({ brevo_message_id: messageId })
      .eq("id", logId);
  } catch (err) {
    console.warn("attachBrevoMessageId failed:", err);
  }
}

export async function recordBrevoWebhookEvent(payload: {
  messageId: string;
  event: string;
  email?: string;
  date?: string;
}): Promise<boolean> {
  const supabase = createSupabaseAdmin();
  const normalizedId = payload.messageId.replace(/^<|>$/g, "");
  const eventAt = payload.date ?? new Date().toISOString();

  const { data: rows, error } = await supabase
    .from("outreach_logs")
    .select("*")
    .or(`brevo_message_id.eq.${normalizedId},brevo_message_id.eq.${payload.messageId}`)
    .limit(1);

  if (error || !rows?.length) return false;
  const row = rows[0] as OutreachLogRow;

  const patch: Record<string, unknown> = {
    last_event: payload.event,
    last_event_at: eventAt,
  };

  switch (payload.event) {
    case "delivered":
      patch.delivery_status = "delivered";
      patch.delivered_at = eventAt;
      break;
    case "opened":
    case "unique_opened":
      patch.delivery_status = "opened";
      patch.opened_at = row.opened_at ?? eventAt;
      patch.open_count = (row.open_count ?? 0) + 1;
      break;
    case "click":
    case "unique_click":
      patch.delivery_status = "clicked";
      patch.clicked_at = row.clicked_at ?? eventAt;
      patch.click_count = (row.click_count ?? 0) + 1;
      break;
    case "hard_bounce":
    case "soft_bounce":
    case "blocked":
    case "invalid_email":
      patch.delivery_status = "bounced";
      patch.bounced_at = eventAt;
      patch.error_message = payload.event;
      break;
    default:
      break;
  }

  await supabase.from("outreach_logs").update(patch).eq("id", row.id);
  return true;
}

export async function buildOutreachEmailForBusiness(
  business: Business,
  allBusinesses: Business[],
  template?: OutreachTemplate,
): Promise<{ subject: string; html: string; to: string } | null> {
  const email = business.email?.trim();
  if (!email) return null;

  const tpl = template ?? defaultOutreachTemplate();
  const siteUrl = getSiteUrl();
  const businessUrl = `${siteUrl}/business/${business.id}`;
  const claimUrl = `${siteUrl}/claim/${business.id}`;
  const market = await getMarketRank(business, allBusinesses);

  const rendered = renderOutreachTemplate(tpl, {
    businessName: business.name,
    businessUrl,
    claimUrl,
    marketRankHtml: buildMarketRankHtml({
      rank: market.rank,
      total: market.total,
      voteScore: market.voteScore,
      city: business.city,
      category: business.category,
    }),
    listingPreviewHtml: buildListingPreviewHtml({
      businessName: business.name,
      businessUrl,
      logoUrl: business.logo,
      city: business.city,
      state: business.state,
      category: business.category,
    }),
    competitorsHtml: buildCompetitorsHtml(
      market.competitorsAbove.map((c) => {
        const peer = allBusinesses.find((b) => b.id === c.id);
        return {
          name: c.name,
          url: `${siteUrl}/business/${c.id}`,
          city: peer?.city ?? business.city,
          rank: c.rank,
          score: c.score,
        };
      }),
    ),
  });

  return { subject: rendered.subject, html: rendered.html, to: email };
}

/** @deprecated alias */
export const buildOutreachEmail = buildOutreachEmailForBusiness;

export async function previewOutreachWithTemplate(
  businessId: string,
  template: OutreachTemplate,
): Promise<{ subject: string; html: string; to: string } | null> {
  const businesses = await readBusinesses();
  const business = businesses.find((b) => b.id === businessId);
  if (!business) return null;
  return buildOutreachEmailForBusiness(business, businesses, template);
}

export type SendOutreachResult = {
  businessId: string;
  businessName: string;
  email: string;
  ok: boolean;
  error?: string;
};

export async function sendOutreachBatch(options: {
  count?: number;
  businessIds?: string[];
  resend?: boolean;
}): Promise<{ results: SendOutreachResult[]; sent: number; failed: number }> {
  const allBusinesses = await readBusinesses();
  const template = await loadOutreachTemplate();

  let targets: Business[];
  if (options.businessIds?.length) {
    targets = allBusinesses.filter((b) => options.businessIds!.includes(b.id));
  } else {
    targets = await listOutreachCandidates({
      skipContacted: !options.resend,
      limit: options.count,
    });
  }

  const results: SendOutreachResult[] = [];

  for (const business of targets) {
    const email = business.email?.trim();
    if (!email) {
      results.push({
        businessId: business.id,
        businessName: business.name,
        email: "",
        ok: false,
        error: "No business email on listing.",
      });
      await logOutreach({
        businessId: business.id,
        businessName: business.name,
        businessEmail: "",
        status: "skipped",
        errorMessage: "No business email",
      });
      continue;
    }

    if (!isUnclaimedListing(business)) {
      results.push({
        businessId: business.id,
        businessName: business.name,
        email,
        ok: false,
        error: "Listing is already claimed.",
      });
      continue;
    }

    const built = await buildOutreachEmailForBusiness(business, allBusinesses, template);
    if (!built) {
      results.push({
        businessId: business.id,
        businessName: business.name,
        email,
        ok: false,
        error: "Could not build email.",
      });
      continue;
    }

    const logId = await logOutreach({
      businessId: business.id,
      businessName: business.name,
      businessEmail: email,
      status: "sent",
    });

    const sent = await sendBrevoEmail({
      to: built.to,
      subject: built.subject,
      html: built.html,
      tags: [`outreach:${business.id}`, logId ? `log:${logId}` : "outreach"].filter(Boolean),
    });

    if (sent.ok) {
      if (logId && sent.messageId) {
        await attachBrevoMessageId(logId, sent.messageId);
      }
      results.push({
        businessId: business.id,
        businessName: business.name,
        email,
        ok: true,
      });
    } else {
      if (logId) {
        const supabase = createSupabaseAdmin();
        await supabase
          .from("outreach_logs")
          .update({ status: "failed", delivery_status: "failed", error_message: sent.error })
          .eq("id", logId);
      } else {
        await logOutreach({
          businessId: business.id,
          businessName: business.name,
          businessEmail: email,
          status: "failed",
          errorMessage: sent.error,
        });
      }
      results.push({
        businessId: business.id,
        businessName: business.name,
        email,
        ok: false,
        error: sent.error,
      });
    }
  }

  return {
    results,
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
  };
}

export async function previewOutreachEmail(businessId: string): Promise<{
  subject: string;
  html: string;
  to: string;
} | null> {
  const businesses = await readBusinesses();
  const business = businesses.find((b) => b.id === businessId);
  if (!business) return null;
  const template = await loadOutreachTemplate();
  return buildOutreachEmailForBusiness(business, businesses, template);
}
