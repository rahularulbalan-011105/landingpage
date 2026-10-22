import { useReveal } from "@/hooks/use-reveal";

const FACTS = [
  { value: "500+", label: "schools using our kits" },
  { value: "4", label: "countries: India, USA, UAE, Australia" },
  { value: "2022", label: "making robotics kits since" },
];

export function WhyWeBuilt() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="why" className="mt-28 scroll-mt-20 border-y border-wb-line bg-wb-bench py-28 font-ui text-wb-ink sm:mt-36 sm:py-36">
      <div ref={ref} className="reveal mx-auto grid max-w-[1320px] gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div>
          <p className="font-key text-[12px] uppercase tracking-[0.14em] text-wb-ink-3">Why this exists</p>
          <h2
            className="mt-4 font-brand font-bold text-wb-ink"
            style={{ fontSize: "clamp(32px, 4.2vw, 60px)", lineHeight: 1.05, letterSpacing: "-0.045em", textWrap: "balance" }}
          >
            Most people quit before the robot works.
          </h2>

          <dl className="mt-12 grid grid-cols-3 gap-x-6 border-t border-wb-line pt-8">
            {FACTS.map((f) => (
              <div key={f.value} className="flex flex-col">
                <dt className="order-last mt-2 text-[13px] leading-snug text-wb-ink-3">{f.label}</dt>
                <dd
                  className="font-brand font-bold tabular-nums text-wb-ink"
                  style={{ fontSize: "clamp(24px, 2.4vw, 34px)", letterSpacing: "-0.04em", lineHeight: 1 }}
                >
                  {f.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div
          className="space-y-6 text-wb-ink-2"
          style={{ fontSize: "clamp(17px, 1.45vw, 20px)", lineHeight: 1.6, textWrap: "pretty" }}
        >
          <p>
            For four years we’ve been making robotics kits for schools. Real kits, in real classrooms, in 500+ schools
            across India, the USA, UAE and Australia.
          </p>
          <p>
            Every month, the same thing happens. Someone wants to build a robot. They imagine something cool. Then reality
            hits. They need to find the parts. Figure out the wiring. Hope it works.{" "}
            <span className="font-semibold text-wb-ink">Most quit before they finish.</span>
          </p>
          <p>
            So we built the tool we wished existed. Build any robot in your browser. Test it with real physics. If it
            works, build it for real. If it doesn’t, try something else. No money. No hardware. No quitting.
          </p>
          <p className="pt-2 text-[14px] text-wb-ink-3">The AtumX team, Chennai</p>
        </div>
      </div>
    </section>
  );
}
