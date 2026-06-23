export type ListingVerificationType = "new" | "claim";

export type NewListingPayload = {
  businessName: string;
  gbpUrl: string;
  businessEmail: string;
  phone: string;
  address: string;
  website?: string;
  /** verticalSlug:categorySlug — preferred for multi-category listings */
  categoryKey?: string;
  category?: string;
  city?: string;
  state?: string;
  lat?: number;
  lon?: number;
  description?: string;
  social?: import("@/types/business").SocialLinks;
  uploadSessionId?: string;
  logo?: string;
  gallery?: string[];
};

export type ListingVerificationRecord = {
  id: string;
  type: ListingVerificationType;
  businessEmail: string;
  gbpUrl: string;
  businessId: string | null;
  codeHash: string;
  createdAt: string;
  expiresAt: string;
  verifiedAt: string | null;
  payload: NewListingPayload | null;
};

export type ManageSessionRecord = {
  businessId: string;
  email: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
};

export type ListingVerificationsStore = {
  verifications: ListingVerificationRecord[];
  manageSessions: ManageSessionRecord[];
};

export type ListingCheckResult =
  | { status: "available" }
  | {
      status: "claimable";
      businessId: string;
      businessName: string;
      requiredEmailDomain: string;
    }
  | { status: "published"; businessId: string; businessName: string };
