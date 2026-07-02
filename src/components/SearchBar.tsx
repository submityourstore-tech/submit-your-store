"use client";

import { SearchAutocomplete } from "@/components/SearchAutocomplete";

type SearchBarProps = {
  location?: string;
  query?: string;
  action?: string;
};

export function SearchBar({
  location = "Worldwide",
  query = "",
  action = "/search",
}: SearchBarProps) {
  return (
    <SearchAutocomplete
      action={action}
      defaultQuery={query}
      showLocation
      location={location}
      placeholder="Search for businesses, services..."
      className="w-full max-w-3xl"
    />
  );
}
