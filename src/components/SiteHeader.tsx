import { SiteLogo } from "@/components/SiteLogo";
import { SiteHeaderNav } from "@/components/SiteHeaderNav";
import { HeaderSearchBar } from "@/components/HeaderSearchBar";

export function SiteHeader() {
  return (
    <header className="relative sticky top-0 z-30 border-b border-[#e0e0e0] bg-white shadow-sm">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 lg:flex-nowrap">
        <SiteLogo size="header" />
        <HeaderSearchBar className="order-3 w-full lg:order-2 lg:mx-4 lg:w-auto" />
        <div className="order-2 ml-auto lg:order-3 lg:ml-0">
          <SiteHeaderNav />
        </div>
      </div>
    </header>
  );
}
