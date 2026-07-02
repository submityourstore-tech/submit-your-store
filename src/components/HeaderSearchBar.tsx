"use client";

import { SearchAutocomplete } from "@/components/SearchAutocomplete";

type HeaderSearchBarProps = {
  className?: string;
};

export function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  return (
    <div className={`flex min-w-0 flex-1 items-center ${className}`}>
      <SearchAutocomplete action="/search" compact placeholder="Search businesses…" className="w-full max-w-md" />
    </div>
  );
}
