import Link from "next/link";

type ListingPaginationProps = {
  basePath: string;
  currentPage: number;
  totalPages: number;
  queryString: string;
};

export function ListingPagination({
  basePath,
  currentPage,
  totalPages,
  queryString,
}: ListingPaginationProps) {
  if (totalPages <= 1) return null;

  function href(page: number) {
    const params = new URLSearchParams(queryString);
    if (page <= 1) params.delete("page");
    else params.set("page", String(page));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const pages: number[] = [];
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) pages.push(p);
  }

  const items: (number | "…")[] = [];
  for (let i = 0; i < pages.length; i += 1) {
    if (i > 0 && pages[i]! - pages[i - 1]! > 1) items.push("…");
    items.push(pages[i]!);
  }

  return (
    <nav className="mt-8 flex flex-wrap items-center justify-center gap-2" aria-label="Pagination">
      {currentPage > 1 && (
        <Link
          href={href(currentPage - 1)}
          className="rounded border border-[#ccc] bg-white px-3 py-1.5 text-sm font-medium text-[#333] hover:border-[#1274c0]"
        >
          ← Prev
        </Link>
      )}
      {items.map((item, i) =>
        item === "…" ? (
          <span key={`ellipsis-${i}`} className="px-1 text-[#999]">
            …
          </span>
        ) : (
          <Link
            key={item}
            href={href(item)}
            className={`min-w-[2.25rem] rounded border px-3 py-1.5 text-center text-sm font-medium ${
              item === currentPage
                ? "border-[#1274c0] bg-[#1274c0] text-white"
                : "border-[#ccc] bg-white text-[#333] hover:border-[#1274c0]"
            }`}
            aria-current={item === currentPage ? "page" : undefined}
          >
            {item}
          </Link>
        ),
      )}
      {currentPage < totalPages && (
        <Link
          href={href(currentPage + 1)}
          className="rounded border border-[#ccc] bg-white px-3 py-1.5 text-sm font-medium text-[#333] hover:border-[#1274c0]"
        >
          Next →
        </Link>
      )}
    </nav>
  );
}
