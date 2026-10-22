import { useEffect, useRef, useState } from "react";
import { Hand } from "lucide-react";

export type RobotAction = "skitter" | "drive" | "snap" | "wave" | "waddle";

// What each robot does when tapped. Keyframes run on their own layer so they
// never fight the tilt / drag transforms.
const ACTIONS: Record<RobotAction, { frames: Keyframe[]; duration: number; origin: string; say: string }> = {
  skitter: {
    frames: [
      { transform: "translate(0,0) rotate(0)" },
      { transform: "translate(-16px,-5px) rotate(-3deg)" },
      { transform: "translate(12px,0) rotate(2deg)" },
      { transform: "translate(-10px,-4px) rotate(-2deg)" },
      { transform: "translate(8px,0) rotate(1.5deg)" },
      { transform: "translate(-4px,-2px) rotate(-1deg)" },
      { transform: "translate(0,0) rotate(0)" },
    ],
    duration: 800,
    origin: "50% 80%",
    say: "Six legs, all in step!",
  },
  drive: {
    frames: [
      { transform: "translateX(0)", opacity: 1 },
      { transform: "translateX(-22px) rotate(-1.5deg)", opacity: 1, offset: 0.14 },
      { transform: "translateX(115%)", opacity: 1, offset: 0.5, easing: "steps(1, end)" },
      { transform: "translateX(-115%)", opacity: 1, offset: 0.501 },
      { transform: "translateX(6px) rotate(0.8deg)", opacity: 1, offset: 0.9 },
      { transform: "translateX(0)", opacity: 1 },
    ],
    duration: 1500,
    origin: "50% 90%",
    say: "Vroom!",
  },
  snap: {
    frames: [
      { transform: "scale(1) rotate(0)" },
      { transform: "scale(1.07) rotate(-3deg)", offset: 0.2 },
      { transform: "scale(0.96) rotate(3deg)", offset: 0.4 },
      { transform: "scale(1.05) rotate(-2deg)", offset: 0.6 },
      { transform: "scale(0.98) rotate(1deg)", offset: 0.8 },
      { transform: "scale(1) rotate(0)" },
    ],
    duration: 650,
    origin: "50% 60%",
    say: "Snap snap!",
  },
  wave: {
    frames: [
      { transform: "translateY(0) rotate(0)" },
      { transform: "translateY(-14px) rotate(-6deg)", offset: 0.18 },
      { transform: "translateY(-14px) rotate(6deg)", offset: 0.36 },
      { transform: "translateY(-10px) rotate(-5deg)", offset: 0.54 },
      { transform: "translateY(-6px) rotate(4deg)", offset: 0.72 },
      { transform: "translateY(0) rotate(0)" },
    ],
    duration: 1000,
    origin: "50% 95%",
    say: "High five!",
  },
  waddle: {
    frames: [
      { transform: "translate(0,0) rotate(0)" },
      { transform: "translate(-10px,-8px) rotate(-8deg)", offset: 0.2 },
      { transform: "translate(-4px,0) rotate(0)", offset: 0.35 },
      { transform: "translate(6px,-8px) rotate(8deg)", offset: 0.55 },
      { transform: "translate(2px,0) rotate(0)", offset: 0.7 },
      { transform: "translate(-4px,-6px) rotate(-6deg)", offset: 0.85 },
      { transform: "translate(0,0) rotate(0)" },
    ],
    duration: 1100,
    origin: "50% 95%",
    say: "Quack.",
  },
};

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const MAX_TILT = 12; // degrees
const DRAG_THRESHOLD = 6; // px before a press becomes a drag

/** Rubber-band so the robot resists being dragged far. */
const band = (d: number, limit: number) => (d * limit) / (Math.abs(d) + limit);

type Props = {
  src: string;
  alt: string;
  action: RobotAction;
  className?: string;
};

/**
 * A robot render you can play with: it leans toward the cursor, can be
 * grabbed and flung (it springs home), and does its party trick when tapped
 * or activated from the keyboard.
 */
export function InteractiveRobot({ src, alt, action, className = "" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const liftRef = useRef<HTMLDivElement>(null);
  const tiltRef = useRef<HTMLDivElement>(null);
  const actRef = useRef<HTMLDivElement>(null);
  const [bubble, setBubble] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [grabbing, setGrabbing] = useState(false);

  const reduced = useRef(false);
  const press = useRef<{ id: number; x: number; y: number; lastX: number; dragging: boolean } | null>(null);
  const bubbleTimer = useRef<number | undefined>(undefined);
  const actAnim = useRef<Animation | null>(null);

  useEffect(() => {
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return () => window.clearTimeout(bubbleTimer.current);
  }, []);

  const say = (text: string) => {
    setBubble(text);
    window.clearTimeout(bubbleTimer.current);
    bubbleTimer.current = window.setTimeout(() => setBubble(null), 1800);
  };

  const perform = () => {
    setTouched(true);
    const a = ACTIONS[action];
    say(a.say);
    const el = actRef.current;
    if (!el || reduced.current || typeof el.animate !== "function") return;
    actAnim.current?.cancel();
    el.style.transformOrigin = a.origin;
    actAnim.current = el.animate(a.frames, { duration: a.duration, easing: "ease-in-out" });
  };

  const setTilt = (rx: number, ry: number, rz = 0, ms = 120) => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transition = `transform ${ms}ms ease-out`;
    el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const host = hostRef.current;
    if (!host || reduced.current) return;
    const p = press.current;

    if (p && p.id === e.pointerId) {
      const dx = e.clientX - p.x;
      const dy = e.clientY - p.y;
      if (!p.dragging && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        p.dragging = true;
        setGrabbing(true);
        setTouched(true);
        host.setPointerCapture(e.pointerId);
      }
      if (p.dragging) {
        const r = host.getBoundingClientRect();
        const lift = liftRef.current!;
        lift.style.transition = "none";
        lift.style.transform = `translate(${band(dx, r.width * 0.4)}px, ${band(dy, r.height * 0.3)}px) scale(1.04)`;
        // lean into the direction of travel
        const vx = e.clientX - p.lastX;
        p.lastX = e.clientX;
        setTilt(0, 0, Math.max(-14, Math.min(14, vx * 1.6)), 90);
        return;
      }
    }

    if (e.pointerType !== "mouse") return;
    const r = host.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    setTilt(-ny * MAX_TILT * 0.6, nx * MAX_TILT);
  };

  const release = (e: React.PointerEvent, cancelled = false) => {
    const p = press.current;
    if (!p || p.id !== e.pointerId) return;
    press.current = null;
    if (p.dragging) {
      setGrabbing(false);
      const lift = liftRef.current!;
      lift.style.transition = `transform 650ms ${SPRING}`;
      lift.style.transform = "translate(0,0) scale(1)";
      setTilt(0, 0, 0, 500);
    } else if (!cancelled) {
      perform();
    }
  };

  return (
    <div
      ref={hostRef}
      role="button"
      tabIndex={0}
      aria-label={`${alt} Tap to see it move.`}
      className={[
        "group relative overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-wb-ink",
        grabbing ? "cursor-grabbing" : "cursor-grab",
        className,
      ].join(" ")}
      style={{ perspective: "900px", touchAction: "pan-y" }}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        press.current = { id: e.pointerId, x: e.clientX, y: e.clientY, lastX: e.clientX, dragging: false };
      }}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => release(e)}
      onPointerCancel={(e) => release(e, true)}
      onPointerLeave={(e) => {
        if (!press.current?.dragging) setTilt(0, 0, 0, 500);
        if (e.pointerType === "mouse" && press.current && !press.current.dragging) press.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          perform();
        }
      }}
    >
      <div ref={liftRef} className="h-full w-full will-change-transform">
        <div ref={tiltRef} className="h-full w-full will-change-transform" style={{ transformStyle: "preserve-3d" }}>
          <div ref={actRef} className="h-full w-full">
            <img
              src={src}
              alt={alt}
              loading="lazy"
              draggable={false}
              className="pointer-events-none h-full w-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Speech bubble */}
      <span
        aria-live="polite"
        className={[
          "wb-panel pointer-events-none absolute right-4 top-3 rounded-[12px] px-3 py-1",
          "font-ui text-[14px] font-semibold text-wb-ink transition-all duration-200 ease-out-soft",
          bubble ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0",
        ].join(" ")}
      >
        {bubble ?? ""}
      </span>

      {/* First-visit hint */}
      <span
        aria-hidden
        className={[
          "pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-[8px] border border-wb-line bg-white px-2 py-0.5",
          "font-ui text-[12px] font-medium text-wb-ink-2 transition-opacity duration-300",
          touched ? "opacity-0" : "opacity-80 group-hover:opacity-100",
        ].join(" ")}
      >
        <Hand className="h-3.5 w-3.5" strokeWidth={2.5} />
        Tap or drag me
      </span>
    </div>
  );
}
