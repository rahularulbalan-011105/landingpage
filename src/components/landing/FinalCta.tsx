import { useReveal } from "@/hooks/use-reveal";
import { SignupForm } from "./SignupForm";
import { Lines, useT } from "@/i18n";

export function FinalCta() {
  const ref = useReveal<HTMLDivElement>();
  const c = useT().cta;
  return (
    <section id="cta" className="relative overflow-hidden bg-wb-canvas py-28 font-ui text-wb-ink sm:py-36">
      {/* The editor floor again, so the page ends where it started */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="wb-floor" style={{ bottom: "-70%" }} />
      </div>

      <div className="relative mx-auto max-w-[720px] px-5 sm:px-8">
        <div ref={ref} className="reveal wb-panel flex flex-col items-center px-6 py-10 text-center sm:px-12 sm:py-14">
          <p className="font-key text-[12px] uppercase tracking-[0.14em] text-wb-ink-3">{c.eyebrow}</p>
          <h2
            className="mt-4 font-brand font-bold text-wb-ink"
            style={{ fontSize: "clamp(34px, 5vw, 64px)", lineHeight: 1.02, letterSpacing: "-0.045em" }}
          >
            <Lines text={c.title} />
          </h2>
          <p className="mt-5 max-w-[30em] text-[17px] leading-relaxed text-wb-ink-2">{c.body}</p>

          <div className="mt-9 flex w-full justify-center">
            <SignupForm variant="cta" expandable={false} />
          </div>
        </div>
      </div>
    </section>
  );
}
