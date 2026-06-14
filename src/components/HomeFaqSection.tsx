import Link from "next/link";

const HOME_FAQS = [
  {
    q: "Is it really free to list my business?",
    a: "Yes. Standard directory listings on Submit Your Store are free after email verification — no pay-to-rank fee for basic inclusion.",
  },
  {
    q: "How do reviews work?",
    a: "Reviews are written by registered members. Business owners cannot pay to remove legitimate reviews, and we filter owner replies from customer feedback on profiles.",
  },
  {
    q: "Can I vote for my favorite HVAC company?",
    a: "Signed-in members can upvote or downvote each business once. Community votes help rank companies in our city guides and blog listings.",
  },
  {
    q: "How long until my listing appears?",
    a: "After you click the verification link in your business email, the listing publishes immediately and appears in browse and search pages.",
  },
];

export function HomeFaqSection() {
  return (
    <section className="border-t border-[#e0e0e0] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#111]">Frequently asked questions</h2>
            <p className="mt-1 text-sm text-[#717171]">Quick answers about listings, reviews, and voting.</p>
          </div>
          <Link href="/faq" className="text-sm font-semibold text-[#1274c0] hover:underline">
            View all FAQs →
          </Link>
        </div>
        <ul className="mt-5 divide-y divide-[#eee] rounded border border-[#e0e0e0] bg-white shadow-sm">
          {HOME_FAQS.map((item) => (
            <li key={item.q} className="px-5 py-4">
              <h3 className="font-semibold text-[#111]">{item.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#555]">{item.a}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
