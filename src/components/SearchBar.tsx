"use client";

import { useRouter } from "next/navigation";

type SearchBarProps = {
  location?: string;
  query?: string;
  action?: string;
};

export function SearchBar({
  location = "Worldwide",
  query = "",
  action = "/listings",
}: SearchBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const q = new FormData(form).get("q")?.toString().trim() ?? "";
    router.push(q ? `${action}?q=${encodeURIComponent(q)}` : action);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-3xl overflow-hidden rounded-md border border-[#ccc] shadow-sm"
    >
      <div className="flex min-w-[130px] items-center gap-1.5 border-r border-[#ccc] bg-white px-3 py-2.5 text-sm text-[#333]">
        <span className="text-[#1274c0]" aria-hidden>
          📍
        </span>
        <span className="truncate font-medium">{location}</span>
      </div>
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Search for businesses, services..."
        className="min-w-0 flex-1 px-3 py-2.5 text-sm text-[#111] outline-none"
      />
      <button
        type="submit"
        className="jd-btn-primary px-5 text-sm font-semibold"
      >
        Search
      </button>
    </form>
  );
}
