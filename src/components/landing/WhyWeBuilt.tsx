import { useReveal } from "@/hooks/use-reveal";
import { Mascot } from "./Mascot";

export function WhyWeBuilt() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="why"
      className="bg-surface-1 halftone-ink pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] mt-40 sm:mt-[160px]"
    >
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal max-w-[760px] mx-auto">
          <div className="flex items-center gap-3">
            <span className="comic-tag">💡 The reason</span>
            <Mascot size={40} mood="happy" className="animate-bob hidden sm:block" />
          </div>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            Why this <span className="text-primary">exists</span>.
          </h2>

          <div className="mt-10 comic-outline bg-white p-8 sm:p-10">
            <div
              className="space-y-6 text-foreground font-medium"
              style={{
                fontSize: "clamp(17px, 1.6vw, 21px)",
                lineHeight: 1.5,
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
                the parts. Figure out the wiring. Hope it works.{" "}
                <span className="text-primary font-bold">Most quit before they finish.</span>
              </p>
              <p>
                So we built the tool we wished existed. Build any robot in your
                browser. Test it with real physics. If it works, build it for
                real. If it doesn't, try something else. No money. No hardware. No
                quitting.
              </p>
            </div>

            <p className="mt-8 text-[15px] font-bold text-text-secondary">
              — The AtumX team, Chennai
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
