import { lazy, Suspense, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Mascot } from "@/components/landing/Mascot";
import { HOME_TOUR, COMMUNITY_TOUR, type GuideStep } from "./guideSteps";
import type { BoltAction } from "./Bolt3D";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

// three.js is only fetched on the dashboard, after the page is interactive.
const Bolt3D = lazy(() => import("./Bolt3D"));

type TourKey = "home" | "community";
const TOURS: Record<TourKey, GuideStep[]> = { home: HOME_TOUR, community: COMMUNITY_TOUR };
const FLY_MS = 900;

// Who gets the tour automatically: ONLY brand-new accounts (created since the
// guide launched), once per tour, remembered on the ACCOUNT (Supabase user
// metadata) so it never auto-plays again on any device. Existing users who log
// in never get it automatically — they can tap Bolt / "Tour with Bolt" anytime.
const NEW_ACCOUNTS_SINCE = Date.parse("2026-10-16T00:00:00Z");
const META = (k: TourKey) => `cx_tour_${k}_done`;
const LOCAL = (k: TourKey, uid: string) => `cx_bolt_tour_${k}_${uid}`;

const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string) => { try { localStorage.setItem(k, "1"); } catch { /* private mode */ } };

/** First visible element for a [data-guide] anchor. */
function findAnchor(name: string): HTMLElement | null {
  for (const el of document.querySelectorAll<HTMLElement>(`[data-guide="${name}"]`)) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Layout = { x: number; y: number; dir: -1 | 1; bubble: { x: number; y: number; w: number }; spot: DOMRect | null };

/**
 * Bolt, the dashboard guide. For NEW accounts only, runs the Home tour on their first dashboard visit and
 * the Community tour the first time Community is opened; afterwards he rests on
 * the welcome stage (or in the corner) and replays the right tour when tapped.
 * Fires/answers the window event "cx-bolt-start" so page buttons can start a tour.
 */
export function BoltGuide({ context }: { context: "home" | "mine" | "community" }) {
  const tourKey: TourKey = context === "community" ? "community" : "home";
  const [mounted, setMounted] = useState(false);
  const [running, setRunning] = useState<TourKey | null>(null);
  const [idx, setIdx] = useState(0);
  const [layout, setLayout] = useState<Layout | null>(null);
  const [animate, setAnimate] = useState(false);
  const [moving, setMoving] = useState(false);
  const [typed, setTyped] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const dirRef = useRef<1 | -1>(1);
  const prevPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(max-width: 767px)");
    const on = () => setNarrow(mq.matches);
    on(); mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  const S = narrow ? 104 : 168;
  const steps = running ? TOURS[running] : [];
  const step: GuideStep | undefined = running ? steps[idx] : undefined;

  const { user } = useAuth();
  const isNewAccount = !!user?.created_at && Date.parse(user.created_at) >= NEW_ACCOUNTS_SINCE;
  const shouldAuto = (k: TourKey) =>
    !!user && isNewAccount && !(user.user_metadata as Record<string, unknown> | undefined)?.[META(k)] && !lsGet(LOCAL(k, user.id));

  const markSeen = useCallback((k: TourKey) => {
    if (!user) return;
    lsSet(LOCAL(k, user.id));                                   // instant, this browser
    if (!(user.user_metadata as Record<string, unknown> | undefined)?.[META(k)])
      void supabase.auth.updateUser({ data: { [META(k)]: true } }).catch(() => { /* retried next finish */ });
  }, [user]);

  const finish = useCallback(() => {
    if (running) markSeen(running);
    setRunning(null); setIdx(0);
  }, [running, markSeen]);

  const start = useCallback((k: TourKey) => { setRunning(k); setIdx(0); }, []);

  // Auto-start a tour only for a brand-new account seeing that section for the
  // first time; switching section mid-tour (e.g. clicking Community during the
  // home tour) hands over to that section's tour.
  useEffect(() => {
    if (!mounted || !user) return;
    if (running && running !== tourKey) { markSeen(running); setRunning(null); }
    if (shouldAuto(tourKey) && running !== tourKey) {
      const t = setTimeout(() => start(tourKey), 700);
      return () => clearTimeout(t);
    }
  }, [tourKey, mounted, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e: Event) => start(((e as CustomEvent).detail as TourKey) || tourKey);
    window.addEventListener("cx-bolt-start", h);
    return () => window.removeEventListener("cx-bolt-start", h);
  }, [start, tourKey]);

  // Skip steps whose button isn't on screen (no community posts yet, none of yours…).
  useEffect(() => {
    if (!step?.target) return;
    if (!findAnchor(step.target)) {
      const t = setTimeout(() => {
        if (findAnchor(step.target!)) return;
        if (idx < steps.length - 1) setIdx(idx + 1); else finish();
      }, 600);   // community cards may still be loading
      return () => clearTimeout(t);
    }
  }, [step, idx, steps.length, finish]);

  // ── placement ──────────────────────────────────────────────────────────────
  const compute = useCallback((): Layout | null => {
    const W = window.innerWidth, H = window.innerHeight, pad = 12;
    const bubbleW = Math.min(330, W - 32);
    const clampY = (y: number) => Math.max(84, Math.min(H - S - pad, y));
    if (narrow) {
      const homeSlot = !running && context === "home" ? findAnchor("bolt-home") : null;
      if (homeSlot) {
        const r = homeSlot.getBoundingClientRect();
        return { x: r.left + r.width / 2 - S / 2, y: r.top + r.height / 2 - S / 2, dir: 1, spot: null, bubble: { x: 16, y: r.bottom, w: W - 32 } };
      }
      // Phones during a tour: Bolt sits bottom-left with the bubble above him; the spotlight finds the button.
      const anchor = step?.target ? findAnchor(step.target) : null;
      const spot = anchor ? anchor.getBoundingClientRect() : null;
      const x = 8, y = H - S - 8;
      return { x, y, dir: 1, spot, bubble: { x: 16, y: y - 8, w: W - 32 } };
    }
    let target: DOMRect | null = null, spot: DOMRect | null = null;
    if (step?.target) { const a = findAnchor(step.target); if (a) { target = a.getBoundingClientRect(); spot = target; } }
    if (!target) {
      // Centre stage: the welcome slot on Home, else the middle of the content area.
      const slot = findAnchor("bolt-home");
      if (slot && (!running || running === "home")) {
        const r = slot.getBoundingClientRect();
        const x = r.left + r.width / 2 - S / 2, y = r.top + r.height / 2 - S / 2;
        const bx = x + S + 8 + bubbleW < W - 16 ? x + S + 8 : Math.max(16, x - bubbleW - 8);
        return { x, y, dir: 1, spot: null, bubble: { x: bx, y: y + 10, w: bubbleW } };
      }
      if (!running) return { x: W - S - 20, y: H - S - 16, dir: -1, spot: null, bubble: { x: W - S - 20 - bubbleW - 8, y: H - S - 4, w: bubbleW } };
      const x = Math.max(16, W / 2 - (S + bubbleW) / 2), y = clampY(H / 2 - S / 2);
      return { x, y, dir: 1, spot: null, bubble: { x: x + S + 8, y: y + 10, w: bubbleW } };
    }
    // Next to the button: try right, left, below, above — the first spot where Bolt
    // AND his bubble fit on screen without covering the button he's explaining.
    const BH = 215;   // bubble height (approx.)
    const t = target;
    const cy = t.top + t.height / 2 - S / 2, cx = t.left + t.width / 2 - S / 2;
    const side = (bx: number) => (bx + S + 4 + bubbleW <= W - 8 ? bx + S + 4 : bx - bubbleW - 4);
    // Order: right, below, left, above — "below" before "left" so he never parks on
    // the neighbouring button in a card's button row.
    const cands = [
      { x: t.right + pad, y: cy, bx: (x: number) => x + S + 4 },
      { x: cx, y: t.bottom + pad, bx: side },
      { x: t.left - pad - S, y: cy, bx: (x: number) => x - bubbleW - 4 },
      { x: cx, y: t.top - pad - S, bx: side },
    ];
    const hits = (ax: number, ay: number, aw: number, ah: number) =>
      ax < t.right && ax + aw > t.left && ay < t.bottom && ay + ah > t.top;
    let pick: { x: number; y: number; bx: number; by: number } | null = null;
    for (const c of cands) {
      const x = c.x, y = c.y, bx = c.bx(x), by = Math.max(8, Math.min(H - BH - 8, y + 6));
      const inside = x >= 8 && x + S <= W - 8 && y >= 8 && y + S <= H - 8 && bx >= 8 && bx + bubbleW <= W - 8;
      if (inside && !hits(x, y, S, S) && !hits(bx, by, bubbleW, BH)) { pick = { x, y, bx, by }; break; }
    }
    if (!pick) {   // nothing fits cleanly: stay beside it, clamped to the screen
      const x = Math.max(8, Math.min(W - S - 8, t.right + pad)), y = clampY(cy);
      pick = { x, y, bx: Math.max(8, Math.min(W - bubbleW - 8, side(x))), by: Math.max(8, Math.min(H - BH - 8, y + 6)) };
    }
    const dir: -1 | 1 = t.left + t.width / 2 < pick.x + S / 2 ? -1 : 1;   // point toward the button
    return { x: pick.x, y: pick.y, dir, spot, bubble: { x: pick.bx, y: pick.by, w: bubbleW } };
  }, [step, running, narrow, S, context]);

  // Fly to each new step (scroll its button into view first).
  useLayoutEffect(() => {
    if (!mounted) return;
    const a = step?.target ? findAnchor(step.target) : null;
    if (a) {
      const r = a.getBoundingClientRect();
      if (r.top < 90 || r.bottom > window.innerHeight - 40) a.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    const go = () => {
      const l = compute();
      if (!l) return;
      const p = prevPos.current;
      const travelled = p ? Math.hypot(l.x - p.x, l.y - p.y) : 0;
      if (travelled > 4) {
        dirRef.current = p && l.x < p.x ? -1 : 1;
        setAnimate(true); setMoving(true);
        setTimeout(() => { setMoving(false); setAnimate(false); }, FLY_MS);
      }
      prevPos.current = { x: l.x, y: l.y };
      setLayout(l);
    };
    const t = setTimeout(go, a ? 350 : 0);   // let the smooth scroll settle
    setTyped(0);
    return () => clearTimeout(t);
  }, [step, mounted, running, context, compute]);

  // Follow scrolling / resizing without the flight animation.
  useEffect(() => {
    if (!mounted) return;
    let raf = 0;
    const on = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { const l = compute(); if (l) { prevPos.current = { x: l.x, y: l.y }; setLayout(l); } }); };
    window.addEventListener("resize", on); window.addEventListener("scroll", on, true);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", on); window.removeEventListener("scroll", on, true); };
  }, [mounted, compute]);

  // Typewriter text (Bolt "talks" while it types).
  useEffect(() => {
    if (!step) return;
    const total = step.text.length;
    if (typed >= total) return;
    const t = setTimeout(() => setTyped((n) => Math.min(total, n + 3)), 16);
    return () => clearTimeout(t);
  }, [step, typed]);

  // Keyboard: → next, ← back, Esc closes.
  useEffect(() => {
    if (!running) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft" && idx > 0) setIdx(idx - 1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  });

  const next = () => {
    if (step && typed < step.text.length) { setTyped(step.text.length); return; }   // first press finishes the sentence
    if (idx < steps.length - 1) setIdx(idx + 1); else finish();
  };
  const back = () => {
    // step back over anchors that aren't on screen
    let i = idx - 1;
    while (i > 0 && steps[i].target && !findAnchor(steps[i].target!)) i--;
    setIdx(Math.max(0, i));
  };

  if (!mounted || !layout) return null;

  const talking = !!step && typed < step.text.length;
  const action: BoltAction = moving ? "idle" : talking ? "talk" : step?.action ?? (context === "home" ? "wave" : "idle");
  const dir = moving ? dirRef.current : layout.dir;
  const resting = !running;
  const size = resting && context !== "home" ? Math.round(S * 0.62) : S;
  const ease = "cubic-bezier(.5,0,.2,1)";

  return (
    <>
      {/* Focus: dim the page (clicks still pass through), with a hole over the button */}
      {running && !layout.spot && (
        <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[44]" style={{ background: "rgba(17,17,17,0.18)", animation: "cx-bolt-pop .3s ease-out" }} />
      )}
      {layout.spot && running && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[44] rounded-xl"
          style={{
            left: layout.spot.left - 6, top: layout.spot.top - 6, width: layout.spot.width + 12, height: layout.spot.height + 12,
            border: "3px solid #FF6B35", boxShadow: "0 0 0 6px rgba(255,107,53,0.18), 0 0 22px rgba(255,107,53,0.55), 0 0 0 9999px rgba(17,17,17,0.18)",
            animation: "cx-bolt-pulse 1.4s ease-in-out infinite", transition: animate ? `all ${FLY_MS}ms ${ease}` : "none",
          }}
        />
      )}

      {/* Bolt */}
      <button
        type="button"
        onClick={() => (running ? next() : start(tourKey))}
        title={running ? "Next" : "Tap me for a tour"}
        aria-label={running ? "Next tip" : "Start the dashboard tour with Bolt"}
        className="fixed z-[45] cursor-pointer rounded-full bg-transparent p-0 outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        style={{
          left: resting && context !== "home" ? window.innerWidth - size - 18 : layout.x,
          top: resting && context !== "home" ? window.innerHeight - size - 14 : layout.y,
          width: size, height: size,
          transition: animate ? `left ${FLY_MS}ms ${ease}, top ${FLY_MS}ms ${ease}` : "width .3s, height .3s",
        }}
      >
        <div className="absolute inset-x-[22%] bottom-[2%] h-[7%] rounded-[50%] bg-ink/20 blur-[3px]" style={{ transform: moving ? "scale(.6)" : "scale(1)", transition: "transform .4s" }} />
        <Suspense fallback={<Mascot size={Math.round(size * 0.8)} className="mx-auto animate-bob" />}>
          <Bolt3D size={size} action={action} mood={step?.mood ?? "happy"} dir={dir} moving={moving} />
        </Suspense>
      </button>

      {/* Speech bubble */}
      {running && step && !moving && (
        <div
          role="dialog"
          aria-live="polite"
          aria-label={step.title}
          className="comic-outline fixed z-[46] bg-background p-4 text-left"
          style={{
            left: layout.bubble.x, width: layout.bubble.w,
            ...(narrow ? { bottom: window.innerHeight - layout.bubble.y } : { top: layout.bubble.y }),
            animation: "cx-bolt-pop .25s ease-out",
          }}
        >
          <button onClick={finish} aria-label="Close the tour" className="absolute right-2 top-2 rounded-md p-1 text-text-tertiary hover:bg-surface-2 hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
          <div className="pr-6 font-display text-[17px] font-extrabold leading-tight text-foreground">{step.title}</div>
          <p className="mt-2 min-h-[4.5em] text-[14px] leading-relaxed text-text-secondary">
            {step.text.slice(0, typed)}
            {talking && <span className="ml-0.5 inline-block h-3.5 w-1.5 animate-pulse bg-primary align-middle" />}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex flex-1 items-center gap-1" aria-label={`Step ${idx + 1} of ${steps.length}`}>
              {steps.map((s, i) => (
                <span key={s.id} className={["h-1.5 rounded-full transition-all", i === idx ? "w-4 bg-primary" : i < idx ? "w-1.5 bg-primary/50" : "w-1.5 bg-ink/15"].join(" ")} />
              ))}
            </div>
            {idx > 0 && (
              <button onClick={back} className="rounded-md px-2.5 py-1.5 text-sm font-bold text-text-secondary hover:bg-surface-2">Back</button>
            )}
            <button onClick={next} className="comic-btn bg-primary px-4 py-1.5 text-sm font-bold text-white">
              {idx === steps.length - 1 ? "Got it!" : "Next"}
            </button>
          </div>
        </div>
      )}

      {/* Resting hint on Home */}
      {resting && context === "home" && layout.bubble && !narrow && (
        <div className="fixed z-[46]" style={{ left: layout.x + S / 2, top: layout.y + S + 2, transform: "translateX(-50%)" }}>
          <button
            onClick={() => start("home")}
            className="comic-outline-sm whitespace-nowrap bg-[#FFD34E] px-3 py-1.5 text-sm font-extrabold text-ink"
            style={{ animation: "cx-bolt-pop .25s ease-out" }}
          >
            👋 Want a tour? Tap me!
          </button>
        </div>
      )}
    </>
  );
}
