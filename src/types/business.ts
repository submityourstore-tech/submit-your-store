export type SocialLinks = {
  facebook: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  twitter: string | null;
};

export type WeeklyHoursEntry = {
  day: string;
  hours: string;
};

export type AboutBlock = {
  heading: string;
  body: string;
  bullets?: string[];
};

export type BusinessFaq = {
  question: string;
  answer: string;
  source?: "customer-review";
};

export type ClaimStatus = "unclaimed" | "verified" | "claimed";

export type Business = {
  id: string;
  name: string;
  vertical?: string;
  status?: "active" | "hidden";
  category: string;
  categorySlug: string;
  address: string | null;
  city: string;
  state: string;
  website: string | null;
  email: string | null;
  phone: string;
  googleMapsUrl: string | null;
  social: SocialLinks;
  description: string;
  logo?: string;
  gallery?: string[];
  faqs?: BusinessFaq[];
  aboutBlocks?: AboutBlock[];
  googleRating?: number;
  googleReviewCount?: number;
  googleReviews?: string[];
  hoursStatus?: string;
  weeklyHours?: WeeklyHoursEntry[];
  timezone?: string;
  /** Whether the business owner has verified / claimed this listing. */
  claimStatus?: ClaimStatus;
  /** Year the business was founded (stored in metadata). */
  foundedYear?: number;
  foundedYearConfidence?: string;
  /** Per-field admin verification timestamps (stored in metadata). */
  fieldVerification?: import("@/lib/field-verification.server").FieldVerificationMap;
  /** Uploaded CSV name differs from GBP place name. */
  nameGbpMismatch?: boolean;
  gbpPlaceName?: string;
  csvUploadName?: string;
  websiteCheck?: { status?: number; error?: string; checkedAt?: string };
};

export type SiteReview = {
  id: string;
  businessId: string;
  userId?: string;
  userName: string;
  userImage?: string | null;
  emailVerified?: boolean;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};
