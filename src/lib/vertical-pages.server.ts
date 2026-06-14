import { CATEGORY_REGISTRY } from "@/lib/category-registry";
import { LEGACY_HVAC_VERTICAL } from "@/lib/category-registry";
import { getActiveVerticalStats } from "@/lib/categories.server";
import type { VerticalStat } from "@/lib/categories-config";

export function getActiveVerticalBrowse(slug: string): VerticalStat | undefined {
  return getActiveVerticalStats().find((vertical) => vertical.slug === slug);
}

export function getVerticalRegistryLabel(verticalSlug: string): string {
  if (verticalSlug === LEGACY_HVAC_VERTICAL) {
    return CATEGORY_REGISTRY.find((v) => v.slug === "home-services")?.label ?? "HVAC";
  }
  return CATEGORY_REGISTRY.find((v) => v.slug === verticalSlug)?.label ?? verticalSlug;
}

export function verticalPageTitle(verticalSlug: string, place: string): string {
  const stat = getActiveVerticalBrowse(verticalSlug);
  if (!stat) return `Businesses in ${place}`;
  const shortLabel = stat.navLabel.replace(/\s+Texas$/i, "") || stat.label;
  return `${shortLabel} in ${place}`;
}

export function verticalPageDescription(verticalSlug: string, place: string): string {
  const label = getVerticalRegistryLabel(verticalSlug).toLowerCase();
  return `Browse ${label} businesses in ${place} on Submit Your Store.`;
}

export function verticalBreadcrumbLabel(verticalSlug: string): string {
  const stat = getActiveVerticalBrowse(verticalSlug);
  if (!stat) return getVerticalRegistryLabel(verticalSlug);
  return stat.navLabel.replace(/\s+Texas$/i, "") || stat.label;
}
