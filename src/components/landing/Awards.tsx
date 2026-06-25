import { useReveal } from "@/hooks/use-reveal";
import awards from "@/assets/awards.jpg";

export function Awards() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
              Recognition
            </p>
            <h2
              className="mt-5 text-foreground font-medium"
              style={{
                fontSize: "clamp(32px, 4.5vw, 52px)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
                maxWidth: "720px",
              }}
            >
              Backed by people who{" "}
              <em style={{ color: "#FF6B35", fontStyle: "italic", fontWeight: 500 }}>
                build the future
              </em>
              .
            </h2>
          </div>
          <p className="font-mono text-[12px] uppercase tracking-[0.1em] text-text-tertiary md:text-right max-w-[280px]">
            Awards, grants &amp; partnerships<br />from India's innovation ecosystem
          </p>
        </div>

        <div ref={useReveal<HTMLDivElement>()} className="reveal mt-12 relative rounded-md overflow-hidden border border-border bg-[#F5F5F5]">
          {/* Top corner ticks */}
          <span className="absolute top-2 left-2 h-3 w-3 border-t border-l border-[#FF6B35] z-10" />
          <span className="absolute top-2 right-2 h-3 w-3 border-t border-r border-[#FF6B35] z-10" />
          <span className="absolute bottom-2 left-2 h-3 w-3 border-b border-l border-[#FF6B35] z-10" />
          <span className="absolute bottom-2 right-2 h-3 w-3 border-b border-r border-[#FF6B35] z-10" />

          <img
            src={awards}
            alt="AtumX awards and recognition: NIDHI PRAYAS, EDII-TN, TiE Chennai, Wadhwani Foundation, TIDCO, Government of Tamil Nadu"
            className="w-full h-auto block"
            loading="lazy"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.15em] text-text-tertiary">
          <span>NIDHI PRAYAS</span>
          <span>EDII — Govt. of India</span>
          <span>TiE Chennai</span>
          <span>Wadhwani Foundation</span>
          <span>TIDCO</span>
          <span>Govt. of Tamil Nadu</span>
        </div>
      </div>
    </section>
  );
}
