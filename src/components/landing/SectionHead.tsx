import { useReveal } from "@/hooks/use-reveal";

/** Eyebrow + headline used by every section below the hero (matches HowItWorks). */
export function SectionHead({
  eyebrow,
  title,
  aside,
  className = "",
}: {
  eyebrow: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div>
        <p className="font-key text-[12px] uppercase tracking-[0.14em] text-wb-ink-3">{eyebrow}</p>
        <h2
          className="mt-4 max-w-[16em] font-brand font-bold text-wb-ink"
          style={{ fontSize: "clamp(32px, 4.2vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.045em", textWrap: "balance" }}
        >
          {title}
        </h2>
      </div>
      {aside && <div className="max-w-[300px] text-[14px] leading-relaxed text-wb-ink-3 md:text-right">{aside}</div>}
    </div>
  );
}
