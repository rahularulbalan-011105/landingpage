import { useReveal } from "@/hooks/use-reveal";
import awards from "@/assets/awards.jpg";
import { SectionHead } from "./SectionHead";

const BADGES = [
  "NIDHI PRAYAS",
  "EDII — Govt. of India",
  "TiE Chennai",
  "Wadhwani Foundation",
  "TIDCO",
  "Govt. of Tamil Nadu",
];

export function Awards() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-wb-canvas pt-28 font-ui text-wb-ink sm:pt-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHead
          eyebrow="Recognition"
          title="Backed by people who build the future."
          aside="Awards, grants and partnerships from India’s innovation ecosystem."
        />

        <div ref={ref} className="reveal wb-panel mt-12 overflow-hidden">
          <img
            src={awards}
            alt="AtumX awards and recognition: NIDHI PRAYAS, EDII-TN, TiE Chennai, Wadhwani Foundation, TIDCO, Government of Tamil Nadu"
            className="block h-auto w-full"
            loading="lazy"
          />
        </div>

        <ul className="mt-6 flex flex-wrap gap-2">
          {BADGES.map((b) => (
            <li
              key={b}
              className="rounded-[10px] border border-wb-line bg-wb-bench px-3 py-1.5 text-[13px] font-medium text-wb-ink-2"
            >
              {b}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
