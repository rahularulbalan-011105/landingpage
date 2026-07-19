import { useReveal } from "@/hooks/use-reveal";
import awards from "@/assets/awards.jpg";

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
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <span className="comic-tag">🏆 Recognition</span>
            <h2
              className="mt-5 font-display text-foreground font-extrabold"
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                lineHeight: 1.02,
                letterSpacing: "-0.02em",
                maxWidth: "720px",
              }}
            >
              Backed by people who{" "}
              <span className="text-primary">build the future</span>.
            </h2>
          </div>
          <p className="text-[13px] font-semibold text-text-tertiary md:text-right max-w-[280px]">
            Awards, grants &amp; partnerships from India's innovation ecosystem
          </p>
        </div>

        <div
          ref={useReveal<HTMLDivElement>()}
          className="reveal mt-12 comic-outline overflow-hidden bg-white"
        >
          <img
            src={awards}
            alt="AtumX awards and recognition: NIDHI PRAYAS, EDII-TN, TiE Chennai, Wadhwani Foundation, TIDCO, Government of Tamil Nadu"
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {BADGES.map((b) => (
            <span
              key={b}
              className="comic-outline-sm bg-surface-1 px-3.5 py-1.5 text-[12px] font-bold uppercase tracking-wide text-ink"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
