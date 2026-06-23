import {
  OUTREACH_WHATSAPP_DISPLAY,
  OUTREACH_WHATSAPP_LINK,
  SITE_NAME,
  getSiteUrl,
} from "@/lib/site-config";

export type OutreachTemplate = {
  subject: string;
  htmlBody: string;
};

export const OUTREACH_TEMPLATE_VARIABLES = [
  "businessName",
  "businessUrl",
  "claimUrl",
  "listingPreviewHtml",
  "competitorsHtml",
  "whatsappNumber",
  "whatsappLink",
  "siteName",
  "siteUrl",
  "marketRankHtml",
] as const;

export function defaultOutreachTemplate(): OutreachTemplate {
  return {
    subject: "{{businessName}} is unclaimed on {{siteName}} — claim your profile",
    htmlBody: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333;line-height:1.6">
  <p style="margin:0 0 16px">Hi,</p>
  <p style="margin:0 0 16px">We noticed that <strong>{{businessName}}</strong> is currently <span style="color:#b45309;font-weight:bold">unclaimed</span> on {{siteName}}.</p>

  {{marketRankHtml}}

  {{listingPreviewHtml}}

  <p style="margin:24px 0 12px;font-weight:bold">Competitors in your area</p>
  <p style="margin:0 0 12px;color:#555">Businesses like these have already verified their profiles and are receiving service inquiries and project leads directly through our platform:</p>
  {{competitorsHtml}}

  <p style="margin:20px 0 12px;color:#555">Since your profile is currently unverified, potential customers may have difficulty reaching you — which could mean missed opportunities and leads going to competitors.</p>

  <p style="margin:20px 0 8px;font-weight:bold">Once verified, you can:</p>
  <ul style="margin:0 0 20px;padding-left:20px;color:#555">
    <li>Receive direct customer inquiries</li>
    <li>Get leads for small &amp; large projects</li>
    <li>Showcase your services, pricing, and service areas</li>
    <li>Improve visibility against local competitors</li>
  </ul>

  <p style="margin:24px 0">
    <a href="{{claimUrl}}" style="background:#1274c0;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:bold;display:inline-block">Claim your business profile</a>
  </p>

  <p style="margin:24px 0 12px;color:#555">If you have any questions or want help with verification, message us on WhatsApp:</p>
  <p style="margin:0 0 24px">
    <a href="{{whatsappLink}}" style="background:#25a244;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;display:inline-block">WhatsApp: {{whatsappNumber}}</a>
  </p>

  <p style="margin:0;color:#555">Regards,<br><strong>{{siteName}} Team</strong></p>
</div>`,
  };
}

export function renderOutreachTemplate(
  template: OutreachTemplate,
  vars: Record<string, string>,
): { subject: string; html: string } {
  const allVars = {
    siteName: SITE_NAME,
    siteUrl: getSiteUrl(),
    whatsappNumber: OUTREACH_WHATSAPP_DISPLAY,
    whatsappLink: OUTREACH_WHATSAPP_LINK,
    ...vars,
  };

  let subject = template.subject;
  let html = template.htmlBody;
  for (const [key, value] of Object.entries(allVars)) {
    const token = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    subject = subject.replace(token, value);
    html = html.replace(token, value);
  }
  return { subject, html };
}

export function buildListingPreviewHtml(params: {
  businessName: string;
  businessUrl: string;
  logoUrl?: string;
  city: string;
  state: string;
  category: string;
}): string {
  const logoCell = params.logoUrl
    ? `<img src="${params.logoUrl}" alt="" width="56" height="56" style="border-radius:8px;object-fit:cover;display:block" />`
    : `<div style="width:56px;height:56px;border-radius:8px;background:#eef4fb;color:#1274c0;font-weight:bold;font-size:22px;line-height:56px;text-align:center">${params.businessName.charAt(0)}</div>`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:520px;border:1px solid #e0e0e0;border-radius:8px;background:#fafafa;margin:16px 0">
  <tr>
    <td style="padding:16px">
      <table role="presentation" cellpadding="0" cellspacing="0"><tr>
        <td style="padding-right:12px;vertical-align:top">${logoCell}</td>
        <td style="vertical-align:top">
          <p style="margin:0;font-size:18px;font-weight:bold;color:#111">${params.businessName}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#717171">${params.category} · ${params.city}, ${params.state}</p>
          <p style="margin:8px 0 0"><span style="display:inline-block;background:#fffbeb;border:1px solid #f59e0b;color:#b45309;font-size:11px;font-weight:bold;padding:2px 8px;border-radius:4px">Unclaimed</span></p>
          <p style="margin:10px 0 0"><a href="${params.businessUrl}" style="color:#1274c0;font-weight:bold;text-decoration:none">View listing →</a></p>
        </td>
      </tr></table>
    </td>
  </tr>
</table>`;
}

export function buildMarketRankHtml(params: {
  rank: number;
  total: number;
  voteScore: number;
  city: string;
  category: string;
}): string {
  return `<p style="margin:0 0 16px;padding:12px 14px;border-radius:8px;background:#fff7ed;border:1px solid #fed7aa;color:#9a3412;font-size:14px">
    <strong>Your visibility rank:</strong> #${params.rank} of ${params.total} ${params.category} businesses in ${params.city}
    (vote score ${params.voteScore}). Lower-ranked listings receive fewer leads than competitors above you.
  </p>`;
}

export function buildCompetitorsHtml(
  competitors: { name: string; url: string; city: string; rank?: number; score?: number }[],
): string {
  if (!competitors.length) {
    return `<p style="margin:0;color:#717171;font-size:14px">Verified businesses in your area are already receiving leads through ${SITE_NAME}.</p>`;
  }
  const items = competitors
    .map(
      (c) =>
        `<li style="margin-bottom:8px"><strong>#${c.rank ?? "—"}</strong> <a href="${c.url}" style="color:#1274c0;font-weight:bold;text-decoration:none">${c.name}</a> <span style="color:#717171">— verified in ${c.city}${c.score != null ? ` · score ${c.score}` : ""}</span></li>`,
    )
    .join("");
  return `<ul style="margin:0;padding-left:20px;color:#333">${items}</ul>`;
}
