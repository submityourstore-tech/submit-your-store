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
