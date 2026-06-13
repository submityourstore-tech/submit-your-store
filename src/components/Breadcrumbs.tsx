import Link from "next/link";

export function Breadcrumbs({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="text-sm text-[#717171]" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={item.label}>
          {i > 0 && <span className="mx-1.5 text-[#aaa]">›</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[#1274c0] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-[#333]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
