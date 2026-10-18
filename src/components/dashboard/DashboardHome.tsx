import { formatDistanceToNow } from "date-fns";
import { Sparkles, Globe2, PlayCircle, ArrowRight, Loader2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import { STATEMENTS } from "@/components/landing/RobotGallery";

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

      {/* Robots you can build — the same showcase as the landing page, laid out for easy reading */}
      <section aria-labelledby="robots-you-can-build">
        <h2 id="robots-you-can-build" className="font-display text-[26px] font-extrabold leading-tight text-foreground">
          Robots you can build
        </h2>
        <p className="mt-2 max-w-[60ch] text-[16px] leading-[1.6] text-text-secondary">
          Every one of these was built in Constructa. Pick one as inspiration — or build something nobody has thought of yet.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {STATEMENTS.map((s, i) => {
            const wide = i === STATEMENTS.length - 1;
            return (
              <article
                key={s.n}
                className={["comic-outline flex flex-col overflow-hidden bg-white", wide ? "lg:col-span-2" : ""].join(" ")}
              >
                <div className="relative border-b-[3px] border-ink bg-white">
                  <img
                    src={s.image}
                    alt={s.heading}
                    loading="lazy"
                    className={["w-full object-contain p-2", wide ? "h-[240px]" : "h-[210px]"].join(" ")}
                  />
                  <span className="absolute left-3 top-3 rounded-full border-[2.5px] border-ink bg-white px-2.5 py-0.5 font-display text-[13px] font-bold text-ink">
                    {s.n} / {String(STATEMENTS.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 px-6 py-5">
                  <h3 className="font-display text-[22px] font-extrabold leading-snug text-foreground">{s.heading}</h3>
                  <p className="max-w-[62ch] text-[16px] leading-[1.65] text-text-secondary">{s.body}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>
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
