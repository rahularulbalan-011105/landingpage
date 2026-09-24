import { useReveal } from "@/hooks/use-reveal";

const STATEMENTS = [
  {
    n: "01",
    image: "/robots/spider.png",
    heading: "A six-legged spider that walks.",
    body: "A servo on every joint, an OLED and an ultrasonic sensor riding on top. Code the gait and watch all six legs find their rhythm with real physics.",
    tint: "var(--sky)",
  },
  {
    n: "02",
    image: "/robots/car.png",
    heading: "A car that drives on wheels.",
    body: "Two motors, a chassis, a pair of wheels. Give it eyes and a face, then send it rolling across the floor with a few lines of code.",
    tint: "#FFD34E",
  },
  {
    n: "03",
    image: "/robots/gripper.png",
    heading: "A scorpion that grabs with claws.",
    body: "Pointed legs to stand, pincer claws to grab, a curled tail arched overhead. Stack the joints, add the grippers, and pick things up.",
    tint: "var(--accent)",
  },
  {
    n: "04",
    image: "/robots/highfive.png",
    heading: "A robot that waves hello.",
    body: "A servo arm that lifts and an OLED that talks back. Tell it to raise a hand and flash “High five!” — your first robot with personality.",
    tint: "#7BD389",
  },
  {
    n: "05",
    image: "/robots/duck.png",
    heading: "A duck that walks on two legs.",
    body: "Two legs, four servos and a wobbly sense of balance. Or a six-wheeled rover, a robot dog, a flying frame — the tool doesn't care what you build. Neither do we.",
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
  image,
  heading,
  body,
  wide,
}: {
  n: string;
  image: string;
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
        "reveal comic-outline bg-white overflow-hidden flex flex-col transition-transform duration-200 ease-out-soft hover:-translate-y-1",
        wide ? "sm:col-span-2" : "",
      ].join(" ")}
    >
      {/* Robot render banner */}
      <div className="relative border-b-[3px] border-ink bg-white">
        <img
          src={image}
          alt={heading}
          loading="lazy"
          className={[
            "w-full object-cover",
            wide ? "h-[300px] sm:h-[340px]" : "h-[240px]",
          ].join(" ")}
        />
        <span
          className="absolute top-3 left-3 rounded-full border-[3px] border-ink bg-white px-3 py-1 font-display text-[13px] font-bold text-ink"
        >
          {n} / 05
        </span>
      </div>
      {/* Copy */}
      <div className="p-8 flex flex-col">
        <h3
          className="font-display text-foreground font-extrabold tracking-tight"
          style={{ fontSize: "clamp(24px, 3vw, 34px)", lineHeight: 1.08 }}
        >
          {heading}
        </h3>
        <p className="mt-3 text-[16px] text-text-secondary leading-relaxed font-medium max-w-[640px]">
          {body}
        </p>
      </div>
    </div>
  );
}
