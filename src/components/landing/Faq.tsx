import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

const QA = [
  {
    q: "Is it really free?",
    a: "Yes. Free forever during beta. We're a hardware company. The tool is how we say thanks to the maker community.",
  },
  {
    q: "Do I need to download anything?",
    a: "No. It runs in your browser. Chrome, Edge, Firefox, Safari. Any laptop.",
  },
  {
    q: "What can I actually build?",
    a: "Any robot you imagine. Wheels, legs, arms, sensors, motors. Free-form 3D building, not pre-built templates. If you can dream it, you can build it.",
  },
  {
    q: "What coding languages does it support?",
    a: "Three. Blockly for beginners. Python for intermediate. C++ for advanced. Same robot, three ways to code it.",
  },
  {
    q: "When do I get access?",
    a: "We're rolling out in batches. After you sign up, you'll get an email within 7 days with your access link. If you described a robot you want to build, we might build it and feature you.",
  },
  {
    q: "Who is AtumX?",
    a: "A robotics hardware startup based in Chennai, India. Making STEM kits since 2022, used in 500+ schools across four countries. SUBO is our flagship board.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-surface-1 pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] mt-40 sm:mt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            FAQ
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Questions, answered.
          </h2>
        </div>

        <div className="mt-16 max-w-[800px]">
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="border-b border-border">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 py-6 text-left"
                >
                  <span className="text-[18px] sm:text-[20px] font-medium text-foreground">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="shrink-0 text-text-secondary text-[18px] leading-none transition-transform duration-300 ease-out-soft"
                    style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-all duration-300 ease-out-soft"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-6 pr-10 text-[16px] text-text-secondary leading-[1.7]">
                      {item.a}
                    </p>
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
