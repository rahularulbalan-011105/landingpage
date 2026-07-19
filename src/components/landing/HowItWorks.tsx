import { useReveal } from "@/hooks/use-reveal";
import buildImg from "@/assets/how-build.webp";
import runImg from "@/assets/how-run.webp";
import codeImg from "@/assets/how-code.png";

const STEPS = [
  {
    n: "01",
    emoji: "🔧",
    name: "Build",
    desc: "Drag shapes into a 3D workspace. Snap parts together. Attach motors, wheels, sensors. There are no templates here — you're starting from your own imagination every time.",
    image: buildImg,
    tint: "var(--sky)",
  },
  {
    n: "02",
    emoji: "⚡",
    name: "Run",
    desc: "Hit play. Your robot moves based on what you built and what you coded. If your design is wobbly, it falls. If it's clever, it works. Real physics, no shortcuts.",
    image: runImg,
    tint: "var(--accent)",
  },
  {
    n: "03",
    emoji: "💻",
    name: "Code",
    desc: "Blockly for beginners. Python for intermediate. C++ for advanced. Pick how you want to talk to your robot. Same robot, three ways to teach it.",
    image: codeImg,
    tint: "#FFD34E",
  },
];

export function HowItWorks() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <span className="comic-tag">🛠️ How it works</span>
          <h2
            className="mt-5 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              maxWidth: "800px",
            }}
          >
            Three steps.
            <br />
            That's the <span className="text-primary">whole</span> product.
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <StepCard key={s.n} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  n,
  emoji,
  name,
  desc,
  image,
  tint,
}: {
  n: string;
  emoji: string;
  name: string;
  desc: string;
  image: string;
  tint: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal group comic-outline bg-white p-8 flex flex-col transition-transform duration-200 ease-out-soft hover:-translate-y-1"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-ink text-[20px]"
          style={{ background: tint }}
        >
          {emoji}
        </span>
        <span className="font-display text-[15px] font-bold text-text-tertiary">
          Step {n}
        </span>
      </div>
      <h3 className="mt-6 font-display text-[28px] font-extrabold text-foreground tracking-tight">
        {name}
      </h3>
      <p className="mt-4 text-[16px] text-text-secondary leading-relaxed font-medium">
        {desc}
      </p>
      <div className="mt-8 w-full h-[180px] comic-outline-sm bg-surface-1 flex items-center justify-center overflow-hidden">
        <img
          src={image}
          alt={`${name} step preview`}
          className="max-w-full max-h-full object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
}
