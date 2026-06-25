import { useReveal } from "@/hooks/use-reveal";

export function WhyWeBuilt() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="why" className="bg-surface-1 pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] mt-40 sm:mt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal max-w-[720px] mx-auto">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            The reason
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Why this exists.
          </h2>

          <div
            className="mt-10 space-y-6 text-foreground"
            style={{
              fontSize: "clamp(18px, 1.7vw, 22px)",
              lineHeight: 1.5,
              fontWeight: 400,
            }}
          >
            <p>
              For four years we've been making robotics kits for schools. Real
              kits, in real classrooms, in 500+ schools across India, the USA,
              UAE, and Australia.
            </p>
            <p>
              Every month, the same thing happens. A kid wants to build a robot.
              They imagine something cool. Then reality hits. They need to find
              the parts. Figure out the wiring. Hope it works. Most quit before
              they finish.
            </p>
            <p>
              So we built the tool we wished existed. Build any robot in your
              browser. Test it with real physics. If it works, build it for
              real. If it doesn't, try something else. No money. No hardware. No
              quitting.
            </p>
          </div>

          <p className="mt-12 text-[15px] italic text-text-secondary">
            — The AtumX team, Chennai
          </p>
        </div>
      </div>
    </section>
  );
}
