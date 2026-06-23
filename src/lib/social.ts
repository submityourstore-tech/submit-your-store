import type { SocialLinks } from "@/types/business";

export type SocialNetwork = keyof SocialLinks;

export type ValidSocialLink = {
  network: SocialNetwork;
  url: string;
  label: string;
};

const LABELS: Record<SocialNetwork, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  youtube: "YouTube",
  twitter: "X (Twitter)",
};

const INVALID_URL_PATTERNS = [
  /^https?:\/\/(www\.)?x\.com\/?(?:#.*)?$/i,
  /^https?:\/\/(www\.)?twitter\.com\/?(?:#.*)?$/i,
  /^https?:\/\/(www\.)?youtube\.com\/?(?:#.*)?$/i,
  /^https?:\/\/youtu\.be\/?(?:#.*)?$/i,
  /linkedin\.com\/company\/\?/i,
];

function normalizeUrl(url: string): string {
  return url.replace(/&amp;/g, "&").trim();
}

function isValidSocialUrl(url: string): boolean {
  const normalized = normalizeUrl(url);
  if (!normalized || normalized === "#") return false;
  return !INVALID_URL_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getValidSocialLinks(social: SocialLinks): ValidSocialLink[] {
  return (Object.keys(LABELS) as SocialNetwork[])
    .filter((network) => {
      const url = social[network];
      return url && isValidSocialUrl(url);
    })
    .map((network) => ({
      network,
      url: normalizeUrl(social[network]!),
      label: LABELS[network],
    }));
}
