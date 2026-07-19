import { useReveal } from "@/hooks/use-reveal";

const STATEMENTS = [
  {
    n: "01",
    emoji: "🦿",
    heading: "A four-legged robot that walks.",
    body: "Build the frame. Attach motors at the joints. Code the gait pattern. Watch it figure out balance with real physics.",
    tint: "var(--sky)",
  },
  {
    n: "02",
    emoji: "🏎️",
    heading: "A car that follows a line.",
    body: "Wire IR sensors to the bottom. Read the values. Tell it to turn when it sees black. The classic project, no hardware needed.",
    tint: "#FFD34E",
  },
  {
    n: "03",
    emoji: "🦾",
    heading: "A robotic arm that picks things up.",
    body: "Stack rotational joints. Add a gripper. Move it with code. Drop the object on purpose. Or by accident.",
    tint: "var(--accent)",
  },
  {
    n: "04",
    emoji: "🧱",
    heading: "A robot that avoids walls.",
    body: "Ultrasonic sensor on the front. Read the distance. Turn before you hit something. The first algorithm that feels like AI.",
    tint: "#7BD389",
  },
  {
    n: "05",
    emoji: "✨",
    heading: "Whatever you imagine next.",
    body: "A six-wheeled rover. A flying drone frame. A walking spider. A robot dog. The tool doesn't care what you build. Neither do we.",
    tint: "var(--sky)",
  },
];

export function RobotGallery() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <span className="comic-tag">🤖 The capabilities</span>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            Anything that moves.
            <br />
            <span className="text-primary">You build it.</span>
          </h2>
        </div>

        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {STATEMENTS.map((s, i) => (
            <Statement key={s.n} {...s} wide={i === STATEMENTS.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Statement({
  n,
  emoji,
  heading,
  body,
  tint,
  wide,
}: {
  n: string;
  emoji: string;
  heading: string;
  body: string;
  tint: string;
  wide: boolean;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={[
        "reveal comic-outline bg-white p-8 flex flex-col transition-transform duration-200 ease-out-soft hover:-translate-y-1",
        wide ? "sm:col-span-2" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-ink text-[22px]"
          style={{ background: tint }}
        >
          {emoji}
        </span>
        <span className="font-display text-[15px] font-bold text-text-tertiary">
          {n} / 05
        </span>
      </div>
      <h3
        className="mt-5 font-display text-foreground font-extrabold tracking-tight"
        style={{ fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.08 }}
      >
        {heading}
      </h3>
      <p className="mt-3 text-[16px] text-text-secondary leading-relaxed font-medium max-w-[640px]">
        {body}
      </p>
    </div>
  );
}
