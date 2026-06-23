import Image from "next/image";
import Link from "next/link";

type SiteLogoProps = {
  href?: string;
  size?: "header" | "footer";
  showWordmark?: boolean;
};

export function SiteLogo({ href = "/", size = "header", showWordmark = true }: SiteLogoProps) {
  const iconSize = size === "header" ? 40 : 36;
  const textClass = size === "header" ? "text-2xl" : "text-xl";

  const content = (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/brand/logo.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0"
        priority={size === "header"}
      />
      {showWordmark && (
        <span className={`${textClass} font-bold tracking-tight`}>
          <span className="text-[#1274c0]">Submit</span>
          <span className="text-[#ff6c00]">Your Store</span>
        </span>
      )}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="shrink-0">
      {content}
    </Link>
  );
}
