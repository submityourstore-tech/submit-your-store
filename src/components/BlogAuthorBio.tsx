import Image from "next/image";
import Link from "next/link";
import { SITE_AUTHOR } from "@/lib/site-config";

export function BlogAuthorBio() {
  return (
    <aside className="mt-10 flex gap-4 rounded border border-[#e0e0e0] bg-[#fafafa] p-5">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-[#ddd] bg-white">
        <Image
          src={SITE_AUTHOR.image}
          alt={SITE_AUTHOR.name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#717171]">Written by</p>
        <p className="mt-1 text-base font-bold text-[#111]">{SITE_AUTHOR.name}</p>
        <p className="text-sm font-medium text-[#1274c0]">{SITE_AUTHOR.role}</p>
        <p className="mt-2 text-sm leading-relaxed text-[#555]">{SITE_AUTHOR.bio}</p>
        <Link
          href={SITE_AUTHOR.linkedin}
          target="_blank"
          rel="noopener noreferrer author"
          className="mt-2 inline-block text-sm font-semibold text-[#1274c0] hover:underline"
        >
          LinkedIn profile →
        </Link>
      </div>
    </aside>
  );
}
