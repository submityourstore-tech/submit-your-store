import Link from "next/link";
import { SearchBar } from "@/components/SearchBar";
import type { CategoryStat } from "@/lib/categories-config";

type SearchHeroProps = {
  tags: CategoryStat[];
  searchAction?: string;
};

export function SearchHero({ tags, searchAction = "/hvac/texas" }: SearchHeroProps) {
  return (
    <section className="border-b border-[#e0e0e0] bg-white py-8">
      <div className="mx-auto max-w-6xl px-4">
        <h1 className="text-center text-xl font-normal text-[#333] sm:text-2xl">
          Search across <span className="font-semibold text-[#1274c0]">millions of businesses</span>
        </h1>
        <div className="mt-5 flex justify-center">
          <SearchBar action={searchAction} />
        </div>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm">
            {tags.map((tag) => (
              <Link
                key={`${tag.slug}-${tag.label}`}
                href={tag.href}
                className="rounded-full border border-[#ddd] bg-[#f7f7f7] px-3 py-1 text-[#555] hover:border-[#1274c0] hover:text-[#1274c0]"
              >
                {tag.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
