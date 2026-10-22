import { useEffect, useId, useRef, useState } from "react";

/**
 * Servo — Constructa's mascot, built from an SG90 micro servo: the part every
 * Constructa walker is made of. The white horn on top is its hair and spins when
 * it's happy or thinking; the mounting tabs are its arms; the three servo wires
 * are its legs. It blinks, and its eyes follow the cursor.
 */
export type ServoMood = "idle" | "happy" | "thinking" | "sleepy";

const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function ServoBot({
  size = 120,
  mood = "idle",
  track = true,
  className = "",
}: {
  size?: number;
  mood?: ServoMood;
  track?: boolean;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced() || mood === "sleepy") return;
    let t = 0;
    const loop = () => {
      t = window.setTimeout(() => {
        setBlink(true);
        window.setTimeout(() => setBlink(false), 120);
        loop();
      }, 2400 + Math.random() * 3000);
    };
    loop();
    return () => clearTimeout(t);
  }, [mood]);

  useEffect(() => {
    if (!track || reduced()) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height * 0.42);
        const d = Math.max(1, Math.hypot(dx, dy));
        const k = Math.min(1, d / 300);
        setLook({ x: (dx / d) * 3 * k, y: (dy / d) * 2.2 * k });
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [track]);

  const closed = blink || mood === "sleepy";
  const eye = (cx: number) =>
    closed ? (
      <rect x={cx - 6} y={53} width="12" height="3" rx="1.5" fill="#7FE3FF" />
    ) : mood === "happy" ? (
      <path d={`M${cx - 6} 57 Q${cx} 48 ${cx + 6} 57`} fill="none" stroke="#7FE3FF" strokeWidth="3.4" strokeLinecap="round" />
    ) : (
      <g>
        <rect x={cx - 5} y={47} width="10" height="13" rx="5" fill="#7FE3FF" />
        <rect x={cx - 2.2} y={49.5} width="3" height="4" rx="1.5" fill="#fff" opacity="0.85" />
      </g>
    );

  const hornClass = mood === "happy" ? "servo-horn-spin" : mood === "thinking" ? "servo-horn-think" : "servo-horn-idle";

  return (
    <svg
      ref={ref}
      width={size}
      height={size * 1.12}
      viewBox="0 0 120 134"
      className={`overflow-visible ${className}`}
      role="img"
      aria-label="Servo, the Constructa mascot"
    >
      <defs>
        <linearGradient id={`b${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3BB3D6" />
          <stop offset="1" stopColor="#1F7FA3" />
        </linearGradient>
        <linearGradient id={`t${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2C9CC0" />
          <stop offset="1" stopColor="#1B7096" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="130" rx="26" ry="3.5" fill="rgba(20,26,23,0.15)" className="servo-shadow" />

      <g className="servo-float">
        {/* wires = legs */}
        <path d="M52 100 C 50 110, 46 116, 46 124" fill="none" stroke="#7A4A2A" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M60 100 C 60 110, 60 116, 60 124" fill="none" stroke="#E5484D" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M68 100 C 70 110, 74 116, 74 124" fill="none" stroke="#F2A33A" strokeWidth="3.4" strokeLinecap="round" />
        <rect x="40" y="122" width="12" height="7" rx="2.5" fill="#22292E" />
        <rect x="54" y="122" width="12" height="7" rx="2.5" fill="#22292E" />
        <rect x="68" y="122" width="12" height="7" rx="2.5" fill="#22292E" />

        {/* mounting tabs = arms */}
        <g className="servo-arm-l" style={{ transformOrigin: "26px 60px" }}>
          <rect x="6" y="55" width="22" height="9" rx="3" fill={`url(#t${uid})`} />
          <circle cx="13" cy="59.5" r="2.4" fill="#145A78" />
        </g>
        <g className="servo-arm-r" style={{ transformOrigin: "94px 60px" }}>
          <rect x="92" y="55" width="22" height="9" rx="3" fill={`url(#t${uid})`} />
          <circle cx="107" cy="59.5" r="2.4" fill="#145A78" />
        </g>

        {/* body */}
        <rect x="24" y="30" width="72" height="72" rx="12" fill={`url(#b${uid})`} />
        <rect x="27" y="32" width="66" height="7" rx="3.5" fill="#fff" opacity="0.2" />

        {/* output gear + horn = hair */}
        <rect x="48" y="20" width="22" height="12" rx="4" fill="#1B7096" />
        <circle cx="59" cy="20" r="6.5" fill="#E9EEF1" />
        <g className={hornClass} style={{ transformOrigin: "59px 18px" }}>
          <rect x="35" y="14.5" width="48" height="7" rx="3.5" fill="#F7F9FA" stroke="#C9D2D8" strokeWidth="1" />
          {[41, 47, 71, 77].map((x) => (
            <circle key={x} cx={x} cy="18" r="1.2" fill="#B5C0C7" />
          ))}
          <circle cx="59" cy="18" r="3" fill="#C9D2D8" />
        </g>

        {/* label = face */}
        <rect x="32" y="40" width="56" height="44" rx="8" fill="#12181C" />
        <g style={{ transform: `translate(${look.x}px, ${look.y}px)`, transition: "transform 120ms ease-out" }}>
          {eye(49)}
          {eye(71)}
        </g>
        {mood === "happy" ? (
          <path d="M54 68 Q60 73 66 68" fill="none" stroke="#7FE3FF" strokeWidth="2.4" strokeLinecap="round" />
        ) : mood === "thinking" ? (
          <line x1="56" y1="70" x2="64" y2="69" stroke="#7FE3FF" strokeWidth="2.4" strokeLinecap="round" />
        ) : (
          <circle cx="60" cy="70" r="1.8" fill="#7FE3FF" />
        )}
        <text x="60" y="80.5" textAnchor="middle" fontSize="6" fontWeight="700" fill="#fff" opacity="0.55" fontFamily="'JetBrains Mono', monospace" letterSpacing="1">
          SG90
        </text>
      </g>
    </svg>
  );
}
