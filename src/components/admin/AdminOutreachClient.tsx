"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { OUTREACH_WHATSAPP_DISPLAY } from "@/lib/site-config";

type TrackingStats = {
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

type OutreachStats = {
  brevoConfigured: boolean;
  unclaimedTotal: number;
  unclaimedWithEmail: number;
  alreadyContacted: number;
  readyToSend: number;
  queueSize: number;
  tracking: TrackingStats;
};

type Candidate = {
  id: string;
  name: string;
  email: string | null;
  city: string;
  state: string;
  voteScore: number;
  marketRank: number;
  marketTotal: number;
  competitorsAbove: { name: string; rank: number; score: number }[];
  claimUrl: string;
  businessUrl: string;
};

type LogRow = {
  id: string;
  business_name: string;
  business_email: string;
  status: string;
  delivery_status: string;
  error_message: string | null;
  sent_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  bounced_at: string | null;
  delivered_at: string | null;
  open_count: number;
  click_count: number;
  last_event: string | null;
};

type SendResult = {
  businessId: string;
  businessName: string;
  email: string;
  ok: boolean;
  error?: string;
};

function EmailInboxPreview({ subject, html }: { subject: string; html: string }) {
  return (
    <div className="overflow-hidden rounded-lg border border-[#d1d5db] bg-[#f3f4f6] shadow-inner">
      <div className="border-b border-[#d1d5db] bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-xs text-[#717171]">
          <span className="rounded bg-[#1274c0] px-2 py-0.5 font-semibold text-white">Inbox</span>
          <span>How recipient sees your email</span>
        </div>
        <p className="mt-2 text-sm font-bold text-[#111]">{subject || "(No subject)"}</p>
        <p className="mt-0.5 text-xs text-[#717171]">
          From: Submit Your Store · To: business@company.com
        </p>
      </div>
      <div className="max-h-[520px] overflow-y-auto bg-white p-4">
        {html ? (
          <div className="mx-auto max-w-[600px]" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-sm text-[#717171]">Start typing the template to see live preview…</p>
        )}
      </div>
    </div>
  );
}

export function AdminOutreachClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<OutreachStats | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [webhookUrl, setWebhookUrl] = useState("");

  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [variables, setVariables] = useState<string[]>([]);
  const [savingTemplate, setSavingTemplate] = useState(false);

  const [sendCount, setSendCount] = useState(50);
  const [resend, setResend] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

  const [previewSubject, setPreviewSubject] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  const previewBusinessId = useMemo(() => candidates[0]?.id ?? "", [candidates]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, tplRes] = await Promise.all([
        fetch("/api/admin/outreach/stats"),
        fetch("/api/admin/outreach/template"),
      ]);
      const statsData = (await statsRes.json()) as {
        error?: string;
        stats?: OutreachStats;
        candidates?: Candidate[];
        logs?: LogRow[];
        webhookUrl?: string;
      };
      const tplData = (await tplRes.json()) as {
        template?: { subject: string; htmlBody: string };
        variables?: string[];
      };

      if (!statsRes.ok) {
        setError(statsData.error ?? "Failed to load outreach stats.");
        return;
      }
      setStats(statsData.stats ?? null);
      setCandidates(statsData.candidates ?? []);
      setLogs(statsData.logs ?? []);
      setWebhookUrl(statsData.webhookUrl ?? "");

      if (tplRes.ok && tplData.template) {
        setSubject(tplData.template.subject);
        setHtmlBody(tplData.template.htmlBody);
        setVariables(tplData.variables ?? []);
      }
    } catch {
      setError("Network error loading outreach dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refreshPreview = useCallback(async () => {
    if (!previewBusinessId || !subject.trim() || !htmlBody.trim()) {
      setPreviewSubject(subject);
      setPreviewHtml("");
      return;
    }
    setPreviewLoading(true);
    try {
      const res = await fetch("/api/admin/outreach/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: previewBusinessId,
          subject,
          htmlBody,
        }),
      });
      const data = (await res.json()) as {
        preview?: { subject: string; html: string };
      };
      if (res.ok && data.preview) {
        setPreviewSubject(data.preview.subject);
        setPreviewHtml(data.preview.html);
      }
    } finally {
      setPreviewLoading(false);
    }
  }, [previewBusinessId, subject, htmlBody]);

  useEffect(() => {
    const t = setTimeout(() => void refreshPreview(), 500);
    return () => clearTimeout(t);
  }, [refreshPreview]);

  async function saveTemplate() {
    setSavingTemplate(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/admin/outreach/template", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, htmlBody }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not save template.");
        return;
      }
      setSuccess("Email template saved.");
      void refreshPreview();
    } catch {
      setError("Network error saving template.");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function resetTemplate() {
    const res = await fetch("/api/admin/outreach/template");
    const data = (await res.json()) as { defaults?: { subject: string; htmlBody: string } };
    if (data.defaults) {
      setSubject(data.defaults.subject);
      setHtmlBody(data.defaults.htmlBody);
    }
  }

  async function sendBatch() {
    setSending(true);
    setError("");
    setSuccess("");
    setSendResults([]);
    try {
      const res = await fetch("/api/admin/outreach/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", count: sendCount, resend }),
      });
      const data = (await res.json()) as {
        error?: string;
        sent?: number;
        failed?: number;
        results?: SendResult[];
      };
      if (!res.ok) {
        setError(data.error ?? "Send failed.");
        return;
      }
      setSendResults(data.results ?? []);
      setSuccess(`Sent ${data.sent ?? 0} email(s), ${data.failed ?? 0} failed.`);
      await load();
    } catch {
      setError("Network error during send.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-[#717171]">Loading outreach dashboard…</p>;
  }

  const tracking = stats?.tracking;

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {success && (
        <p className="rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{success}</p>
      )}

      {!stats?.brevoConfigured && (
        <div className="rounded border border-[#f59e0b] bg-[#fffbeb] px-4 py-3 text-sm text-[#b45309]">
          <strong>BREVO_API_KEY</strong> is not set. Add it in Vercel environment variables.
        </div>
      )}

      {tracking && (
        <section className="rounded border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#111]">Email tracking dashboard</h2>
          <p className="mt-1 text-sm text-[#717171]">
            Opens, clicks, and bounces update via Brevo webhook. Configure in Brevo → Settings → Webhooks.
          </p>
          {webhookUrl && (
            <p className="mt-2 break-all rounded bg-[#fafafa] px-3 py-2 font-mono text-xs text-[#555]">
              Webhook URL: {webhookUrl}
            </p>
          )}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Sent" value={tracking.sent} />
            <StatCard label="Delivered" value={tracking.delivered} />
            <StatCard label="Opened" value={tracking.opened} sub={`${tracking.openRate}%`} accent />
            <StatCard label="Clicked" value={tracking.clicked} sub={`${tracking.clickRate}%`} accent />
            <StatCard label="Bounced" value={tracking.bounced} sub={`${tracking.bounceRate}%`} warn />
            <StatCard label="Failed" value={tracking.failed} warn />
          </div>
        </section>
      )}

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Unclaimed listings" value={stats.unclaimedTotal} />
          <StatCard label="Queue (low rank)" value={stats.queueSize} accent />
          <StatCard label="Ready to send" value={stats.readyToSend} accent />
          <StatCard label="Already contacted" value={stats.alreadyContacted} />
        </div>
      )}

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">Send outreach (top 50 low-rank unclaimed)</h2>
        <p className="mt-1 text-sm text-[#717171]">
          Priority: 🟡 unclaimed listings with <strong>low vote ranking</strong> and verified competitors
          ranked above them. WhatsApp: {OUTREACH_WHATSAPP_DISPLAY}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <label className="text-sm">
            <span className="font-medium text-[#333]">How many to send</span>
            <input
              type="number"
              min={1}
              max={500}
              value={sendCount}
              onChange={(e) => setSendCount(Number(e.target.value) || 1)}
              className="mt-1 block w-28 rounded border px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-[#555]">
            <input type="checkbox" checked={resend} onChange={(e) => setResend(e.target.checked)} />
            Include already contacted
          </label>
          <button
            type="button"
            disabled={sending || (!stats?.readyToSend && !resend)}
            onClick={() => void sendBatch()}
            className="jd-btn-primary rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {sending ? "Sending…" : `Send to ${sendCount} businesses`}
          </button>
        </div>
        {sendResults.length > 0 && (
          <ul className="mt-4 max-h-48 space-y-1 overflow-y-auto text-sm">
            {sendResults.map((r) => (
              <li key={r.businessId} className={r.ok ? "text-[#25a244]" : "text-red-600"}>
                {r.ok ? "✓" : "✗"} {r.businessName} ({r.email})
                {r.error && <span className="text-xs"> — {r.error}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#111]">Email template + live preview</h2>
            <p className="mt-1 text-sm text-[#717171]">
              Edit on the left — see exactly how the recipient receives it on the right.
              {previewBusinessId && candidates[0] && (
                <span> Preview sample: <strong>{candidates[0].name}</strong></span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void resetTemplate()}
              className="rounded border px-3 py-1.5 text-sm text-[#555] hover:border-[#1274c0]"
            >
              Reset default
            </button>
            <button
              type="button"
              disabled={savingTemplate}
              onClick={() => void saveTemplate()}
              className="jd-btn-primary rounded px-4 py-1.5 text-sm font-semibold disabled:opacity-60"
            >
              {savingTemplate ? "Saving…" : "Save template"}
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <label className="block text-sm">
              <span className="font-medium text-[#333]">Subject</span>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 text-sm"
              />
            </label>
            <label className="mt-4 block text-sm">
              <span className="font-medium text-[#333]">HTML body</span>
              <textarea
                rows={18}
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                className="mt-1 w-full rounded border px-3 py-2 font-mono text-xs"
              />
            </label>
            <p className="mt-2 text-xs text-[#717171]">
              Placeholders:{" "}
              {variables.map((v) => (
                <code key={v} className="mr-1 rounded bg-[#f0f0f0] px-1">{`{{${v}}}`}</code>
              ))}
            </p>
          </div>
          <div>
            {previewLoading && (
              <p className="mb-2 text-xs text-[#717171]">Updating preview…</p>
            )}
            <EmailInboxPreview subject={previewSubject || subject} html={previewHtml} />
          </div>
        </div>
      </section>

      <section className="rounded border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-[#111]">
          Outreach queue — low rank unclaimed ({candidates.length})
        </h2>
        <p className="mt-1 text-sm text-[#717171]">
          Sorted by worst ranking first. Competitors above = verified businesses outranking them.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b text-xs uppercase text-[#717171]">
                <th className="py-2 pr-3">Business</th>
                <th className="py-2 pr-3">Rank</th>
                <th className="py-2 pr-3">Vote score</th>
                <th className="py-2 pr-3">Competitors above</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c.id} className="border-b border-[#eee] align-top">
                  <td className="py-2 pr-3 font-medium">
                    {c.name}
                    <span className="mt-0.5 block text-xs text-[#717171]">
                      {c.city}, {c.state}
                    </span>
                  </td>
                  <td className="py-2 pr-3 text-[#b45309] font-semibold">
                    #{c.marketRank}/{c.marketTotal}
                  </td>
                  <td className="py-2 pr-3">{c.voteScore}</td>
                  <td className="py-2 pr-3 text-xs text-[#555]">
                    {c.competitorsAbove.length ? (
                      c.competitorsAbove.map((x) => (
                        <span key={x.name} className="block">
                          #{x.rank} {x.name} ({x.score})
                        </span>
                      ))
                    ) : (
                      <span className="text-[#999]">—</span>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-[#555]">{c.email}</td>
                  <td className="py-2">
                    <Link href={c.claimUrl} className="mr-2 text-[#1274c0] hover:underline">
                      Claim
                    </Link>
                    <Link href={c.businessUrl} className="text-[#1274c0] hover:underline">
                      Listing
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {logs.length > 0 && (
        <section className="rounded border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-[#111]">All sends &amp; tracking events</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead>
                <tr className="border-b text-xs uppercase text-[#717171]">
                  <th className="py-2 pr-3">Business</th>
                  <th className="py-2 pr-3">Email</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Delivery</th>
                  <th className="py-2 pr-3">Opens</th>
                  <th className="py-2 pr-3">Clicks</th>
                  <th className="py-2 pr-3">Bounced</th>
                  <th className="py-2">Sent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[#eee]">
                    <td className="py-2 pr-3 font-medium">{log.business_name}</td>
                    <td className="py-2 pr-3 text-[#555]">{log.business_email}</td>
                    <td className="py-2 pr-3">
                      <StatusPill value={log.status} />
                    </td>
                    <td className="py-2 pr-3">
                      <StatusPill value={log.delivery_status} />
                      {log.last_event && (
                        <span className="mt-0.5 block text-xs text-[#999]">{log.last_event}</span>
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {log.open_count > 0 ? (
                        <span className="text-[#25a244]">{log.open_count}×</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {log.click_count > 0 ? (
                        <span className="text-[#1274c0]">{log.click_count}×</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 pr-3">
                      {log.bounced_at ? (
                        <span className="text-red-600">Yes</span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 text-xs text-[#717171]">
                      {new Date(log.sent_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
  warn,
}: {
  label: string;
  value: number;
  sub?: string;
  accent?: boolean;
  warn?: boolean;
}) {
  const color = warn ? "text-red-600" : accent ? "text-[#b45309]" : "text-[#111]";
  return (
    <div className="rounded border bg-[#fafafa] p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>
        {value}
        {sub && <span className="ml-1 text-sm font-medium">{sub}</span>}
      </p>
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    sent: "bg-[#f0f7fd] text-[#1274c0]",
    delivered: "bg-[#f0fdf4] text-[#166534]",
    opened: "bg-[#f0fdf4] text-[#166534]",
    clicked: "bg-[#eef4fb] text-[#0d5a94]",
    bounced: "bg-red-50 text-red-700",
    failed: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-xs font-semibold ${styles[value] ?? "bg-[#f3f4f6] text-[#555]"}`}
    >
      {value}
    </span>
  );
}
