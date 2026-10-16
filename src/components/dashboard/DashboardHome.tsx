import { formatDistanceToNow } from "date-fns";
import { Sparkles, Globe2, PlayCircle, ArrowRight, Loader2 } from "lucide-react";
import buildImg from "@/assets/how-build.webp";
import runImg from "@/assets/how-run.webp";
import codeImg from "@/assets/how-code.png";
import type { Project } from "@/lib/projects";

const JOURNEY = [
  { n: "1", emoji: "🔧", name: "Build", desc: "Drag shapes into a 3D workspace, snap parts together and add motors, wheels and sensors.", image: buildImg, tint: "var(--sky)" },
  { n: "2", emoji: "🔌", name: "Wire", desc: "Connect real electronics — Arduino or SUBO boards, servos, LEDs, sensors — pin to pin.", tint: "#B794F6" },
  { n: "3", emoji: "💻", name: "Code", desc: "Snap blocks together or write Arduino C++. Same robot, your choice of language.", image: codeImg, tint: "#FFD34E" },
  { n: "4", emoji: "⚡", name: "Run", desc: "Hit play and watch real physics: drive, walk, push and battle. Wobbly designs fall over!", image: runImg, tint: "var(--accent)" },
  { n: "5", emoji: "🌍", name: "Share", desc: "Publish to the Community, collect likes, and let others reuse your robot as their starting point.", tint: "#34D399" },
];

/**
 * Dashboard home — shown when nothing is selected in the sidebar. A welcome
 * stage (Bolt stands in the `bolt-home` slot), what Constructa does, and quick
 * ways back into building.
 */
export function DashboardHome({
  name,
  counts,
  latest,
  creating,
  onNewProject,
  onOpenLatest,
  onCommunity,
}: {
  name: string;
  counts: { all: number; draft: number; completed: number };
  latest: Project | null;
  creating: boolean;
  onNewProject: () => void;
  onOpenLatest: () => void;
  onCommunity: () => void;
}) {
  const startTour = () => window.dispatchEvent(new CustomEvent("cx-bolt-start", { detail: "home" }));
  return (
    <div className="flex flex-col gap-6">
      {/* Welcome stage */}
      <div className="comic-outline relative overflow-hidden bg-background halftone p-6 sm:p-8">
        <div className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_240px]">
          <div>
            <span className="comic-tag">🤖 Your robot workshop</span>
            <h1 className="mt-4 font-display text-[30px] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-[38px]">
              Hey {name}! <br className="hidden sm:block" />
              What will you <span className="text-primary">build</span> today?
            </h1>
            <p className="mt-3 max-w-[520px] text-[15px] font-medium leading-relaxed text-text-secondary">
              Constructa is a robot workshop in your browser. Design any robot you can imagine in 3D, wire real
              electronics, teach it with code — then press play and watch it come alive with real physics.
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <button
                onClick={onNewProject}
                disabled={creating}
                className="comic-btn inline-flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:cursor-not-allowed"
              >
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Build a new robot
              </button>
              <button onClick={onCommunity} className="comic-btn inline-flex items-center gap-2 bg-background px-5 py-2.5 text-sm font-bold text-foreground">
                <Globe2 className="h-4 w-4" /> Get inspired
              </button>
              <button onClick={startTour} className="inline-flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-bold text-primary hover:underline">
                <PlayCircle className="h-4 w-4" /> Tour with Bolt
              </button>
            </div>
          </div>
          {/* Bolt flies in and stands here (BoltGuide tracks this slot) */}
          <div className="relative mx-auto h-[200px] w-[200px] md:h-[230px] md:w-[230px]">
            <div className="absolute inset-[12%] rounded-full border-[3px] border-ink bg-[#E6F6FD]" />
            <div className="absolute inset-[4%] rounded-full border-[3px] border-dashed border-ink/20" style={{ animation: "spin 30s linear infinite" }} />
            <div data-guide="bolt-home" className="absolute inset-0" />
          </div>
        </div>
      </div>

      {/* Quick stats + continue */}
      <div className="grid gap-4 sm:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.6fr)]">
        <Stat label="Robots" value={counts.all} emoji="🤖" />
        <Stat label="Drafts" value={counts.draft} emoji="📝" />
        <Stat label="Completed" value={counts.completed} emoji="🏆" />
        {latest ? (
          <button onClick={onOpenLatest} className="comic-outline group flex items-center gap-3 bg-[#FFF3C4] p-4 text-left transition-transform hover:-translate-y-0.5">
            <span className="text-2xl" aria-hidden="true">🛠️</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-extrabold uppercase tracking-wide text-text-tertiary">Continue building</span>
              <span className="block truncate font-display text-[16px] font-extrabold text-foreground">{latest.title || "Untitled robot"}</span>
              <span className="block text-xs text-text-tertiary">edited {safeAgo(latest.updated_at)}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1" />
          </button>
        ) : (
          <button onClick={onNewProject} className="comic-outline flex items-center gap-3 bg-[#FFF3C4] p-4 text-left">
            <span className="text-2xl" aria-hidden="true">✨</span>
            <span className="font-display text-[16px] font-extrabold text-foreground">Start your first robot</span>
          </button>
        )}
      </div>

      {/* What Constructa does */}
      <div>
        <h2 className="font-display text-2xl font-extrabold text-foreground">From idea to a robot that moves</h2>
        <p className="mt-1 text-sm text-text-secondary">Five steps — and you can jump back to any of them whenever you like.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {JOURNEY.map((s) => (
            <div key={s.n} className="comic-outline relative flex flex-col overflow-hidden bg-background">
              <div className="flex h-[88px] items-center justify-center border-b-[3px] border-ink" style={{ background: s.tint }}>
                {s.image ? <img src={s.image} alt="" className="h-full w-full object-cover" loading="lazy" /> : <span className="text-[40px]" aria-hidden="true">{s.emoji}</span>}
              </div>
              <span className="comic-outline-sm absolute left-2.5 top-2.5 bg-background px-2 py-0.5 font-display text-xs font-extrabold text-foreground">
                {s.n}
              </span>
              <div className="flex-1 p-3.5">
                <div className="font-display text-[17px] font-extrabold text-foreground">{s.emoji} {s.name}</div>
                <p className="mt-1 text-[13px] leading-snug text-text-secondary">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="comic-outline flex items-center gap-3 bg-background p-4">
      <span className="text-2xl" aria-hidden="true">{emoji}</span>
      <span>
        <span className="block font-display text-[26px] font-extrabold leading-none text-foreground">{value}</span>
        <span className="block text-[11px] font-extrabold uppercase tracking-wide text-text-tertiary">{label}</span>
      </span>
    </div>
  );
}

function safeAgo(iso: string | null) {
  try { return iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "recently"; } catch { return "recently"; }
}
