import { useReveal } from "@/hooks/use-reveal";

const STATEMENTS = [
  {
    label: "01 / 05",
    heading: "A four-legged robot that walks.",
    body: "Build the frame. Attach motors at the joints. Code the gait pattern. Watch it figure out balance with real physics.",
  },
  {
    label: "02 / 05",
    heading: "A car that follows a line.",
    body: "Wire IR sensors to the bottom. Read the values. Tell it to turn when it sees black. The classic project, no hardware needed.",
  },
  {
    label: "03 / 05",
    heading: "A robotic arm that picks things up.",
    body: "Stack rotational joints. Add a gripper. Move it with code. Drop the object on purpose. Or by accident.",
  },
  {
    label: "04 / 05",
    heading: "A robot that avoids walls.",
    body: "Ultrasonic sensor on the front. Read the distance. Turn before you hit something. The first algorithm that feels like AI.",
  },
  {
    label: "05 / 05",
    heading: "Whatever you imagine next.",
    body: "A six-wheeled rover. A flying drone frame. A walking spider. A robot dog. The tool doesn't care what you build. Neither do we.",
  },
];

export function RobotGallery() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            The capabilities
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
            }}
          >
            Anything that moves.
            <br />
            <em
              style={{ color: "#FF6B35", fontStyle: "italic", fontWeight: 500 }}
            >
              You build it
            </em>
            .
          </h2>
        </div>

        <div className="mt-24 flex flex-col">
          {STATEMENTS.map((s, i) => (
            <Statement key={s.label} {...s} isFirst={i === 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Statement({
  label,
  heading,
  body,
  isFirst,
}: {
  label: string;
  heading: string;
  body: string;
  isFirst: boolean;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={[
        "reveal grid grid-cols-1 md:grid-cols-10 gap-6 md:gap-8",
        isFirst ? "pt-0" : "pt-20 border-t border-border mt-20",
      ].join(" ")}
    >
      <div className="md:col-span-3">
        <p className="font-mono text-[13px] uppercase tracking-[0.1em] text-[#FF6B35]">
          {label}
        </p>
      </div>
      <div className="md:col-span-7">
        <h3
          className="text-foreground font-medium tracking-tight"
          style={{
            fontSize: "clamp(28px, 3.5vw, 40px)",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {heading}
        </h3>
        <p className="mt-4 text-[17px] text-text-secondary leading-relaxed max-w-[640px]">
          {body}
        </p>
      </div>
    </div>
  );
}
