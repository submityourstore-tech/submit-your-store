import Link from "next/link";

export function SidePromoTabs() {
  return (
    <div className="fixed right-0 top-1/3 z-40 hidden flex-col gap-0 lg:flex">
      <Link
        href="/list-your-business"
        className="jd-btn-orange rounded-l-md px-2 py-4 text-center text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180"
      >
        Advertise
      </Link>
      <Link
        href="/list-your-business"
        className="jd-btn-primary rounded-l-md px-2 py-4 text-center text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180"
      >
        Free Listing
      </Link>
    </div>
  );
}
