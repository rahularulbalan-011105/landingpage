import { Link } from "@tanstack/react-router";
import { useReveal } from "@/hooks/use-reveal";

type Winner = { rank: number; name: string; medal?: string; projectId: string };

// Ranking is the judged final order (NOT by likes). Each links to the maker's
// community build (opens the dashboard on the Community tab, highlighted).
const WINNERS: Winner[] = [
  { rank: 1, name: "H. Dhanush", medal: "🥇", projectId: "224cc74c-3322-4050-a22a-bad0d60f239b" },
  { rank: 2, name: "SHUBHAM AMOL PRAMANIK", medal: "🥈", projectId: "25c7c08f-0d40-4f9f-ae30-99f58c7cd6ec" },
  { rank: 3, name: "MOHAMMED AJMAL", medal: "🥉", projectId: "c4268f0a-1b2c-4435-9c13-6000e0c70e37" },
  { rank: 4, name: "JAYASURIYA R S", projectId: "fdb2a37b-a02b-4ed3-96f3-206a0fa67dac" },
  { rank: 5, name: "NAVEENBHARATHI V", projectId: "8134d3b7-d99e-4e33-a00f-8767271c935a" },
  { rank: 6, name: "HIMANSHU", projectId: "5fd14817-e1ca-47b4-b74b-a662205e5c38" },
];

function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z .]/g, "").trim().split(/[\s.]+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (parts[0]?.slice(0, 2) || "?").toUpperCase();
}

const byRank = (r: number) => WINNERS.find((w) => w.rank === r)!;

// One podium column (medal + maker on top of a coloured plinth).
function Podium({ w, place }: { w: Winner; place: 1 | 2 | 3 }) {
  const cfg = {
    1: { h: 168, bg: "#FFD34E", border: "#111", label: "1st", avatarBg: "#FFF3C4" },
    2: { h: 122, bg: "#DCE2EA", border: "#111", label: "2nd", avatarBg: "#EEF2F7" },
    3: { h: 100, bg: "#E7A86A", border: "#111", label: "3rd", avatarBg: "#F6DDC2" },
  }[place];

  return (
    <Link
      to="/dashboard"
      search={{ highlight: w.projectId }}
      className="group flex flex-1 flex-col items-center"
      aria-label={`View ${w.name}'s winning build`}
    >
      {place === 1 && <span className="mb-0.5 text-3xl animate-bob" aria-hidden>👑</span>}
      <span className="text-4xl sm:text-5xl drop-shadow-sm">{w.medal}</span>
      <span
        className="comic-outline-sm mt-2 flex h-14 w-14 items-center justify-center rounded-full font-display text-lg font-extrabold text-ink"
        style={{ background: cfg.avatarBg }}
      >
        {initials(w.name)}
      </span>
      <span className="mt-2 line-clamp-2 max-w-[150px] text-center font-display text-sm font-extrabold leading-tight text-foreground group-hover:text-primary sm:text-base">
        {w.name}
      </span>
      <span className="mb-2 mt-1 text-[11px] font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100">
        View build →
      </span>
      {/* plinth */}
      <div
        className="comic-outline flex w-full max-w-[150px] items-start justify-center pt-2 transition-transform duration-150 group-hover:-translate-y-1"
        style={{ height: cfg.h, background: cfg.bg }}
      >
        <span className="font-display text-2xl font-extrabold text-ink sm:text-3xl">{cfg.label}</span>
      </div>
    </Link>
  );
}

function RunnerUp({ w }: { w: Winner }) {
  return (
    <Link
      to="/dashboard"
      search={{ highlight: w.projectId }}
      className="comic-outline-sm group flex items-center gap-3 bg-background px-4 py-3 transition-transform duration-150 hover:-translate-y-1"
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-surface-2 font-display text-sm font-extrabold text-foreground">
        {w.rank}
      </span>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-sky/15 font-display text-xs font-extrabold text-foreground">
        {initials(w.name)}
      </span>
      <span className="min-w-0 flex-1 truncate font-display text-sm font-extrabold text-foreground group-hover:text-primary">
        {w.name}
      </span>
      <span className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden>→</span>
    </Link>
  );
}

export function Winners() {
  const ref = useReveal<HTMLDivElement>();

  return (
    <section id="winners" className="relative bg-surface-1 halftone-ink overflow-hidden py-20 sm:py-28">
      {/* confetti stickers */}
      <div className="pointer-events-none absolute left-6 top-12 hidden text-4xl md:block animate-bob select-none" aria-hidden>🎉</div>
      <div className="pointer-events-none absolute right-8 top-20 hidden text-4xl md:block animate-bob select-none" style={{ animationDelay: "1s" }} aria-hidden>🏆</div>

      <div ref={ref} className="reveal relative mx-auto max-w-[900px] px-6 sm:px-8">
        <div className="text-center">
          <span className="comic-tag">🏆 Constructathon</span>
          <h2
            className="mt-4 font-display font-extrabold text-foreground"
            style={{ fontSize: "clamp(34px, 6vw, 60px)", lineHeight: 0.98, letterSpacing: "-0.02em" }}
          >
            Meet the <span className="text-primary">Winners</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[16px] font-medium text-text-secondary">
            The top 6 builds from the Constructathon. Tap a name to open their robot in the community gallery.
          </p>
        </div>

        {/* Podium — 2nd · 1st · 3rd */}
        <div className="mx-auto mt-12 flex max-w-[620px] items-end justify-center gap-3 sm:gap-6">
          <Podium w={byRank(2)} place={2} />
          <Podium w={byRank(1)} place={1} />
          <Podium w={byRank(3)} place={3} />
        </div>

        {/* Runners-up 4–6 */}
        <div className="mx-auto mt-10 grid max-w-[640px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[byRank(4), byRank(5), byRank(6)].map((w) => (
            <RunnerUp key={w.rank} w={w} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm font-semibold text-text-tertiary">
          Congratulations to all our builders! 🎊 Built by <span className="text-foreground">AtumX</span>.
        </p>
      </div>
    </section>
  );
}
