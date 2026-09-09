import { useEffect, useState } from "react";
import { useReveal } from "@/hooks/use-reveal";

// Sept 12, 2026 · 9:00 AM IST — one fixed instant, so the countdown is correct
// in every timezone.
const TARGET = new Date("2026-09-12T09:00:00+05:30").getTime();
const REGISTER_FORM = "https://forms.gle/Vprtbj86onLGRuHw6";

type Remaining = { days: number; hours: number; mins: number; secs: number; over: boolean };

function useCountdown(target: number): Remaining | null {
  // `null` until mounted so SSR + first client render match (no hydration flash).
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  if (now === null) return null;
  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    mins: Math.floor((diff % 3_600_000) / 60_000),
    secs: Math.floor((diff % 60_000) / 1_000),
    over: diff === 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

function TimeCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="comic-outline-sm bg-white w-[64px] sm:w-[88px] py-3 sm:py-4 text-center">
        <span
          className="font-display font-extrabold text-foreground tabular-nums"
          style={{ fontSize: "clamp(28px, 5vw, 44px)", lineHeight: 1 }}
        >
          {value}
        </span>
      </div>
      <span className="mt-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.14em] text-white/90">
        {label}
      </span>
    </div>
  );
}

export function Constructathon() {
  const ref = useReveal<HTMLDivElement>();
  const t = useCountdown(TARGET);

  return (
    <section
      id="constructathon"
      className="relative bg-primary halftone-ink overflow-hidden py-24 sm:py-32"
    >
      {/* playful floating stickers */}
      <div className="pointer-events-none absolute -left-6 top-16 hidden md:block text-6xl animate-bob select-none" aria-hidden>
        🔧
      </div>
      <div
        className="pointer-events-none absolute right-8 bottom-16 hidden md:block text-6xl animate-bob select-none"
        style={{ animationDelay: "1.2s" }}
        aria-hidden
      >
        🤖
      </div>

      <div className="relative mx-auto max-w-[860px] px-6 sm:px-8">
        <div
          ref={ref}
          className="reveal comic-outline bg-white p-7 sm:p-12 flex flex-col items-center text-center"
        >
          {/* eyebrow + rotated date sticker */}
          <div className="flex items-center gap-3">
            <span className="comic-tag">🏆 1-Day Build Challenge</span>
          </div>

          <div className="relative mt-6 w-full flex flex-col items-center">
            <span
              className="absolute -top-3 right-0 sm:right-6 comic-outline-sm bg-sky text-white font-display font-extrabold px-3 py-1 text-sm sm:text-base"
              style={{ transform: "rotate(6deg)" }}
            >
              SEPT 12
            </span>
            <h2
              className="font-display font-extrabold text-foreground"
              style={{ fontSize: "clamp(40px, 8.5vw, 92px)", lineHeight: 0.92, letterSpacing: "-0.03em" }}
            >
              CONSTRUCT
              <span className="text-primary">ATHON</span>
            </h2>
          </div>

          <p className="mt-4 text-[18px] sm:text-[22px] font-bold text-foreground">
            One day. Build <span className="text-primary">anything</span>. Win big.
          </p>

          {/* countdown */}
          <div className="mt-8 w-full rounded-2xl bg-primary p-5 sm:p-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90 mb-4">
              {t?.over ? "🔴 It's happening now" : "⏳ Starts in"}
            </div>
            {t?.over ? (
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-white py-2">
                The build is LIVE — jump in! 🚀
              </div>
            ) : (
              <div className="flex items-start justify-center gap-2 sm:gap-4">
                <TimeCell value={t ? String(t.days) : "--"} label="Days" />
                <span className="font-display text-3xl sm:text-5xl font-extrabold text-white/80 pt-2 sm:pt-3">:</span>
                <TimeCell value={t ? pad(t.hours) : "--"} label="Hours" />
                <span className="font-display text-3xl sm:text-5xl font-extrabold text-white/80 pt-2 sm:pt-3">:</span>
                <TimeCell value={t ? pad(t.mins) : "--"} label="Mins" />
                <span className="font-display text-3xl sm:text-5xl font-extrabold text-white/80 pt-2 sm:pt-3">:</span>
                <TimeCell value={t ? pad(t.secs) : "--"} label="Secs" />
              </div>
            )}
          </div>

          {/* prize */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="comic-outline-sm bg-surface-2 px-6 py-4 flex items-center gap-3">
              <span className="text-4xl" aria-hidden>🏆</span>
              <div className="text-left leading-none">
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-foreground">
                  ₹10,000
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-text-secondary mt-1">
                  Cash + Kit
                </div>
              </div>
            </div>
            <p className="max-w-[300px] text-[15px] text-text-secondary font-medium text-center sm:text-left">
              <span className="font-bold text-foreground">No restrictions.</span> Design, wiring,
              code, mechanics — any part of Constructa. Build whatever you can imagine.
            </p>
          </div>

          {/* CTA */}
          <a
            href={REGISTER_FORM}
            target="_blank"
            rel="noopener noreferrer"
            className="comic-btn mt-9 inline-flex items-center justify-center gap-2 bg-primary text-white text-[17px] sm:text-[19px] font-extrabold px-8 py-4"
          >
            Register for the Constructathon
            <span aria-hidden>→</span>
          </a>
          <span className="mt-3 text-xs text-text-tertiary font-semibold">
            Opens the registration form · free to enter
          </span>

          {/* social proof */}
          <div className="mt-8 pt-6 border-t-2 border-dashed border-ink/15 w-full">
            <p className="text-sm font-bold text-text-secondary">
              Built by <span className="text-foreground">AtumX</span> — 30k+ robots shipped · 500+ schools
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
