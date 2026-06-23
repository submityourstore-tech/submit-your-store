import { revalidateTag } from "next/cache";
import type { AdminPendingFieldId } from "@/lib/admin-pending-fields";
import { createSupabaseAdmin } from "@/lib/supabase-admin";

export type FieldVerificationEntry = {
  verifiedAt: string;
  source?: "bulk_upload" | "admin" | "publish";
};

export type FieldVerificationMap = Partial<Record<AdminPendingFieldId, FieldVerificationEntry>>;

const FIELD_VERIFICATION_KEY = "field_verification";

export function fieldVerificationFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): FieldVerificationMap {
  const raw = metadata?.[FIELD_VERIFICATION_KEY];
  if (!raw || typeof raw !== "object") return {};

  const result: FieldVerificationMap = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== "object") continue;
    const entry = value as Record<string, unknown>;
    const verifiedAt =
      typeof entry.verified_at === "string"
        ? entry.verified_at
        : typeof entry.verifiedAt === "string"
          ? entry.verifiedAt
          : null;
    if (!verifiedAt) continue;
    const source = entry.source;
    result[key as AdminPendingFieldId] = {
      verifiedAt,
      source:
        source === "bulk_upload" || source === "admin" || source === "publish"
          ? source
          : undefined,
    };
  }
  return result;
}

export function isFieldVerified(
  metadata: Record<string, unknown> | null | undefined,
  fieldId: AdminPendingFieldId,
): boolean {
  return Boolean(fieldVerificationFromMetadata(metadata)[fieldId]?.verifiedAt);
}

export function metadataWithFieldVerified(
  existing: Record<string, unknown> | null | undefined,
  fieldId: AdminPendingFieldId,
  source: FieldVerificationEntry["source"] = "bulk_upload",
): Record<string, unknown> {
  const meta = { ...(existing ?? {}) };
  const current = fieldVerificationFromMetadata(meta);
  const next: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(current)) {
    if (entry) {
      next[key] = { verified_at: entry.verifiedAt, source: entry.source };
    }
  }

  next[fieldId] = {
    verified_at: new Date().toISOString(),
    source: source ?? "bulk_upload",
  };

  return { ...meta, [FIELD_VERIFICATION_KEY]: next };
}

export function metadataWithNameGbpMismatch(
  existing: Record<string, unknown> | null | undefined,
  uploadedName: string,
  gbpPlaceName: string | null,
): Record<string, unknown> {
  const meta = { ...(existing ?? {}) };
  meta.csv_upload_name = uploadedName;
  if (gbpPlaceName) meta.gbp_place_name = gbpPlaceName;
  meta.name_gbp_mismatch = true;
  meta.name_gbp_mismatch_flagged_at = new Date().toISOString();
  return meta;
}

export function metadataClearNameGbpMismatch(
  existing: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  const meta = { ...(existing ?? {}) };
  delete meta.name_gbp_mismatch;
  delete meta.name_gbp_mismatch_flagged_at;
  delete meta.csv_upload_name;
  delete meta.gbp_place_name;
  return meta;
}

export async function markBusinessFieldVerified(
  businessId: string,
  fieldId: AdminPendingFieldId,
  source: FieldVerificationEntry["source"] = "bulk_upload",
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { data, error: readError } = await supabase
    .from("businesses")
    .select("metadata")
    .eq("id", businessId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read business metadata: ${readError.message}`);
  }

  const metadata = metadataWithFieldVerified(
    (data?.metadata as Record<string, unknown> | null) ?? null,
    fieldId,
    source,
  );

  const { error } = await supabase.from("businesses").update({ metadata }).eq("id", businessId);
  if (error) {
    throw new Error(`Failed to mark field verified: ${error.message}`);
  }

  revalidateTag("businesses");
}

export async function patchBusinessMetadata(
  businessId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  const supabase = createSupabaseAdmin();
  const { data, error: readError } = await supabase
    .from("businesses")
    .select("metadata")
    .eq("id", businessId)
    .maybeSingle();

  if (readError) {
    throw new Error(`Failed to read business metadata: ${readError.message}`);
  }

  const metadata = { ...((data?.metadata as Record<string, unknown> | null) ?? {}), ...patch };
  const { error } = await supabase.from("businesses").update({ metadata }).eq("id", businessId);
  if (error) {
    throw new Error(`Failed to update metadata: ${error.message}`);
  }

  revalidateTag("businesses");
}
