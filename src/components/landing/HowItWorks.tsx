import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { CarStoryStage, STORY, seg } from "./CarStoryStage";
import { EditorRail, EditorStatusBar, EditorTopBar, ElecPanel, QuickToolsPanel } from "./EditorChrome";
import { useReveal } from "@/hooks/use-reveal";
import { useT } from "@/i18n";

// Step copy (tag, title, body) comes from the translations; only the numbering lives here.
const STEP_NUMBERS = ["01", "02", "03"];
type Step = { n: string; tag: string; title: string; body: string };

// The sketch that "uploads" in step 3, written the way the editor's C++ tab shows it.
const SKETCH = `#include <NewPing.h>

// ====== BO MOTORS ======
int motorL = 5;
int motorR = 6;

// ===== ULTRASONIC ======
NewPing sonar(9, 10);

void loop() {
  int cm = sonar.ping_cm();
  if (cm > 20) forward();
  else turnLeft();
}`;
const SKETCH_LINES = SKETCH.split("\n").length;

// Share of the pinned scroll spent on the opening headline before the car story starts.
const INTRO = 0.2;
/** Space between a step's copy and its editor panel. */
const PANEL_GAP = 24;
const smooth = (t: number) => t * t * (3 - 2 * t);

export function HowItWorks() {
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const codeCardRef = useRef<HTMLDivElement>(null);
  const stageRef = useReveal<HTMLDivElement>(0.5);
  const [p, setP] = useState(0);
  const t = useT();
  const STEPS: Step[] = t.how.steps.map((s, i) => ({ ...s, n: STEP_NUMBERS[i] }));
  const [intro, setIntro] = useState(0);

  useEffect(() => {
    let queued = false;
    const update = () => {
      queued = false;
      const el = trackRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const travel = r.height - window.innerHeight;
      const v = travel > 0 ? Math.min(1, Math.max(0, -r.top / travel)) : 0;
      // first INTRO of the scroll plays the headline handover; the rest drives the car story 0→1
      const story = Math.max(0, (v - INTRO) / (1 - INTRO));
      progressRef.current = story;
      setIntro(Math.min(1, v / INTRO));
      setP(story);
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const active = p >= STORY.stepAt[2] ? 2 : p >= STORY.stepAt[1] ? 1 : 0;
  // Scroll-linked handover: the headline lifts out first, then step 01 and the editor chrome rise in.
  const out = smooth(seg(intro, 0.1, 0.6));
  const inn = smooth(seg(intro, 0.45, 1));
  const chromeStyle = { opacity: inn };
  const chrome = inn < 0.6 ? "pointer-events-none" : "";

  // 0–2 jump to a step; 3 (SIMULATE) jumps to the moment the car starts driving
  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    // land just after each step starts, so its first part is already in motion
    const at = i === 3 ? STORY.code.drive[0] + 0.02 : STORY.stepAt[i] + (i === 0 ? 0 : 0.02);
    window.scrollTo({ top: top + travel * (INTRO + at * (1 - INTRO)), behavior: "smooth" });
  };

  return (
    <section id="how" className="bg-wb-canvas font-ui text-wb-ink">
      {/* Pinned stage: scroll builds, wires and codes the same car */}
      <div ref={trackRef} className="relative" style={{ height: "550svh" }}>
        <div ref={stageRef} className="group sticky top-0 h-[100svh] w-full overflow-hidden">
          <CarStoryStage progressRef={progressRef} sourceRef={codeCardRef} className="absolute inset-0" />

          {/* soft white wash so copy reads over the grid */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden min-[900px]:block"
            style={{ background: "linear-gradient(90deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.75) 30%, rgba(255,255,255,0) 52%)" }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] min-[900px]:hidden"
            style={{ background: "linear-gradient(0deg, #fff 0%, rgba(255,255,255,0.94) 60%, rgba(255,255,255,0) 100%)" }}
          />

          {/* Opening frame: the headline on its own, lifted away by the first scroll */}
          <div
            className="pointer-events-none absolute inset-0 z-30 flex items-center will-change-transform"
            style={{ opacity: 1 - out, transform: `translateY(${-out * 64}px) scale(${1 - out * 0.04})`, visibility: out >= 1 ? "hidden" : "visible" }}
          >
            <div className="mx-auto w-full max-w-[1320px] px-5 sm:px-8">
              <h2
                className="max-w-[11em] font-brand font-bold text-wb-ink"
                style={{ fontSize: "clamp(44px, 7.2vw, 116px)", lineHeight: 0.98, letterSpacing: "-0.05em", textWrap: "balance" }}
              >
                {t.how.title}
              </h2>
              <p
                className="mt-6 max-w-[34em] text-wb-ink-2"
                style={{ fontSize: "clamp(17px, 1.45vw, 21px)", lineHeight: 1.55, textWrap: "pretty" }}
              >
                {t.how.sub}
              </p>
            </div>
          </div>

          <div
            className="pointer-events-none relative z-10 mx-auto flex h-full max-w-[1320px] px-5 sm:px-8"
            style={{ opacity: inn, transform: `translateY(${(1 - inn) * 32}px)` }}
          >
            {/* on desktop the copy lives between the site header and the editor status bar */}
            <div className="absolute inset-y-0 left-5 right-5 sm:left-8 sm:right-8 min-[900px]:bottom-[44px] min-[900px]:right-auto min-[900px]:top-[88px] min-[900px]:w-[440px]">
              {STEPS.map((s, i) => (
                <StepCopy key={s.n} step={s} visible={active === i}>
                  {i === 0 && <QuickToolsPanel p={p} />}
                  {i === 1 && <ElecPanel p={p} />}
                  {i === 2 && <CodeCard p={p} cardRef={codeCardRef} />}
                </StepCopy>
              ))}
            </div>
          </div>

          {/* The editor's own chrome wraps the stage: top bar, icon rail, status bar */}
          <div className="pointer-events-none absolute inset-x-0 top-[90px] z-20 hidden justify-center min-[1100px]:flex" style={chromeStyle}>
            <EditorTopBar p={p} />
          </div>
          <div className={`absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 min-[1100px]:block ${chrome}`} style={chromeStyle}>
            <EditorRail active={active} p={p} onPick={goTo} onSimulate={() => goTo(3)} />
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 hidden min-[1100px]:block" style={chromeStyle}>
            <EditorStatusBar p={p} />
          </div>

          {/* Step pill for smaller screens, styled like the hero's robot picker */}
          <div className={`absolute inset-x-0 bottom-0 z-20 h-[84px] min-[1100px]:hidden ${chrome}`} style={chromeStyle}>
            <div className="mx-auto flex h-full max-w-[1320px] items-center px-5 sm:px-8">
              <div
                role="group"
                aria-label={t.how.stepsLabel}
                className="relative flex items-center gap-1 rounded-[14px] border border-wb-line bg-white/85 p-1 backdrop-blur"
              >
                {STEPS.map((s, i) => (
                  <button
                    key={s.n}
                    type="button"
                    aria-pressed={active === i}
                    onClick={() => goTo(i)}
                    className={[
                      "whitespace-nowrap rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors sm:px-3.5",
                      active === i ? "bg-wb-ink text-white" : "text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink",
                    ].join(" ")}
                  >
                    <span className="font-key text-[11px] opacity-60">{s.n}</span> {s.tag}
                  </button>
                ))}
                <span aria-hidden className="absolute -bottom-2 left-2 right-2 h-[2px] overflow-hidden rounded-full bg-wb-line">
                  <span className="block h-full origin-left bg-wb-orange" style={{ transform: `scaleX(${p})` }} />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepCopy({
  step,
  visible,
  children,
}: {
  step: Step;
  visible: boolean;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState({ scale: 1, h: 0 });

  // On short desktop screens, shrink the editor panel so the whole step fits above the status bar.
  useEffect(() => {
    const root = rootRef.current;
    const text = textRef.current;
    const panel = panelRef.current;
    if (!root || !text || !panel) return;
    const measure = () => {
      const h = panel.offsetHeight; // layout height, unaffected by the transform
      if (window.innerWidth < 900 || !h) return setFit({ scale: 1, h });
      const room = root.clientHeight - text.offsetHeight - PANEL_GAP;
      setFit({ scale: Math.max(0.6, Math.min(1, room / h)), h });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(text); // re-fit when the copy changes length (e.g. switching language)
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden={!visible}
      className={[
        // phone: pinned above the step pill; desktop: centred in the free band, top-aligned if it can't fit
        "absolute inset-x-0 bottom-[104px] min-[900px]:inset-y-0 min-[900px]:flex min-[900px]:flex-col min-[900px]:[justify-content:safe_center]",
        "transition-[opacity,transform] duration-500 ease-out",
        visible ? "opacity-100" : "translate-y-3 opacity-0",
      ].join(" ")}
    >
      <div ref={textRef}>
        <p className="font-key text-[12px] text-wb-ink-3">
          {step.n} / {step.tag}
        </p>
        <h3
          className="mt-3 font-brand font-bold text-wb-ink"
          style={{ fontSize: "clamp(34px, 4.4vw, 62px)", lineHeight: 1.02, letterSpacing: "-0.045em" }}
        >
          {step.title}
        </h3>
        <p
          className="mt-4 max-w-[30em] text-wb-ink-2"
          style={{ fontSize: "clamp(15px, 1.2vw, 17px)", lineHeight: 1.6, textWrap: "pretty" }}
        >
          {step.body}
        </p>
      </div>
      <div
        ref={panelRef}
        className="hidden origin-top-left min-[900px]:block"
        style={{
          marginTop: PANEL_GAP,
          transform: fit.scale < 1 ? `scale(${fit.scale})` : undefined,
          // give back the space the scale-down frees, so centring stays honest
          marginBottom: fit.scale < 1 ? -(1 - fit.scale) * fit.h : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** CODE step: the editor's C++ Coding view — dark sketch, line numbers, the green Run bar. */
function CodeCard({ p, cardRef }: { p: number; cardRef: React.Ref<HTMLDivElement> }) {
  const typed = Math.floor(SKETCH.length * seg(p, STORY.code.type[0], STORY.code.type[1]));
  const up = seg(p, STORY.code.upload[0], STORY.code.upload[1]);
  const running = p >= STORY.code.upload[1];
  const lines = SKETCH.slice(0, typed).split("\n");

  const status = running ? "Running" : up > 0 ? "Uploading" : typed < SKETCH.length && typed > 0 ? "Editing" : "Idle";

  return (
    <div
      ref={cardRef}
      className="w-[380px] overflow-hidden rounded-[18px] border border-wb-line bg-white shadow-[0_18px_40px_-18px_rgba(28,36,33,0.3)]"
    >
      {/* header: title, the two coding modes, run status */}
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <span className="text-[13.5px] font-bold text-wb-ink">C++ Coding</span>
        <span className="text-[11px] text-wb-ink-3">Arduino sketch</span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] text-wb-ink-2">
          <span
            className={[
              "h-2 w-2 rounded-full",
              running ? "bg-[#22B35E]" : up > 0 ? "animate-pulse bg-wb-orange" : "bg-[#C5CCD3]",
            ].join(" ")}
          />
          {status}
        </span>
      </div>
      <div className="flex gap-1.5 px-3.5 pb-2.5">
        {["Block Coding", "C++ Coding"].map((t) => (
          <span
            key={t}
            className={[
              "rounded-full px-3 py-1 text-[12px] font-semibold",
              t === "C++ Coding" ? "bg-wb-orange text-white" : "bg-[#EEF1F5] text-wb-ink",
            ].join(" ")}
          >
            {t}
          </span>
        ))}
      </div>

      {/* the sketch */}
      <div className="flex h-[262px] overflow-hidden bg-[#030617] py-2.5 font-key text-[12px] leading-[1.6]">
        <div className="w-9 shrink-0 select-none pr-2 text-right font-key text-[#4B5874]">
          {Array.from({ length: SKETCH_LINES }, (_, i) => (
            <div key={i} className={i < lines.length ? "" : "opacity-0"}>
              {i + 1}
            </div>
          ))}
        </div>
        <pre className="min-w-0 flex-1 overflow-hidden pl-2 pr-3 font-key text-[12px] leading-[1.6] text-[#7EE2A0]">
          {lines.map((ln, i) => (
            <div key={i} className="whitespace-pre">
              {ln || " "}
              {i === lines.length - 1 && !running && (
                <span className="inline-block h-[1.05em] w-[7px] translate-y-[2px] animate-pulse bg-[#7EE2A0]" />
              )}
            </div>
          ))}
        </pre>
      </div>

      {/* Run bar */}
      <div className="p-2.5">
        <div className="relative flex h-10 items-center justify-center gap-2 overflow-hidden rounded-[8px] bg-[#177A3C] text-[13.5px] font-semibold text-white">
          {up > 0 && !running && (
            <span className="absolute inset-y-0 left-0 bg-[#22A653]" style={{ width: `${Math.round(up * 100)}%` }} />
          )}
          <span className="relative inline-flex items-center gap-2">
            <Play className="h-3.5 w-3.5 fill-current" />
            {running ? "Running on Arduino UNO" : up > 0 ? `Uploading… ${Math.round(up * 100)}%` : "Run"}
          </span>
        </div>
      </div>
    </div>
  );
}
