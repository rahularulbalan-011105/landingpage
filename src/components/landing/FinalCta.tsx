import { useReveal } from "@/hooks/use-reveal";
import { SignupForm } from "./SignupForm";
import { Mascot } from "./Mascot";

export function FinalCta() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="cta"
      className="relative bg-surface-2 halftone pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] overflow-hidden"
    >
      <div className="relative mx-auto max-w-[760px] px-6 sm:px-8">
        <div ref={ref} className="reveal comic-outline bg-white p-8 sm:p-12 flex flex-col items-center text-center">
          <Mascot size={76} mood="wow" className="animate-bob" />
          <span className="comic-tag mt-4">🎮 Join the beta</span>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(38px, 6vw, 68px)",
              lineHeight: 0.98,
              letterSpacing: "-0.02em",
            }}
          >
            Ready to build
            <br />
            something <span className="text-primary">weird</span>?
          </h2>
          <p
            className="mt-6 text-[18px] sm:text-[20px] text-text-secondary leading-relaxed font-medium"
            style={{ maxWidth: "460px" }}
          >
            Grab your workshop key. Takes ten seconds. Free during beta.
          </p>

          <div className="mt-10 flex justify-center w-full">
            <SignupForm variant="cta" expandable={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
