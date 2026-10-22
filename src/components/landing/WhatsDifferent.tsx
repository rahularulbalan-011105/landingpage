import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, Play, Square } from "lucide-react";
import { SectionHead } from "./SectionHead";
import { useT } from "@/i18n";

type CardKey = "physics" | "price" | "wiring" | "code" | "canvas" | "laptop";

/**
 * Features as a bento grid of tiny working pieces of Constructa.
 * Each tile plays once when it scrolls into view and replays on hover.
 */

const prefersReduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Steps 0..n on a timeline, started when the tile scrolls into view. */
function useSequence(delays: number[]) {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);
  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (prefersReduced()) return setStep(delays.length);
    setStep(0);
    let t = 0;
    delays.forEach((d, i) => {
      t += d;
      timers.current.push(window.setTimeout(() => setStep(i + 1), t));
    });
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          run();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.current.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, step, replay: run };
}

/** Smoothly animates a number toward `target`. */
function useTween(target: number, ms: number, ease: (k: number) => number = (k) => 1 - Math.pow(1 - k, 3)) {
  const [v, setV] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (prefersReduced()) {
      from.current = target;
      return setV(target);
    }
    const start = from.current;
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      const val = start + (target - start) * ease(k);
      from.current = val;
      setV(val);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);
  return v;
}

const GRID: CSSProperties = {
  backgroundImage: "linear-gradient(var(--wb-grid) 1px, transparent 1px), linear-gradient(90deg, var(--wb-grid) 1px, transparent 1px)",
  backgroundSize: "26px 26px",
  backgroundPosition: "center",
};

function Shell({
  seqRef,
  onEnter,
  className = "",
  visualClass = "h-[220px]",
  copy,
  children,
}: {
  seqRef?: React.Ref<HTMLElement>;
  onEnter?: () => void;
  className?: string;
  visualClass?: string;
  /** Which card's title and line to show from the translations. */
  copy: CardKey;
  children: ReactNode;
}) {
  const { title, line } = useT().features[copy];
  return (
    <article ref={seqRef} onMouseEnter={onEnter} className={`wb-panel flex flex-col overflow-hidden rounded-[22px] ${className}`}>
      <div className={`relative overflow-hidden border-b border-wb-line bg-wb-bench ${visualClass}`} style={GRID}>
        {children}
      </div>
      <div className="p-6 sm:p-7">
        <h3 className="font-brand text-[22px] font-bold leading-tight text-wb-ink" style={{ letterSpacing: "-0.035em" }}>
          {title}
        </h3>
        <p className="mt-2 text-[15px] leading-[1.55] text-wb-ink-2" style={{ textWrap: "pretty" }}>
          {line}
        </p>
      </div>
    </article>
  );
}

export function WhatsDifferent() {
  const f = useT().features;
  return (
    <section id="features" className="scroll-mt-20 bg-wb-canvas pt-28 font-ui text-wb-ink sm:pt-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHead eyebrow={f.eyebrow} title={f.title} aside={f.aside} />

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <PhysicsTile />
          <PriceTile />
          <WiringTile />
          <CodeTile />
          <CanvasTile />
          <LaptopTile />
        </div>
      </div>
    </section>
  );
}

// ── ① Physics: the editor's SIMULATE panel. Pick a world and watch the robot react ──

type Env = "earth" | "moon" | "mars" | "zero";
const ENVS: { key: Env; label: string; dot: string; g: number }[] = [
  { key: "earth", label: "Earth", dot: "#2E9BD6", g: 9.81 },
  { key: "moon", label: "Moon", dot: "#E2B54A", g: 1.62 },
  { key: "mars", label: "Mars", dot: "#E5484D", g: 3.71 },
  { key: "zero", label: "Zero-G", dot: "#8A94A0", g: 0 },
];

function PhysicsTile() {
  const [env, setEnv] = useState<Env>("mars");
  const [running, setRunning] = useState(false);
  const touched = useRef(false);
  const ref = useRef<HTMLElement>(null);
  const bodyRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);
  const live = useRef({ env: "mars" as Env, running: false });
  live.current = { env, running };

  // Autoplay once: start the sim on Mars, tour the Moon and Zero-G, then settle back on Mars.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const timers: number[] = [];
    let started = false;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || started) return;
        started = true;
        const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => !touched.current && fn(), ms));
        at(700, () => setRunning(true));
        at(1900, () => setEnv("moon"));
        at(4300, () => setEnv("zero"));
        at(8200, () => setEnv("mars"));
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      timers.forEach(clearTimeout);
    };
  }, []);

  // Robot motion: stands on Earth, hops on Moon/Mars, drifts and tumbles in Zero-G.
  useEffect(() => {
    if (prefersReduced()) return;
    let raf = 0;
    let y = 0;
    let rot = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const t = (now - t0) / 1000;
      const { env: e, running: r } = live.current;
      let ty = 0;
      let tr = 0;
      if (r && e === "moon") ty = -34 * Math.abs(Math.sin(t * 1.15));
      if (r && e === "mars") ty = -14 * Math.abs(Math.sin(t * 2.1));
      if (r && e === "zero") {
        ty = -70 + 7 * Math.sin(t * 0.9);
        tr = -24 + 5 * Math.sin(t * 0.6);
      }
      // smaller moves on phones, where the robot sits in a short strip above the panel
      if (window.innerWidth < 640) ty *= 0.4;
      const k = e === "zero" ? 0.025 : 0.2;
      y += (ty - y) * k;
      rot += (tr - rot) * 0.04;
      bodyRef.current?.setAttribute("transform", `translate(0 ${y.toFixed(2)}) rotate(${rot.toFixed(2)} 210 150)`);
      const lift = Math.min(1, -y / 80);
      if (shadowRef.current) {
        shadowRef.current.setAttribute("rx", String(92 - 44 * lift));
        shadowRef.current.setAttribute("opacity", String(1 - 0.75 * lift));
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const g = ENVS.find((x) => x.key === env)!.g;
  const pick = (fn: () => void) => () => {
    touched.current = true;
    fn();
  };

  return (
    <Shell
      seqRef={ref}
      className="md:col-span-2 lg:row-span-2"
      visualClass="h-[520px] sm:h-[420px] lg:h-auto lg:min-h-[420px] lg:flex-1"
      copy="physics"
    >
      {/* the crawler, side view */}
      <svg viewBox="0 0 420 250" className="absolute inset-x-0 top-2 h-[42%] w-full sm:inset-y-0 sm:top-0 sm:h-full sm:w-[62%]" aria-hidden>
        <line x1="0" y1="214" x2="420" y2="214" stroke="var(--wb-axis)" strokeOpacity="0.55" strokeWidth="1.5" />
        <ellipse ref={shadowRef} cx="210" cy="217" rx="92" ry="5" fill="rgba(20,26,23,0.13)" />
        <g ref={bodyRef}>
          {[150, 270].map((hx, i) => (
            <g key={hx}>
              <line x1={hx} y1="150" x2={hx + (i ? 18 : -18)} y2="182" stroke="#2453D6" strokeWidth="11" strokeLinecap="round" />
              <line x1={hx + (i ? 18 : -18)} y1="182" x2={hx + (i ? 6 : -6)} y2="208" stroke="#2453D6" strokeWidth="9" strokeLinecap="round" />
              <circle cx={hx} cy="150" r="10" fill="#1A1F22" />
            </g>
          ))}
          <rect x="112" y="104" width="196" height="48" rx="8" fill="#C4242E" />
          <rect x="112" y="104" width="196" height="9" rx="4" fill="#D94048" />
          <rect x="148" y="94" width="78" height="12" rx="2" fill="#1C5FA6" />
          <rect x="236" y="95" width="34" height="11" rx="2" fill="#0F1C42" />
          <path d="M168 94 L172 80 L186 80 L190 94 Z" fill="#141A17" />
          <rect x="306" y="114" width="8" height="30" rx="2" fill="#1F4FD8" />
          <circle cx="324" cy="121" r="8" fill="#D9DEE2" />
          <circle cx="324" cy="138" r="8" fill="#D9DEE2" />
        </g>
      </svg>

      {/* the editor's SIMULATE panel */}
      <div className="absolute inset-x-3 bottom-3 rounded-[16px] border border-wb-line bg-white/96 p-3.5 shadow-[0_14px_30px_-16px_rgba(28,36,33,0.35)] backdrop-blur sm:inset-x-auto sm:bottom-auto sm:right-5 sm:top-5 sm:w-[236px]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#FFF0E9] text-wb-orange">
            <Play className="h-3.5 w-3.5 fill-current" />
          </span>
          <span className="text-[13px] font-bold tracking-[0.02em] text-wb-ink">SIMULATE</span>
          <span className="text-[11.5px] text-wb-ink-3">/ Simulator</span>
        </div>
        <div className="mt-2.5 flex gap-1">
          {["Simulator", "Robot", "Physics"].map((t, i) => (
            <span key={t} className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${i === 0 ? "bg-wb-orange text-white" : "bg-[#EEF1F5] text-wb-ink"}`}>
              {t}
            </span>
          ))}
        </div>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-wb-ink-3">Simulation</p>
        <button
          type="button"
          onClick={pick(() => setRunning((r) => !r))}
          className={`mt-1.5 flex h-9 w-full items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold transition-colors ${
            running ? "bg-[#ECC23A] text-wb-ink" : "bg-wb-orange text-white"
          }`}
        >
          {running ? <Square className="h-3 w-3 fill-current" /> : <Play className="h-3.5 w-3.5 fill-current" />}
          {running ? "Stop Simulation" : "Start Simulation"}
        </button>
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-wb-ink-3">Environment</p>
        <div role="group" aria-label="Environment" className="mt-1.5 grid grid-cols-2 gap-1.5">
          {ENVS.map((e) => (
            <button
              key={e.key}
              type="button"
              aria-pressed={env === e.key}
              onClick={pick(() => {
                setEnv(e.key);
                setRunning(true);
              })}
              className={`flex h-8 items-center gap-2 rounded-[9px] px-2.5 text-[12.5px] font-semibold transition-colors ${
                env === e.key ? "bg-wb-orange text-white" : "bg-[#F4F6F8] text-wb-ink hover:bg-[#E9EDF1]"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: env === e.key ? "#fff" : e.dot }} />
              {e.label}
            </button>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] text-wb-ink-3">
          Gravity: <span className="font-key text-wb-ink-2">{g.toFixed(2)} m/s²</span>
        </p>
      </div>
    </Shell>
  );
}

// ── ② No parts to buy: a kit receipt gets crossed out, ₹0 stamps on top ──

const RECEIPT = [
  ["Servo motors ×4", "₹1,200"],
  ["Arduino Uno", "₹750"],
  ["Ultrasonic + IR sensors", "₹350"],
  ["Chassis + wheels", "₹900"],
  ["Battery, wires, breadboard", "₹800"],
];

function PriceTile() {
  const { ref, step, replay } = useSequence([200, 130, 130, 130, 130, 260, 450, 420]);
  const n = RECEIPT.length;
  return (
    <Shell seqRef={ref} onEnter={replay} copy="price">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[78%] max-w-[270px] rounded-[10px] bg-white px-4 py-3 font-key text-[11px] text-wb-ink-2 shadow-sm">
          <p className="mb-1.5 text-[10px] uppercase tracking-[0.12em] text-wb-ink-3">Typical starter kit</p>
          {RECEIPT.map(([item, price], i) => (
            <div key={item} className="flex justify-between py-[2px] transition-opacity duration-300" style={{ opacity: step > i ? 1 : 0 }}>
              <span>{item}</span>
              <span>{price}</span>
            </div>
          ))}
          <div
            className="relative mt-1.5 flex justify-between border-t border-dashed border-wb-line pt-1.5 text-[12.5px] font-semibold text-wb-ink transition-opacity duration-300"
            style={{ opacity: step > n ? 1 : 0 }}
          >
            <span>Total</span>
            <span className="relative">
              ₹4,000
              <span
                className="absolute left-[-4px] right-[-4px] top-1/2 h-[2px] origin-left bg-[#E5484D] transition-transform duration-300"
                style={{ transform: `scaleX(${step > n + 1 ? 1 : 0})` }}
              />
            </span>
          </div>
          <span
            className="absolute -right-3 -top-4 rounded-[10px] border-2 border-wb-orange bg-white px-2.5 py-1 font-brand text-[24px] font-bold text-wb-orange shadow-md transition-all duration-300"
            style={{ opacity: step > n + 2 ? 1 : 0, transform: step > n + 2 ? "rotate(-8deg) scale(1)" : "rotate(-8deg) scale(1.6)" }}
          >
            ₹0
          </span>
        </div>
      </div>
    </Shell>
  );
}

// ── ③ Wiring: a wire draws pin to pin, then the sensor pings ──

function WiringTile() {
  const { ref, step, replay } = useSequence([350, 1000]);
  return (
    <Shell seqRef={ref} onEnter={replay} copy="wiring">
      <svg viewBox="0 0 320 220" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* Arduino */}
        <rect x="26" y="70" width="112" height="76" rx="8" fill="#138C8C" />
        <rect x="38" y="72" width="88" height="7" rx="2" fill="#0B5F5F" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={42 + i * 10.5} y="73.5" width="5" height="4" fill="#E2B54A" />
        ))}
        <text x="82" y="117" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" letterSpacing="1.4">ARDUINO</text>
        {/* Ultrasonic */}
        <rect x="196" y="96" width="98" height="52" rx="7" fill="#1F4FD8" />
        <circle cx="224" cy="118" r="13" fill="#E8ECEF" />
        <circle cx="266" cy="118" r="13" fill="#E8ECEF" />
        <circle cx="224" cy="118" r="6" fill="#6E7A84" />
        <circle cx="266" cy="118" r="6" fill="#6E7A84" />
        {/* wire */}
        <path
          d="M110 76 C 120 30, 210 30, 232 98"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="3.5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray="1"
          style={{ strokeDashoffset: step >= 1 ? 0 : 1, transition: step >= 1 ? "stroke-dashoffset 900ms ease-in-out" : "none" }}
        />
        <circle cx="110" cy="76" r="4" fill="#FF6B35" opacity={step >= 1 ? 1 : 0} />
        <circle cx="232" cy="98" r="4" fill="#FF6B35" opacity={step >= 2 ? 1 : 0} />
        {/* ping */}
        {step >= 2 &&
          [0, 1, 2].map((i) => (
            <path
              key={i}
              d="M300 96 Q 316 120 300 146"
              fill="none"
              stroke="#2FB36B"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="wb-ping"
              style={{ animationDelay: `${i * 220}ms` }}
            />
          ))}
      </svg>
      <span
        className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[12px] font-semibold text-wb-axis shadow-sm transition-opacity duration-300"
        style={{ opacity: step >= 2 ? 1 : 0 }}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} /> Sensor connected · 24 cm
      </span>
    </Shell>
  );
}

// ── ④ Code: blocks on the left become real C++ on the right ──

const BLOCKS = [
  { text: "when started", color: "#F5A623" },
  { text: "repeat forever", color: "#14B8A6" },
  { text: "servo pin 9 → 90°", color: "#3B82F6", indent: true },
  { text: "wait 500 ms", color: "#A855F7", indent: true },
];
const CPP = ["void loop() {", "  servo.write(90);", "  delay(500);", "}"];

function CodeTile() {
  const { ref, step, replay } = useSequence([350, 220, 220, 220, 220]);
  return (
    <Shell seqRef={ref} onEnter={replay} copy="code">
      <div className="absolute inset-0 flex items-center justify-center gap-3 px-4">
        <div className="flex w-[46%] flex-col gap-1">
          {BLOCKS.map((b) => (
            <span
              key={b.text}
              className={`rounded-[7px] px-2 py-1.5 text-[10.5px] font-semibold leading-tight text-white shadow-sm ${b.indent ? "ml-3" : ""}`}
              style={{ background: b.color }}
            >
              {b.text}
            </span>
          ))}
        </div>
        <span className="font-key text-[16px] text-wb-ink-3">→</span>
        <pre className="w-[46%] rounded-[10px] bg-[#030617] px-2.5 py-2.5 font-key text-[10.5px] leading-[1.7] text-[#7EE2A0] shadow-sm">
          {CPP.map((ln, i) => (
            <div key={ln} className="whitespace-pre transition-opacity duration-200" style={{ opacity: step > i + 1 ? 1 : 0 }}>
              {ln}
            </div>
          ))}
        </pre>
      </div>
    </Shell>
  );
}

// ── ⑤ Canvas: the editor's Slice tool on a box, with live dimension labels ──

function DimLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <g>
      <rect x={x - 22} y={y - 9} width="44" height="18" rx="5" fill="#fff" stroke="#D5DCE2" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="10" fontFamily="'JetBrains Mono', monospace" fill="#141A17">
        {text}
      </text>
    </g>
  );
}

function CanvasTile() {
  const { ref, step, replay } = useSequence([500, 900, 700, 700]);
  const cutting = step >= 1;
  const split = step >= 2;
  const picked = step >= 3;
  const ease = "transform 600ms cubic-bezier(0.2,0.8,0.2,1)";

  // box: front face 40..280 × 112..158, extruded back by (16,-20); cut runs top 140 → bottom 162
  const red = { top: "#C93A3E", front: "#8E1B22", side: "#6E1419" };
  const pink = { top: "#CF5C95", front: "#9C3A6E", side: "#7E2C58" };
  const whole = !split;
  const leftC = whole || picked ? pink : red;
  const rightC = whole ? pink : red;

  return (
    <Shell seqRef={ref} onEnter={replay} copy="canvas">
      <svg viewBox="0 0 320 220" className="absolute inset-0 h-full w-full" aria-hidden>
        {/* left piece */}
        <g style={{ transform: split ? "translateX(-12px)" : "none", transition: ease }}>
          <polygon points="40,112 56,92 156,92 140,112" fill={leftC.top} />
          <polygon points="40,112 140,112 162,158 40,158" fill={leftC.front} />
          {(whole || picked) && <polygon points="40,112 56,92 156,92 140,112 162,158 40,158" fill="none" stroke="#7FD3E0" strokeWidth="1.5" />}
        </g>
        {/* right piece */}
        <g style={{ transform: split ? "translateX(10px)" : "none", transition: ease }}>
          <polygon points="140,112 156,92 296,92 280,112" fill={rightC.top} />
          <polygon points="140,112 280,112 280,158 162,158" fill={rightC.front} />
          <polygon points="280,112 296,92 296,138 280,158" fill={rightC.side} />
          {whole && <polygon points="140,112 156,92 296,92 296,138 280,158 162,158" fill="none" stroke="#7FD3E0" strokeWidth="1.5" />}
        </g>

        {/* slice line with its two handles */}
        <g style={{ opacity: cutting && !picked ? 1 : 0, transition: "opacity 250ms" }}>
          <line x1="146" y1="84" x2="166" y2="168" stroke="#E5484D" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx="146" cy="84" r="6" fill="#fff" stroke="#E5484D" strokeWidth="2" />
          <circle cx="166" cy="168" r="6" fill="#fff" stroke="#E5484D" strokeWidth="2" />
        </g>

        {/* dimensions */}
        {(whole || picked) && (
          <g>
            <line x1="56" y1="74" x2={picked ? 134 : 140} y2="74" stroke="#141A17" strokeWidth="1" />
            <DimLabel x={picked ? 95 : 98} y={74} text="2.00" />
            <line x1={picked ? 28 : 40} y1="180" x2={picked ? 150 : 280} y2="180" stroke="#141A17" strokeWidth="1" strokeDasharray="4 3" />
            <DimLabel x={picked ? 89 : 160} y={180} text={picked ? "5.62" : "11.02"} />
          </g>
        )}
      </svg>
      <span className="absolute bottom-3 right-3 rounded-full bg-white px-2.5 py-1 font-key text-[11px] text-wb-ink-2 shadow-sm">
        {picked ? "Selected: half · 5.62" : split ? "Slice ✓" : cutting ? "Slice: draw a line" : "Box · 11.02 × 2 × 2"}
      </span>
    </Shell>
  );
}

// ── ⑥ Laptop: the editor opens in a browser tab, ready to build ──

function LaptopTile() {
  const { ref, step, replay } = useSequence([300, 700, 700]);
  return (
    <Shell seqRef={ref} onEnter={replay} copy="laptop">
      <div className="absolute inset-0 flex items-center justify-center px-5">
        <div className="w-full max-w-[300px] overflow-hidden rounded-[10px] border border-wb-line bg-white shadow-md">
          <div className="flex items-center gap-1.5 border-b border-wb-line bg-wb-bench px-2.5 py-1.5">
            {["#E5484D", "#F5C518", "#2FB36B"].map((c) => (
              <span key={c} className="h-2 w-2 rounded-full" style={{ background: c }} />
            ))}
            <span className="ml-2 flex-1 overflow-hidden rounded-[6px] bg-white px-2 py-0.5 font-key text-[9.5px] text-wb-ink-2">
              <span
                className="inline-block overflow-hidden whitespace-nowrap align-bottom"
                style={{ width: step >= 1 ? "19ch" : "0ch", transition: step >= 1 ? "width 650ms steps(19)" : "none" }}
              >
                constructa.atumx.in
              </span>
            </span>
          </div>
          {/* the editor's header */}
          <div
            className="flex items-center gap-2 border-b border-wb-line px-2.5 py-1.5 transition-opacity duration-300"
            style={{ opacity: step >= 2 ? 1 : 0 }}
          >
            <span className="font-brand text-[10.5px] font-bold text-wb-orange">Constructa</span>
            <span className="truncate text-[9.5px] text-wb-ink-2">Untitled robot</span>
            <span className="ml-auto rounded-[5px] bg-wb-orange px-1.5 py-0.5 text-[9px] font-semibold text-white">Save</span>
          </div>
          <div className="relative h-[92px]" style={GRID}>
            <span
              className="absolute left-1/2 top-1/2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[12px] font-semibold text-wb-axis shadow-sm transition-all duration-300"
              style={{ opacity: step >= 3 ? 1 : 0, transform: `translate(-50%, ${step >= 3 ? "-50%" : "-30%"})` }}
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} /> Workshop ready
            </span>
          </div>
        </div>
      </div>
    </Shell>
  );
}
