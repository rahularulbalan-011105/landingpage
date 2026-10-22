import { useEffect, useState, type CSSProperties } from "react";
import { SectionHead } from "./SectionHead";
import { useT } from "@/i18n";

/** What's new: the next release, v2.0 Robot Battles, as one wide teaser. */

export function WhatsNew() {
  const w = useT().whatsNew;
  return (
    <section id="whats-new" className="scroll-mt-20 bg-wb-canvas pt-28 font-ui text-wb-ink sm:pt-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHead eyebrow={w.eyebrow} title={w.title} aside={w.aside} />
        <div className="mt-12">
          <TeaserCard />
        </div>
      </div>
    </section>
  );
}

const V2_LAUNCH = new Date("2026-12-01T00:00:00");

/** Whole days until v2.0; null until mounted so server and client markup match. */
function useDaysToLaunch() {
  const [days, setDays] = useState<number | null>(null);
  useEffect(() => {
    setDays(Math.max(0, Math.ceil((V2_LAUNCH.getTime() - Date.now()) / 86_400_000)));
  }, []);
  return days;
}

type BotProps = { className?: string; style?: CSSProperties };
type Pt = [number, number];

/** Armour plate tapering from width w1 at a to w2 at b: limbs read as machined parts, not tubes. */
function taper([x1, y1]: Pt, [x2, y2]: Pt, w1: number, w2: number) {
  const len = Math.hypot(x2 - x1, y2 - y1);
  const nx = -(y2 - y1) / len;
  const ny = (x2 - x1) / len;
  const p = (x: number, y: number, w: number, s: number) => `${(x + nx * w * s).toFixed(1)},${(y + ny * w * s).toFixed(1)}`;
  return [p(x1, y1, w1 / 2, 1), p(x2, y2, w2 / 2, 1), p(x2, y2, w2 / 2, -1), p(x1, y1, w1 / 2, -1)].join(" ");
}

/** Lean rifleman mech in a forward firing stance, rifle shouldered, aiming right. */
function GunnerBot({ className, style }: BotProps) {
  return (
    <svg viewBox="0 0 142 178" className={className} style={style}>
      <g fill="#000">
        {/* back arm (behind body) */}
        <polygon points={taper([56, 42], [74, 64], 10, 8)} />
        <polygon points={taper([74, 64], [106, 51], 8, 7)} />
        {/* legs */}
        <polygon points={taper([64, 90], [50, 124], 14, 10)} />
        <polygon points="44,118 56,116 58,128 46,130" />
        <polygon points={taper([50, 124], [42, 166], 11, 7)} />
        <polygon points="32,166 54,165 58,174 28,174" />
        <polygon points={taper([80, 90], [94, 122], 15, 10)} />
        <polygon points="90,114 101,118 98,129 88,126" />
        <polygon points={taper([94, 122], [102, 166], 11, 7)} />
        <polygon points="94,165 114,166 120,174 92,174" />
        {/* core */}
        <polygon points="58,82 86,82 88,94 56,94" />
        <polygon points="64,70 82,70 80,84 66,84" />
        <polygon points="52,36 86,33 91,45 82,71 63,73 55,60 49,46" />
        <polygon points="44,40 52,37 53,63 45,58" />
        <polygon points="67,28 75,28 74,36 66,36" />
        <polygon points="63,15 75,11 83,17 81,28 69,31 62,24" />
        {/* rifle */}
        <polygon points="62,52 76,47 78,56 66,61" />
        <polygon points="76,45 122,41 123,50 78,54" />
        <polygon points="122,43.5 141,42.5 141,46 122,47" />
        <polygon points="93,50 100,50 98,63 91,62" />
        <polygon points="88,39 106,38 106,42 88,43" />
        {/* front arm + pauldron */}
        <polygon points={taper([84, 40], [80, 60], 10, 8)} />
        <polygon points={taper([80, 60], [90, 53], 8, 7)} />
        <polygon points="76,31 94,33 97,45 82,47" />
      </g>
      <polygon points="71,19.5 82,18 82,20.5 71,21.5" fill="#fff" />
    </svg>
  );
}

/** Hook-toothed saw blade around (cx, cy), with a hub hole cut out (evenodd). */
function sawPath(cx: number, cy: number, r: number, teeth: number) {
  const pts: string[] = [];
  const at = (a: number, rad: number) => `${(cx + Math.cos(a) * rad).toFixed(1)},${(cy + Math.sin(a) * rad).toFixed(1)}`;
  for (let i = 0; i < teeth; i++) {
    const step = (Math.PI * 2) / teeth;
    pts.push(at(i * step, r - 5), at((i + 0.8) * step, r));
  }
  const h = r * 0.22;
  return `M${pts.join(" L")} Z M${cx + h},${cy} A${h},${h} 0 1 0 ${cx - h},${cy} A${h},${h} 0 1 0 ${cx + h},${cy} Z`;
}

/** Heavy brawler mech, hunched, low guard, buzz saw cocked high to swing (drawn facing right). */
function SawBot({ className, style }: BotProps) {
  return (
    <svg viewBox="0 0 158 178" className={className} style={style}>
      <g fill="#000">
        {/* guard arm (behind body) */}
        <polygon points={taper([54, 42], [62, 66], 12, 10)} />
        <polygon points={taper([62, 66], [84, 60], 10, 9)} />
        <polygon points="82,54 92,55 92,66 82,66" />
        {/* legs */}
        <polygon points={taper([68, 96], [52, 128], 17, 12)} />
        <polygon points="44,120 58,118 60,132 46,134" />
        <polygon points={taper([52, 128], [46, 168], 14, 9)} />
        <polygon points="32,167 58,166 62,174 28,174" />
        <polygon points={taper([90, 96], [106, 126], 17, 12)} />
        <polygon points="102,116 115,121 111,134 99,130" />
        <polygon points={taper([106, 126], [112, 168], 14, 9)} />
        <polygon points="102,167 126,167 132,174 100,174" />
        {/* core */}
        <polygon points="62,88 96,88 98,99 60,99" />
        <polygon points="68,74 90,73 88,90 70,90" />
        <polygon points="52,32 92,29 101,43 94,75 66,79 54,64 45,44" />
        <polygon points="40,30 58,27 59,45 41,48" />
        <polygon points="71,25 84,22 91,29 89,40 75,42 68,34" />
        {/* saw arm */}
        <polygon points={taper([98, 40], [120, 52], 13, 10)} />
        <polygon points="116,46 126,50 124,60 114,56" />
        <polygon points={taper([121, 53], [128, 34], 11, 9)} />
        <polygon points={taper([128, 36], [131, 26], 7, 7)} />
        <polygon points="88,25 107,29 109,45 92,47" />
        <path d={sawPath(132, 25, 23, 14)} fillRule="evenodd" />
      </g>
      <polygon points="78,31.5 89,29.5 89,32 78,33.5" fill="#fff" />
    </svg>
  );
}

/** v2.0 Robot Battles: copy on the left, a gunner and a saw-bot squaring up on an arena floor on the right. */
function TeaserCard() {
  const days = useDaysToLaunch();
  const w = useT().whatsNew;
  // Solid black cut-outs with a cool rim light; the stage glow behind them does the rest.
  const silhouette = "drop-shadow(0 0 1px rgba(255,255,255,0.55)) drop-shadow(0 0 10px rgba(190,220,255,0.18))";
  return (
    <article className="relative grid overflow-hidden rounded-[24px] bg-[#0C100E] text-white ring-1 ring-white/10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div className="relative z-10 flex flex-col p-6 sm:p-8 lg:p-10">
        <div className="flex items-center gap-2.5">
          <span className="rounded-[8px] bg-white px-2 py-0.5 font-key text-[12px] font-medium text-wb-ink">v2.0</span>
          <span className="font-key text-[12px] text-white/55">{w.date}</span>
          <span className="ms-auto inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-white/85">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
            {w.comingSoon}
          </span>
        </div>

        <h3
          className="mt-6 font-brand font-bold"
          style={{ fontSize: "clamp(32px, 3.6vw, 52px)", lineHeight: 1.02, letterSpacing: "-0.045em" }}
        >
          {w.name}
        </h3>
        <p className="mt-3 max-w-[28em] text-[15.5px] leading-[1.6] text-white/70">
          {w.desc}
        </p>
        <p className="mt-5 font-brand text-[18px] font-bold leading-snug" style={{ letterSpacing: "-0.03em" }}>
          {w.kicker}
        </p>

        <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6 lg:mt-auto">
          <a
            href="#cta"
            className="inline-flex h-12 items-center rounded-[12px] bg-wb-orange px-5 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110"
          >
            {w.notify}
          </a>
          <p className="ms-auto text-end font-key text-[12px] leading-tight text-white/55">
            {days === null ? (
              w.date
            ) : (
              <>
                <span className="block font-brand text-[26px] font-bold tracking-tight text-white">{days}</span>
                {w.daysToGo}
              </>
            )}
          </p>
        </div>
      </div>

      {/* arena: perspective grid floor, backlight, face-off */}
      <div aria-hidden className="relative min-h-[260px] sm:min-h-[300px] lg:min-h-[420px]">
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 60% at 50% 58%, rgba(214,232,255,0.42), rgba(214,232,255,0.12) 40%, transparent 72%)" }}
        />
        <div className="absolute inset-x-0 bottom-0 h-[46%] overflow-hidden [perspective:260px]">
          <div
            className="absolute -inset-x-1/2 bottom-0 h-[220%] origin-bottom [transform:rotateX(62deg)]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.22) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage: "linear-gradient(to top, black 30%, transparent 95%)",
              WebkitMaskImage: "linear-gradient(to top, black 30%, transparent 95%)",
            }}
          />
        </div>
        <div className="absolute inset-x-[8%] top-[54%] h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

        <div className="absolute inset-x-0 bottom-[12%] flex items-end justify-center gap-3 px-4 lg:gap-6">
          <GunnerBot className="h-[150px] w-auto lg:h-[230px]" style={{ filter: silhouette }} />
          <span className="mb-16 font-key text-[11px] font-semibold tracking-[0.3em] text-white/70 lg:mb-24 lg:text-[13px]">VS</span>
          <SawBot className="h-[150px] w-auto -scale-x-100 lg:h-[230px]" style={{ filter: silhouette }} />
        </div>
        <div className="absolute inset-x-[18%] bottom-[12%] h-3 rounded-[50%] bg-black/70 blur-md" />
      </div>
    </article>
  );
}
