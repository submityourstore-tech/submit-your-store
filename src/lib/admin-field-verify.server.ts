import type { AdminPendingFieldId } from "@/lib/admin-pending-fields";
import { ADMIN_PENDING_FIELDS } from "@/lib/admin-pending-fields";
import type { Business } from "@/types/business";

export type VerificationBusinessRow = {
  id: string;
  name: string;
  gbpUrl: string | null;
  city: string;
  state: string;
  hasData: boolean;
  verifiedAt: string | null;
};

export type VerificationFieldSummary = {
  id: AdminPendingFieldId;
  label: string;
  description: string;
  csvHeader: string;
  verifiedCount: number;
  unverifiedCount: number;
  pendingDataCount: number;
  unverifiedBusinesses: VerificationBusinessRow[];
};

function isVerifiedForField(business: Business, fieldId: AdminPendingFieldId): boolean {
  return Boolean(business.fieldVerification?.[fieldId]?.verifiedAt);
}

export function summarizeVerificationFields(businesses: Business[]): VerificationFieldSummary[] {
  return ADMIN_PENDING_FIELDS.map((field) => {
    const active = businesses.filter((b) => b.status !== "hidden");
    const unverified = active.filter((b) => !isVerifiedForField(b, field.id));
    const verifiedCount = active.length - unverified.length;
    const pendingData = unverified.filter((b) => field.isPending(b));

    return {
      id: field.id,
      label: field.label.replace(" pending", "").replace(" missing", ""),
      description: field.description,
      csvHeader: field.csvHeader,
      verifiedCount,
      unverifiedCount: unverified.length,
      pendingDataCount: pendingData.length,
      unverifiedBusinesses: unverified.map((b) => ({
        id: b.id,
        name: b.name,
        gbpUrl: b.googleMapsUrl,
        city: b.city,
        state: b.state,
        hasData: !field.isPending(b),
        verifiedAt: b.fieldVerification?.[field.id]?.verifiedAt ?? null,
      })),
    };
  });
}

export function buildVerificationBatchCopy(
  fieldId: AdminPendingFieldId,
  businesses: Business[],
  batchSize: number,
): { header: string; lines: string[]; count: number } {
  const field = ADMIN_PENDING_FIELDS.find((f) => f.id === fieldId);
  if (!field) return { header: "", lines: [], count: 0 };

  const active = businesses.filter((b) => b.status !== "hidden");
  const unverified = active.filter((b) => !isVerifiedForField(b, fieldId));
  const batch = unverified.slice(0, Math.max(1, batchSize));

  if (field.id === "gbp_url") {
    return {
      header: field.copyHeader,
      lines: batch.map((b) => `${b.id}\t${b.name}`),
      count: batch.length,
    };
  }

  const withGbp = batch.filter((b) => b.googleMapsUrl?.trim());
  return {
    header: "gbp_url",
    lines: withGbp.map((b) => b.googleMapsUrl!.trim()),
    count: withGbp.length,
  };
}
