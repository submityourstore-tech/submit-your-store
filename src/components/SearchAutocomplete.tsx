"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { SearchSuggestion } from "@/lib/search-suggest.server";

type SearchAutocompleteProps = {
  action?: string;
  defaultQuery?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showLocation?: boolean;
  location?: string;
  compact?: boolean;
};

export function SearchAutocomplete({
  action = "/search",
  defaultQuery = "",
  placeholder = "Search businesses…",
  className = "",
  inputClassName = "",
  showLocation = false,
  location = "Worldwide",
  compact = false,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = useCallback(async (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { suggestions?: SearchSuggestion[] };
      const items = data.suggestions ?? [];
      setSuggestions(items);
      setOpen(items.length > 0);
      setActiveIndex(-1);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSuggestions(query);
    }, 200);
    return () => window.clearTimeout(timer);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function navigateToSearch(q: string) {
    const trimmed = q.trim();
    router.push(trimmed ? `${action}?q=${encodeURIComponent(trimmed)}` : action);
    setOpen(false);
  }

  function selectSuggestion(item: SearchSuggestion) {
    if (item.type === "all") {
      navigateToSearch(query);
      return;
    }
    router.push(item.href);
    setOpen(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      selectSuggestion(suggestions[activeIndex]);
      return;
    }
    navigateToSearch(query);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full items-center">
        <div
          className={`flex w-full overflow-hidden rounded-md border border-[#ccc] bg-white shadow-sm ${
            showLocation ? "" : ""
          }`}
        >
          {showLocation && (
            <div className="flex min-w-[130px] items-center gap-1.5 border-r border-[#ccc] bg-white px-3 py-2.5 text-sm text-[#333]">
              <span className="text-[#1274c0]" aria-hidden>
                📍
              </span>
              <span className="truncate font-medium">{location}</span>
            </div>
          )}
          <input
            ref={inputRef}
            type="search"
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            className={`min-w-0 flex-1 px-3 text-sm text-[#111] outline-none ${
              compact ? "py-2" : "py-2.5"
            } ${inputClassName}`}
          />
          <button
            type="submit"
            className={`jd-btn-primary font-semibold ${compact ? "px-4 text-sm" : "px-5 text-sm"}`}
          >
            Search
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-50 mt-1 max-h-80 w-full overflow-auto rounded-md border border-[#ddd] bg-white py-1 shadow-lg"
        >
          {suggestions.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => selectSuggestion(item)}
                className={`flex w-full flex-col px-3 py-2.5 text-left text-sm hover:bg-[#f0f7fd] ${
                  index === activeIndex ? "bg-[#f0f7fd]" : ""
                } ${item.type === "all" ? "border-t border-[#eee] font-semibold text-[#1274c0]" : ""}`}
              >
                <span className="font-medium text-[#111]">{item.label}</span>
                {item.sublabel && <span className="text-xs text-[#717171]">{item.sublabel}</span>}
              </button>
            </li>
          ))}
          {loading && (
            <li className="px-3 py-2 text-xs text-[#999]">Loading suggestions…</li>
          )}
        </ul>
      )}
    </div>
  );
}
