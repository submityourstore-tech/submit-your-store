"use client";

import {
  getDefaultListingCategoryKey,
  getListingCategoryGroups,
} from "@/lib/categories-config";

const GROUPS = getListingCategoryGroups();

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function ListingCategorySelect({ value, onChange }: Props) {
  return (
    <label className="block text-sm">
      <span className="font-medium text-[#333]">Category</span>
      <span className="mt-0.5 block text-xs text-[#717171]">
        Choose the category that best matches your business.
      </span>
      <select
        required
        value={value || getDefaultListingCategoryKey()}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
      >
        {GROUPS.map((group) => (
          <optgroup key={group.verticalSlug} label={group.verticalLabel}>
            {group.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </label>
  );
}
