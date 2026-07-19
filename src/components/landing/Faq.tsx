import { useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

const QA = [
  {
    q: "Is it really free?",
    a: "Yes. Free during beta. We're a hardware company — the tool is how we say thanks to the maker community.",
  },
  {
    q: "Do I need to download anything?",
    a: "Nope. It runs right in your browser — Chrome, Edge, Firefox or Safari. Just use a computer: Constructa needs a big screen to build big robots.",
  },
  {
    q: "I'm on my phone — can I use it?",
    a: "Constructa is built for a desktop-size screen, so it isn't playable on a phone yet. Drop your email and we'll send you a link to open your workshop on a computer.",
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
    a: "We roll out in small batches. After you sign up, keep an eye on your inbox — your workshop key arrives soon. If you described a robot you'd build, we might build it and feature you.",
  },
  {
    q: "Who is AtumX?",
    a: "A robotics hardware startup based in Chennai, India. Making STEM kits since 2022, used in 500+ schools across four countries. SUBO is our flagship board — Constructa is our workshop in the browser.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-surface-1 halftone-ink pt-40 sm:pt-[160px] pb-40 sm:pb-[160px] mt-40 sm:mt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <span className="comic-tag">❓ FAQ</span>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            Questions, <span className="text-primary">answered</span>.
          </h2>
        </div>

        <div className="mt-16 max-w-[820px] flex flex-col gap-4">
          {QA.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className="comic-outline bg-white overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="font-display text-[17px] sm:text-[20px] font-bold text-foreground">
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[2.5px] border-ink bg-primary text-white text-[18px] leading-none transition-transform duration-300 ease-out-soft"
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
                    <p className="px-6 pb-6 text-[16px] text-text-secondary leading-[1.7] font-medium">
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
