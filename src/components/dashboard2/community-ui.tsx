import { useEffect, useRef, useState } from "react";
import { Check, Copy, Heart, Link2, MoreHorizontal, Search } from "lucide-react";

/**
 * The community leaderboard of published robots.
 *
 * Lives in its own file because it is PUBLIC: /community renders it for anyone,
 * signed in or not, while the dashboard stays behind the auth gate. The caller
 * decides what each action does, so the signed-out page can bounce "reuse" and
 * "like" to sign-up without this component knowing anything about accounts.
 */

export type CommunityRobot = {
  id: string;
  title: string;
  author: string;
  likes: number;
  liked: boolean;
  publishedAgo: string;
  /** minutes since publishing, for the Newest sort */
  age: number;
  own?: boolean;
};
export type CommunityAction = "like" | "view" | "reuse" | "share";

export const isUntitled = (t: string) => /^untitled robot/i.test(t.trim());

export function IconAction({ label, onClick, active, children }: { label: string; onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <span className="relative">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
        className={`peer flex h-8 w-8 items-center justify-center rounded-[9px] transition-colors ${
          active ? "bg-[#FFF0E9] text-wb-orange" : "text-wb-ink-3 hover:bg-white hover:text-wb-ink"
        }`}
      >
        {children}
      </button>
      <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-[6px] bg-wb-ink px-2 py-1 text-[11px] font-medium text-white opacity-0 transition-opacity peer-hover:opacity-100 peer-focus-visible:opacity-100">
        {label}
      </span>
    </span>
  );
}

// ── Community: a leaderboard of published robots ────────────────────────────

export function CommunityList({ robots, onAction }: { robots: CommunityRobot[]; onAction: (id: string, a: CommunityAction) => void }) {
  const [sort, setSort] = useState<"liked" | "new">("liked");
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const ranked = [...robots].sort((a, b) => b.likes - a.likes);
  const rankOf = new Map(ranked.map((r, i) => [r.id, i + 1]));
  const list = (sort === "liked" ? ranked : [...robots].sort((a, b) => a.age - b.age)).filter(
    (r) => !needle || r.author.toLowerCase().includes(needle) || r.title.toLowerCase().includes(needle),
  );

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <h1 className="font-brand text-[28px] font-bold text-wb-ink sm:text-[32px]" style={{ letterSpacing: "-0.045em" }}>
          Community
        </h1>
        <div role="group" aria-label="Sort" className="flex items-center gap-4 pb-1.5 text-[14px]">
          {(
            [
              ["liked", "Most liked"],
              ["new", "Newest"],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              aria-pressed={sort === k}
              onClick={() => setSort(k)}
              className={`relative pb-1 transition-colors ${sort === k ? "font-semibold text-wb-ink" : "text-wb-ink-3 hover:text-wb-ink"}`}
            >
              {label}
              {sort === k && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-wb-orange" />}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-56">
          <span className="sr-only">Search builds or makers</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search builds or makers"
            className="h-9 w-full rounded-[10px] border border-wb-line bg-white pl-9 pr-3 text-[14px] placeholder:text-wb-ink-3 focus:border-wb-orange focus:outline-none"
          />
        </label>
      </div>

      <ul className="mt-6 overflow-visible rounded-[18px] border border-wb-line bg-white shadow-[0_18px_40px_-28px_rgba(28,36,33,0.35)]">
        {list.map((r, i) => (
          <CommunityRow key={r.id} robot={r} rank={sort === "liked" ? rankOf.get(r.id)! : null} last={i === list.length - 1} onAction={(a) => onAction(r.id, a)} />
        ))}
        {list.length === 0 && <li className="px-6 py-10 text-center text-[14px] text-wb-ink-3">No builds match that.</li>}
      </ul>
    </>
  );
}

function CommunityRow({
  robot,
  rank,
  last,
  onAction,
}: {
  robot: CommunityRobot;
  rank: number | null;
  last: boolean;
  onAction: (a: CommunityAction) => void;
}) {
  const [copied, setCopied] = useState(false);
  const top = rank !== null && rank <= 3;
  const initials = robot.author
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const untitled = isUntitled(robot.title);
  const share = () => {
    onAction("share");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <li className={`group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-wb-bench/70 sm:gap-4 sm:px-5 ${last ? "" : "border-b border-wb-line"}`}>
      {rank !== null && (
        <span className={`w-5 shrink-0 text-center font-brand text-[15px] font-bold tabular-nums sm:w-6 ${top ? "text-wb-orange" : "text-wb-ink-3"}`}>{rank}</span>
      )}
      <span
        className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold sm:flex ${
          top ? "bg-[#FFF0E9] text-wb-orange" : "bg-wb-bench text-wb-ink-2"
        }`}
      >
        {initials || "?"}
      </span>
      <button type="button" onClick={() => onAction("view")} className="min-w-0 flex-1 text-left">
        <span className="flex items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-wb-ink">{robot.author}</span>
          {robot.own && <span className="shrink-0 rounded-full bg-wb-ink px-1.5 py-px text-[10.5px] font-semibold text-white">You</span>}
        </span>
        <span className="mt-0.5 block truncate font-key text-[11.5px]">
          <span className={untitled ? "text-wb-ink-3/70" : "text-wb-ink-2"}>{robot.title}</span>
          <span className="text-wb-ink-3"> · {robot.publishedAgo}</span>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onAction("like")}
        aria-pressed={robot.liked}
        aria-label={robot.liked ? `Unlike (${robot.likes} likes)` : `Like (${robot.likes} likes)`}
        className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[13px] font-semibold tabular-nums transition-colors sm:gap-1.5 sm:px-2.5 ${
          robot.liked ? "bg-[#FFF0E9] text-wb-orange" : "text-wb-ink-2 hover:bg-white hover:text-wb-ink"
        }`}
      >
        <Heart className={`h-4 w-4 ${robot.liked ? "fill-current" : ""}`} />
        {robot.likes}
      </button>

      <span className="hidden shrink-0 items-center gap-1.5 md:flex">
        <span className="opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <IconAction label={copied ? "Link copied" : "Copy share link"} onClick={share}>
            {copied ? <Check className="h-4 w-4 text-wb-axis" strokeWidth={3} /> : <Link2 className="h-4 w-4" />}
          </IconAction>
        </span>
        <button
          type="button"
          onClick={() => onAction("reuse")}
          className="inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[13px] font-semibold text-wb-ink-2 transition-colors hover:bg-white hover:text-wb-ink"
        >
          <Copy className="h-3.5 w-3.5" /> Reuse
        </button>
      </span>
      <button
        type="button"
        onClick={() => onAction("view")}
        className="shrink-0 rounded-[10px] border border-wb-line px-3 py-1.5 sm:px-3.5 text-[13.5px] font-semibold text-wb-ink transition-colors group-hover:border-wb-orange group-hover:bg-wb-orange group-hover:text-white"
      >
        View
      </button>
      <CommunityMenu onReuse={() => onAction("reuse")} onShare={share} />
    </li>
  );
}

/** Phones only: Reuse and Share live here since there's no hover. */
function CommunityMenu({ onReuse, onShare }: { onReuse: () => void; onShare: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const item = "flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13.5px] text-wb-ink-2 hover:bg-wb-bench";
  return (
    <div ref={ref} className="relative shrink-0 md:hidden">
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-wb-ink-3 hover:bg-white hover:text-wb-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-20 w-48 rounded-[14px] border border-wb-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(28,36,33,0.35)]">
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onReuse())} className={item}>
            <Copy className="h-4 w-4" /> Reuse
          </button>
          <button type="button" role="menuitem" onClick={() => (setOpen(false), onShare())} className={item}>
            <Link2 className="h-4 w-4" /> Copy share link
          </button>
        </div>
      )}
    </div>
  );
}

