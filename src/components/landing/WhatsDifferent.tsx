import { useReveal } from "@/hooks/use-reveal";

const ROWS = [
  {
    label: "01 Building",
    heading: "Free-form, not pre-built",
    body: "Most robot tools give you templates. We give you a blank 3D canvas. Build any shape. Attach any sensor in any position. Your imagination is the only constraint.",
  },
  {
    label: "02 Physics",
    heading: "Real physics, not animations",
    body: "Your robot walks, falls, drives, flies based on how you actually built it. Bad designs fail. Good designs work. Same as the real world.",
  },
  {
    label: "03 Access",
    heading: "Browser-based, no downloads",
    body: "Open it in Chrome, Edge, Firefox, Safari. Any laptop, any operating system. No installs. No payments. Free during beta.",
  },
];

export function WhatsDifferent() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            What makes it different
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "900px",
            }}
          >
            Three things{" "}
            <em
              style={{ color: "#FF6B35", fontStyle: "italic", fontWeight: 500 }}
            >
              no other tool does
            </em>
            .
          </h2>
        </div>

        <div className="mt-24 flex flex-col">
          {ROWS.map((r, i) => (
            <Row key={r.label} {...r} isLast={i === ROWS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({
  label,
  heading,
  body,
  isLast,
}: {
  label: string;
  heading: string;
  body: string;
  isLast: boolean;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={[
        "reveal grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 py-16",
        isLast ? "" : "border-b border-border",
      ].join(" ")}
    >
      <div className="md:col-span-3">
        <p className="font-mono text-[13px] uppercase tracking-[0.1em] text-[#FF6B35]">
          {label}
        </p>
      </div>
      <div className="md:col-span-8 md:col-start-5">
        <h3 className="text-[28px] sm:text-[32px] font-medium text-foreground tracking-tight">
          {heading}
        </h3>
        <p className="mt-4 text-[18px] text-text-secondary leading-relaxed max-w-[640px]">
          {body}
        </p>
      </div>
    </div>
  );
}
