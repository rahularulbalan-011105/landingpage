import { useReveal } from "@/hooks/use-reveal";
import buildImg from "@/assets/how-build.webp";
import runImg from "@/assets/how-run.webp";
import codeImg from "@/assets/how-code.png";

const STEPS = [
  {
    n: "01",
    name: "Build",
    desc: "Drag shapes into a 3D workspace. Snap parts together. Attach motors, wheels, sensors. There are no templates here — you're starting from nothing every time.",
    image: buildImg,
  },
  {
    n: "02",
    name: "Run",
    desc: "Hit play. Your robot moves based on what you built and what you coded. If your design is bad, it falls. If your design is good, it works. Real physics, no shortcuts.",
    image: runImg,
  },
  {
    n: "03",
    name: "Code",
    desc: "Blockly for beginners. Python for intermediate. C++ for advanced. Pick how you want to talk to your robot. Same robot, three ways to teach it.",
    image: codeImg,
  },
];

export function HowItWorks() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section className="bg-background pt-40 sm:pt-[160px]">
      <div className="mx-auto max-w-[1200px] px-6 sm:px-8">
        <div ref={ref} className="reveal">
          <p className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            How it works
          </p>
          <h2
            className="mt-5 text-foreground font-medium"
            style={{
              fontSize: "clamp(36px, 5.5vw, 64px)",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: "800px",
            }}
          >
            Three steps.
            <br />
            That's the{" "}
            <em
              style={{ color: "#FF6B35", fontStyle: "italic", fontWeight: 500 }}
            >
              whole
            </em>{" "}
            product.
          </h2>
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
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
  name,
  desc,
  image,
}: {
  n: string;
  name: string;
  desc: string;
  image: string;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal group bg-surface-1 border border-border rounded-md p-10 flex flex-col transition-all duration-200 ease-out-soft hover:border-[#404040] hover:-translate-y-0.5"
    >
      <span className="font-mono text-[14px] text-[#FF6B35]">{n}</span>
      <h3 className="mt-8 text-[28px] font-medium text-foreground tracking-tight">
        {name}
      </h3>
      <p className="mt-4 text-[16px] text-text-secondary leading-relaxed">
        {desc}
      </p>
      <div className="mt-8 w-full h-[180px] bg-[#0A0A0A] border border-border rounded-sm flex items-center justify-center overflow-hidden">
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
