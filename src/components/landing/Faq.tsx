import { useState } from "react";
import { Plus } from "lucide-react";
import { useReveal } from "@/hooks/use-reveal";
import { useT } from "@/i18n";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal<HTMLDivElement>();
  const f = useT().faq;
  return (
    <section id="faq" className="mt-28 scroll-mt-20 border-y border-wb-line bg-wb-bench py-28 font-ui text-wb-ink sm:mt-36 sm:py-36">
      <div ref={ref} className="reveal mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-key text-[12px] uppercase tracking-[0.14em] text-wb-ink-3">{f.eyebrow}</p>
          <h2
            className="mt-4 font-brand font-bold text-wb-ink"
            style={{ fontSize: "clamp(32px, 4.2vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.045em" }}
          >
            {f.title}
          </h2>
        </div>

        <div className="wb-panel divide-y divide-wb-line overflow-hidden">
          {f.items.map((item, i) => {
            const isOpen = open === i;
            const id = `faq-${i}`;
            return (
              <div key={i}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={id}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 px-6 py-5 text-start transition-colors hover:bg-wb-bench/60"
                  >
                    <span className="text-[16px] font-semibold text-wb-ink sm:text-[17px]">{item.q}</span>
                    <span
                      aria-hidden
                      className={[
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color,color] duration-300 ease-out-soft",
                        isOpen ? "rotate-45 border-wb-ink bg-wb-ink text-white" : "border-wb-line bg-white text-wb-ink-2",
                      ].join(" ")}
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
                    </span>
                  </button>
                </h3>
                <div
                  id={id}
                  className="grid transition-all duration-300 ease-out-soft"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[44em] px-6 pb-6 text-[15px] leading-[1.7] text-wb-ink-2">{item.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
