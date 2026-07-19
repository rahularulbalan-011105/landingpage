import { useReveal } from "@/hooks/use-reveal";

const ROWS = [
  {
    n: "01",
    emoji: "🎨",
    heading: "Free-form, not pre-built",
    body: "Most robot tools give you templates. We give you a blank 3D canvas. Build any shape. Attach any sensor in any position. Your imagination is the only constraint.",
    tint: "var(--sky)",
  },
  {
    n: "02",
    emoji: "⚙️",
    heading: "Real physics, not animations",
    body: "Your robot walks, falls, drives, flies based on how you actually built it. Wobbly designs fail. Clever designs work. Same as the real world.",
    tint: "var(--accent)",
  },
  {
    n: "03",
    emoji: "🌐",
    heading: "Runs in your browser",
    body: "Open it in Chrome, Edge, Firefox or Safari — no installs, no payments, free during beta. Just bring a computer (Constructa needs a big screen to build big robots).",
    tint: "#FFD34E",
  },
];

export function WhatsDifferent() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <span className="comic-tag">💥 What makes it different</span>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            Three things <span className="text-primary">no other tool does</span>.
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {ROWS.map((r) => (
            <Row key={r.n} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  n,
  emoji,
  heading,
  body,
  tint,
}: {
  n: string;
  emoji: string;
  heading: string;
  body: string;
  tint: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal comic-outline bg-white p-8 flex flex-col transition-transform duration-200 ease-out-soft hover:-translate-y-1"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-ink text-[26px]"
        style={{ background: tint }}
      >
        {emoji}
      </span>
      <h3 className="mt-6 font-display text-[26px] font-extrabold text-foreground tracking-tight">
        {heading}
      </h3>
      <p className="mt-3 text-[16px] text-text-secondary leading-relaxed font-medium">
        {body}
      </p>
    </div>
  );
}
