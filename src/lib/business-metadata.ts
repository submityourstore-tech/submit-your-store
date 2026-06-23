import type { Business } from "@/types/business";
import { claimStatusFromMetadata, metadataWithClaimStatus, type ClaimStatus } from "@/lib/claim-status";
import { fieldVerificationFromMetadata, type FieldVerificationMap } from "@/lib/field-verification.server";

export function foundedYearFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): number | undefined {
  const raw = metadata?.founded_year;
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const n = Number.parseInt(raw.replace(/[^\d]/g, ""), 10);
    if (Number.isFinite(n) && n >= 1800 && n <= new Date().getFullYear()) return n;
  }
  return undefined;
}

export function foundedYearConfidenceFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | undefined {
  const raw = metadata?.founded_year_confidence;
  return typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
}

export function applyBusinessMetadata(
  business: Business,
  metadata: Record<string, unknown> | null | undefined,
): Business {
  business.claimStatus = claimStatusFromMetadata(metadata);
  const foundedYear = foundedYearFromMetadata(metadata);
  if (foundedYear != null) business.foundedYear = foundedYear;
  const confidence = foundedYearConfidenceFromMetadata(metadata);
  if (confidence) business.foundedYearConfidence = confidence;

  business.fieldVerification = fieldVerificationFromMetadata(metadata);
  business.nameGbpMismatch = metadata?.name_gbp_mismatch === true;
  if (typeof metadata?.gbp_place_name === "string") {
    business.gbpPlaceName = metadata.gbp_place_name;
  }
  if (typeof metadata?.csv_upload_name === "string") {
    business.csvUploadName = metadata.csv_upload_name;
  }
  const websiteCheck = metadata?.website_check;
  if (websiteCheck && typeof websiteCheck === "object") {
    const wc = websiteCheck as Record<string, unknown>;
    business.websiteCheck = {
      status: typeof wc.status === "number" ? wc.status : undefined,
      error: typeof wc.error === "string" ? wc.error : undefined,
      checkedAt: typeof wc.checked_at === "string" ? wc.checked_at : undefined,
    };
  }

  return business;
}

export function businessMetadata(
  existing: Record<string, unknown> | null | undefined,
  business: Business,
): Record<string, unknown> {
  const claimStatus: ClaimStatus = business.claimStatus ?? "verified";
  let meta = metadataWithClaimStatus(existing, claimStatus);

  if (business.foundedYear != null) {
    meta = { ...meta, founded_year: business.foundedYear };
  } else if (meta.founded_year != null) {
    const { founded_year: _y, ...rest } = meta;
    meta = rest;
  }

  if (business.foundedYearConfidence?.trim()) {
    meta = { ...meta, founded_year_confidence: business.foundedYearConfidence.trim() };
  } else if (meta.founded_year_confidence != null) {
    const { founded_year_confidence: _c, ...rest } = meta;
    meta = rest;
  }

  return meta;
}
