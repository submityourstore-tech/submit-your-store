import { revalidatePath } from "next/cache";
import {
  getVerticalCityPath,
  getVerticalPath,
  resolveBusinessBrowseVertical,
} from "@/lib/categories-config";
import { toLocationSlug, resolveBusinessCityState } from "@/lib/location-utils";
import type { Business } from "@/types/business";

export function revalidateBusinessListingPaths(
  business: Pick<Business, "city" | "state" | "vertical" | "categorySlug" | "status">,
) {
  const vertical = resolveBusinessBrowseVertical(business);
  const { city, state } = resolveBusinessCityState(business);
  revalidatePath("/");
  revalidatePath(getVerticalPath(vertical));
  revalidatePath(getVerticalCityPath(vertical, toLocationSlug(city, state)));
}
