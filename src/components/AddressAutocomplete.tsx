"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { AddressSelection } from "@/types/address-search";

type AddressAutocompleteProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (selection: AddressSelection) => void;
  lat?: number | null;
  lon?: number | null;
  required?: boolean;
  readOnly?: boolean;
};

export function AddressAutocomplete({
  value,
  onValueChange,
  onSelect,
  lat,
  lon,
  required,
  readOnly,
}: AddressAutocompleteProps) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<AddressSelection[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (readOnly || value.trim().length < 3) {
      if (readOnly) setSuggestions([]);
      else if (value.trim().length < 3) setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results?: AddressSelection[] };
        setSuggestions(data.results ?? []);
        setOpen(true);
      } catch {
        if (!controller.signal.aborted) setSuggestions([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, readOnly]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (readOnly) {
    return (
      <div className="space-y-3">
        <div className="text-sm">
          <span className="font-medium text-[#333]">Business address</span>
          <p className="mt-1 rounded border border-[#e0e0e0] bg-white px-3 py-2 text-[#555]">{value}</p>
        </div>
        {lat != null && lon != null && !(lat === 0 && lon === 0) && (
          <AddressMapPreview lat={lat} lon={lon} label={value} />
        )}
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="space-y-3">
      <label className="block text-sm">
        <span className="font-medium text-[#333]">Business address *</span>
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => {
            onValueChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          placeholder="Start typing address — suggestions appear below"
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className="mt-1 w-full rounded border border-[#ccc] px-3 py-2 text-sm"
        />
        <span className="mt-1 block text-xs text-[#717171]">
          Free address search — no API key. Select a suggestion to pin on map.
        </span>
      </label>

      {open && (loading || suggestions.length > 0) && (
        <ul
          id={listId}
          role="listbox"
          className="overflow-hidden rounded-md border border-[#e0e0e0] bg-white shadow-md"
        >
          {loading && (
            <li className="px-3 py-2 text-sm text-[#717171]">Searching addresses…</li>
          )}
          {!loading &&
            suggestions.map((item) => (
              <li key={item.id} role="option">
                <button
                  type="button"
                  onClick={() => {
                    onSelect(item);
                    onValueChange(item.label);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-2 px-3 py-2.5 text-left text-sm hover:bg-[#f0f7fd]"
                >
                  <span className="text-[#1274c0]" aria-hidden>
                    📍
                  </span>
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
        </ul>
      )}

      {lat != null && lon != null && !(lat === 0 && lon === 0) && (
        <AddressMapPreview lat={lat} lon={lon} label={value} />
      )}
    </div>
  );
}

function AddressMapPreview({
  lat,
  lon,
  label,
}: {
  lat: number;
  lon: number;
  label: string;
}) {
  const pad = 0.012;
  const bbox = `${lon - pad},${lat - pad},${lon + pad},${lat + pad}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <div className="overflow-hidden rounded-md border border-[#e0e0e0]">
      <iframe
        title={`Map for ${label}`}
        src={src}
        className="h-52 w-full"
        loading="lazy"
      />
      <p className="border-t border-[#eee] bg-[#fafafa] px-2 py-1 text-[10px] text-[#999]">
        ©{" "}
        <a href="https://www.openstreetmap.org/copyright" className="underline" target="_blank" rel="noreferrer">
          OpenStreetMap
        </a>{" "}
        — free map, no API key
      </p>
    </div>
  );
}
