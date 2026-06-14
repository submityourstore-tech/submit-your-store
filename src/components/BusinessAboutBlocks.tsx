import type { AboutBlock } from "@/types/business";

const HIDDEN_HEADINGS = new Set(["Contact & Location", "What Customers Say"]);

type BusinessAboutBlocksProps = {
  blocks: AboutBlock[];
};

export function BusinessAboutBlocks({ blocks }: BusinessAboutBlocksProps) {
  const visible = blocks.filter((b) => !HIDDEN_HEADINGS.has(b.heading));
  if (visible.length === 0) return null;

  return (
    <section className="mt-4 space-y-4">
      {visible.map((block) => (
        <article
          key={block.heading}
          className="rounded border border-[#e0e0e0] bg-white p-5 shadow-sm"
        >
          <h2 className="text-base font-bold text-[#1274c0]">{block.heading}</h2>
          {block.body ? (
            <p className="mt-2 leading-relaxed text-[#555]">{block.body}</p>
          ) : null}
          {block.bullets && block.bullets.length > 0 && (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-[#555]">
              {block.bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </article>
      ))}
    </section>
  );
}
