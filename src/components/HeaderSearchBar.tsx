"use client";

import { useRouter } from "next/navigation";

type HeaderSearchBarProps = {
  className?: string;
};

export function HeaderSearchBar({ className = "" }: HeaderSearchBarProps) {
  const router = useRouter();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : "/listings");
  }

  return (
    <form onSubmit={handleSubmit} className={`flex min-w-0 flex-1 items-center ${className}`}>
      <div className="flex w-full max-w-md overflow-hidden rounded-md border border-[#ccc] bg-white shadow-sm">
        <input
          type="search"
          name="q"
          placeholder="Search businesses…"
          className="min-w-0 flex-1 px-3 py-2 text-sm text-[#111] outline-none"
          aria-label="Search businesses"
        />
        <button type="submit" className="jd-btn-primary px-4 text-sm font-semibold">
          Search
        </button>
      </div>
    </form>
  );
}
