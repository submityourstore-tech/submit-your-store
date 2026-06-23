"use client";

import { useState } from "react";
import type { BusinessFaq } from "@/types/business";

type BusinessFaqsProps = {
  businessName: string;
  faqs: BusinessFaq[];
};

export function BusinessFaqs({ businessName, faqs }: BusinessFaqsProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (faqs.length === 0) return null;

  return (
    <section className="mt-4 rounded border border-[#e0e0e0] bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#1274c0]">Frequently Asked Questions</h2>
      <p className="mt-1 text-sm text-[#717171]">
        Based on what customers say about {businessName} — owner replies and promotional posts are not included.
      </p>
      <ul className="mt-4 divide-y divide-[#eee]">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <li key={faq.question}>
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : index)}
                className="flex w-full items-start justify-between gap-3 py-3 text-left"
                aria-expanded={open}
              >
                <span className="font-semibold text-[#111]">{faq.question}</span>
                <span className="mt-0.5 shrink-0 text-lg leading-none text-[#1274c0]" aria-hidden>
                  {open ? "−" : "+"}
                </span>
              </button>
              {open && (
                <p className="pb-3 text-sm leading-relaxed text-[#555]">{faq.answer}</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
