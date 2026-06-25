import { useReveal } from "@/hooks/use-reveal";
import { SignupForm } from "./SignupForm";

export function FinalCta() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section
      id="cta"
      className="relative bg-background pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(255,107,53,0.06) 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-[720px] px-6 sm:px-8 text-center">
        <div ref={ref} className="reveal flex flex-col items-center">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            Join the beta
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(40px, 6vw, 72px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
            }}
          >
            Ready to build
            <br />
            something{" "}
            <em
              style={{ color: "#FF6B35", fontStyle: "italic", fontWeight: 500 }}
            >
              weird
            </em>
            ?
          </h2>
          <p
            className="mt-6 text-[18px] sm:text-[20px] text-text-secondary leading-relaxed"
            style={{ maxWidth: "500px" }}
          >
            Get early access. Takes ten seconds. Free during beta.
          </p>

          <div className="mt-12 flex justify-center w-full">
            <SignupForm variant="cta" expandable={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
