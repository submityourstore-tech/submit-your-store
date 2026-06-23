import { filterCustomerReviews } from "@/lib/review-filters";

type WhatCustomersSayProps = {
  reviews: string[];
};

export function WhatCustomersSay({ reviews }: WhatCustomersSayProps) {
  const filtered = filterCustomerReviews(reviews);
  if (filtered.length === 0) return null;

  return (
    <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#1274c0]">💬 What Our Customers Say</h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-[#555]">
        {filtered.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
