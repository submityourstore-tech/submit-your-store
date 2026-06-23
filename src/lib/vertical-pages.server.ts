import { CATEGORY_REGISTRY } from "@/lib/category-registry";
import { LEGACY_HVAC_VERTICAL } from "@/lib/category-registry";
import { getActiveVerticalStats } from "@/lib/categories.server";
import type { VerticalStat } from "@/lib/categories-config";

const VERTICAL_SLUG_ALIASES: Record<string, string> = {
  "home-services": LEGACY_HVAC_VERTICAL,
  hvac: "home-services",
};

function isHvacTexasStat(stat: VerticalStat): boolean {
  return stat.slug === LEGACY_HVAC_VERTICAL || stat.slug === "home-services";
}

export async function getActiveVerticalBrowse(slug: string): Promise<VerticalStat | undefined> {
  const stats = await getActiveVerticalStats();
  const direct = stats.find((vertical) => vertical.slug === slug);
  if (direct) return direct;

  const alias = VERTICAL_SLUG_ALIASES[slug];
  if (alias) {
    return stats.find((vertical) => vertical.slug === alias);
  }

  return undefined;
}

/** Public URL slug used in links (prefer /hvac for home-services vertical). */
export async function resolveCanonicalVerticalSlug(slug: string): Promise<string> {
  const stat = await getActiveVerticalBrowse(slug);
  if (!stat) return slug;
  if (isHvacTexasStat(stat)) return LEGACY_HVAC_VERTICAL;
  return stat.slug;
}

/** Slug passed to listing queries. */
export async function resolveVerticalQuerySlug(slug: string): Promise<string> {
  const stat = await getActiveVerticalBrowse(slug);
  if (!stat) return slug;
  if (slug === LEGACY_HVAC_VERTICAL || slug === "home-services") {
    return LEGACY_HVAC_VERTICAL;
  }
  return stat.slug;
}

/** All URL slugs that should resolve to the same vertical browse page. */
export function verticalSlugsForRouting(stat: VerticalStat): string[] {
  const slugs = new Set<string>([stat.slug]);
  if (isHvacTexasStat(stat)) {
    slugs.add(LEGACY_HVAC_VERTICAL);
    slugs.add("home-services");
  }
  return [...slugs];
}

export async function generateVerticalStaticParams(): Promise<{ vertical: string }[]> {
  const stats = await getActiveVerticalStats();
  const slugs = new Set<string>();
  for (const stat of stats) {
    for (const slug of verticalSlugsForRouting(stat)) {
      slugs.add(slug);
    }
  }
  return [...slugs].map((vertical) => ({ vertical }));
}

export function getVerticalRegistryLabel(verticalSlug: string): string {
  if (verticalSlug === LEGACY_HVAC_VERTICAL) {
    return CATEGORY_REGISTRY.find((v) => v.slug === "home-services")?.label ?? "HVAC";
  }
  return CATEGORY_REGISTRY.find((v) => v.slug === verticalSlug)?.label ?? verticalSlug;
}

export async function verticalPageTitle(verticalSlug: string, place: string): Promise<string> {
  const stat = await getActiveVerticalBrowse(verticalSlug);
  if (!stat) return `Businesses in ${place}`;
  const shortLabel = stat.navLabel.replace(/\s+Texas$/i, "") || stat.label;
  return `${shortLabel} in ${place}`;
}

export function verticalPageDescription(verticalSlug: string, place: string): string {
  const label = getVerticalRegistryLabel(verticalSlug).toLowerCase();
  return `Browse ${label} businesses in ${place} on Submit Your Store.`;
}

export async function verticalBreadcrumbLabel(verticalSlug: string): Promise<string> {
  const stat = await getActiveVerticalBrowse(verticalSlug);
  if (!stat) return getVerticalRegistryLabel(verticalSlug);
  return stat.navLabel.replace(/\s+Texas$/i, "") || stat.label;
}
