import Image from "next/image";
import type { Business } from "@/types/business";

type BusinessAvatarProps = {
  name: string;
  logo?: string | null;
  size?: "card" | "blog" | "detail";
  className?: string;
};

const SIZE = {
  card: { box: "h-[88px] w-[88px] sm:h-[100px] sm:w-[100px]", text: "text-lg", px: 100 },
  blog: { box: "h-[64px] w-[64px] sm:h-[72px] sm:w-[72px]", text: "text-sm", px: 72 },
  detail: { box: "h-24 w-24", text: "text-2xl", px: 96 },
} as const;

export function BusinessAvatar({ name, logo, size = "card", className = "" }: BusinessAvatarProps) {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const dims = SIZE[size];

  if (logo) {
    const cover = size === "blog";
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded border border-[#e0e0e0] bg-[#fafafa] ${dims.box} ${className}`}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          sizes={`${dims.px}px`}
          className={
            cover
              ? "object-cover object-center"
              : "object-contain object-center p-0.5"
          }
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded border border-[#e0e0e0] bg-[#f3f3f3] font-bold text-[#1274c0] ${dims.box} ${dims.text} ${className}`}
    >
      {initials}
    </div>
  );
}

export function BusinessGallery({ business }: { business: Pick<Business, "name" | "gallery"> }) {
  if (!business.gallery?.length) return null;

  return (
    <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#1274c0]">Photos</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {business.gallery.map((src) => (
          <div
            key={src}
            className="overflow-hidden rounded border border-[#eee] bg-[#fafafa]"
          >
            <Image
              src={src}
              alt={`${business.name} photo`}
              width={640}
              height={480}
              className="h-auto w-full object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
