import type { Metadata } from "next";

/** Pages that should never appear in search results. */
export const NOINDEX_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export function noIndexMetadata(title: string, description?: string): Metadata {
  return {
    title,
    description,
    robots: NOINDEX_ROBOTS,
  };
}

export function sitePageMetadata(title: string, description: string): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
