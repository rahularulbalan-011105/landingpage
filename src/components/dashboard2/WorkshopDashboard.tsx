import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  Globe2,
  Heart,
  Link2,
  LogOut,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Youtube,
} from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { ServoBot } from "./ServoBot";
import { IconAction, isUntitled } from "./community-ui";

/**
 * Dashboard, two states:
 *  - no robots yet (first visit only): an empty workshop floor with Servo and one "New robot" spot.
 *  - after that: a calm project list. One Open button per row; everything else lives in a ⋯ menu.
 * Presentational only; data and actions come in as props.
 */

export type FloorRobot = {
  id: string;
  title: string;
  status: "draft" | "completed";
  editedAgo: string;
  created: string;
  isPublic?: boolean;
};
type Filter = "all" | "draft" | "completed";
export type RobotAction = "publish" | "share" | "download" | "toggle-complete" | "delete";
export type RenameHandler = (id: string, title: string) => void;


export function WorkshopDashboard({
  name,
  robots,
  onNew,
  onOpen,
  onAction,
  onRename,
  onSignOut,
}: {
  name: string;
  robots: FloorRobot[];
  onNew: () => void;
  onOpen: (id: string) => void;
  onAction: (id: string, action: RobotAction) => void;
  onRename: RenameHandler;
  onSignOut: () => void;
}) {
  const empty = robots.length === 0;
  const [naming, setNaming] = useState<FloorRobot | null>(null);

  // Publishing an untitled robot asks for a name first, so the community isn't a wall of "Untitled robot".
  const action = (id: string, a: RobotAction) => {
    const r = robots.find((x) => x.id === id);
    if (a === "publish" && r && !r.isPublic && isUntitled(r.title)) return setNaming(r);
    onAction(id, a);
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white font-ui text-wb-ink">
      {/* the workshop floor */}
      <div aria-hidden className={`pointer-events-none fixed inset-x-0 bottom-0 ${empty ? "h-[112vh]" : "h-[60vh] opacity-60"}`}>
        <div className="wb-floor" />
      </div>

      <FloatingBar name={name} onNew={onNew} onSignOut={onSignOut} />

      <main className="relative mx-auto max-w-[920px] px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
        {empty ? (
          <EmptyFloor onNew={onNew} />
        ) : (
          <ProjectList robots={robots} onOpen={onOpen} onAction={action} onRename={onRename} />
        )}
      </main>

      {naming && (
        <NameDialog
          initial=""
          onCancel={() => setNaming(null)}
          onSave={(title) => {
            onRename(naming.id, title);
            onAction(naming.id, "publish");
            setNaming(null);
          }}
        />
      )}
    </div>
  );
}

// ── The list ─────────────────────────────────────────────────────────────────

function ProjectList({
  robots,
  onOpen,
  onAction,
  onRename,
}: {
  robots: FloorRobot[];
  onOpen: (id: string) => void;
  onAction: (id: string, action: RobotAction) => void;
  onRename: RenameHandler;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
  const count = (f: Filter) => (f === "all" ? robots.length : robots.filter((r) => r.status === f).length);
  const shown = robots.filter((r) => (filter === "all" || r.status === filter) && r.title.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
        <h1 className="font-brand text-[28px] font-bold text-wb-ink sm:text-[32px]" style={{ letterSpacing: "-0.045em" }}>
          My robots
        </h1>
        <div role="group" aria-label="Filter" className="flex items-center gap-4 pb-1.5 text-[14px]">
          {(["all", "draft", "completed"] as const).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`relative pb-1 transition-colors ${filter === f ? "font-semibold text-wb-ink" : "text-wb-ink-3 hover:text-wb-ink"}`}
            >
              {f === "all" ? "All" : f === "draft" ? "Drafts" : "Completed"} <span className="font-key text-[12px] opacity-60">{count(f)}</span>
              {filter === f && <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-wb-orange" />}
            </button>
          ))}
        </div>
        <label className="relative ml-auto w-full sm:w-56">
          <span className="sr-only">Search robots</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-ink-3" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search"
            className="h-9 w-full rounded-[10px] border border-wb-line bg-white pl-9 pr-3 text-[14px] placeholder:text-wb-ink-3 focus:border-wb-orange focus:outline-none"
          />
        </label>
      </div>

      <ul className="mt-6 overflow-visible rounded-[18px] border border-wb-line bg-white shadow-[0_18px_40px_-28px_rgba(28,36,33,0.35)]">
        {shown.map((r, i) => (
          <Row key={r.id} robot={r} last={i === shown.length - 1} onOpen={() => onOpen(r.id)} onAction={(a) => onAction(r.id, a)} onRename={(title) => onRename(r.id, title)} />
        ))}
        {shown.length === 0 && <li className="px-6 py-10 text-center text-[14px] text-wb-ink-3">No robots match that.</li>}
      </ul>
    </>
  );
}

function Row({
  robot,
  last,
  onOpen,
  onAction,
  onRename,
}: {
  robot: FloorRobot;
  last: boolean;
  onOpen: () => void;
  onAction: (a: RobotAction) => void;
  onRename: (title: string) => void;
}) {
  const done = robot.status === "completed";
  const pub = !!robot.isPublic;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(robot.title);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(robot.title);
      requestAnimationFrame(() => inputRef.current?.select());
    }
  }, [editing, robot.title]);

  const commit = () => {
    const v = draft.trim();
    if (v && v !== robot.title) onRename(v);
    setEditing(false);
  };
  const share = () => {
    onAction("share");
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <li className={`group relative flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-wb-bench/70 sm:gap-4 sm:px-5 ${last ? "" : "border-b border-wb-line"}`}>
      <Cube done={done} />

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setEditing(false);
            }}
            maxLength={200}
            aria-label="Robot name"
            className="w-full max-w-[22em] rounded-[8px] border border-wb-orange bg-white px-2 py-0.5 text-[15px] font-semibold text-wb-ink focus:outline-none"
          />
        ) : (
          <button type="button" onClick={onOpen} className="block max-w-full text-left">
            <span className="flex items-center gap-2">
              <span className="truncate text-[15px] font-semibold text-wb-ink">{robot.title}</span>
              {pub && <Globe2 aria-label="Published to community" className="h-3.5 w-3.5 shrink-0 text-wb-orange" />}
            </span>
          </button>
        )}
        <span className="mt-0.5 block truncate font-key text-[11.5px] text-wb-ink-3">
          Edited {robot.editedAgo}
          <span className="hidden sm:inline"> · Created {robot.created}</span>
        </span>
      </div>

      {/* status tag doubles as the complete/reopen switch */}
      <button
        type="button"
        onClick={() => onAction("toggle-complete")}
        title={done ? "Click to reopen as draft" : "Click to mark as completed"}
        aria-label={done ? "Completed. Click to reopen as draft" : "Draft. Click to mark as completed"}
        className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[12px] font-semibold transition-colors sm:inline-flex ${
          done ? "bg-[#E8F7EE] text-[#1F8F55] hover:bg-[#D6F0E0]" : "bg-wb-bench text-wb-ink-2 hover:bg-[#E4E9E6] hover:text-wb-ink"
        }`}
      >
        {done && <Check className="h-3 w-3" strokeWidth={3} />}
        {done ? "Completed" : "Draft"}
      </button>

      {/* the two actions that matter, shown on hover (desktop) */}
      <span className="hidden shrink-0 items-center gap-0.5 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100 group-hover:opacity-100 md:flex">
        <IconAction label={copied ? "Link copied" : "Copy share link"} onClick={share}>
          {copied ? <Check className="h-4 w-4 text-wb-axis" strokeWidth={3} /> : <Link2 className="h-4 w-4" />}
        </IconAction>
        <IconAction label={pub ? "Remove from community" : "Publish to community"} onClick={() => onAction("publish")} active={pub}>
          <Globe2 className="h-4 w-4" />
        </IconAction>
      </span>

      <button
        type="button"
        onClick={onOpen}
        className="shrink-0 rounded-[10px] border border-wb-line px-3.5 py-1.5 text-[13.5px] font-semibold text-wb-ink transition-colors group-hover:border-wb-orange group-hover:bg-wb-orange group-hover:text-white"
      >
        Open
      </button>
      <RowMenu done={done} isPublic={pub} onAction={onAction} onRename={() => setEditing(true)} onShare={share} />
    </li>
  );
}

function RowMenu({
  done,
  isPublic,
  onAction,
  onRename,
  onShare,
}: {
  done: boolean;
  isPublic: boolean;
  onAction: (a: RobotAction) => void;
  onRename: () => void;
  onShare: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return setConfirm(false);
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };
  const base = "flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-left text-[13.5px] hover:bg-wb-bench";
  const item = `${base} text-wb-ink-2`;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-[9px] text-wb-ink-3 transition-colors hover:bg-white hover:text-wb-ink"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-10 z-20 w-56 rounded-[14px] border border-wb-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(28,36,33,0.35)]">
          {/* on phones there's no hover, so the row actions live here too */}
          <div className="md:hidden">
            <button type="button" role="menuitem" onClick={run(onShare)} className={item}>
              <Link2 className="h-4 w-4" /> Copy share link
            </button>
            <button type="button" role="menuitem" onClick={run(() => onAction("publish"))} className={item}>
              <Globe2 className="h-4 w-4" /> {isPublic ? "Remove from community" : "Publish to community"}
            </button>
            <button type="button" role="menuitem" onClick={run(() => onAction("toggle-complete"))} className={item}>
              {done ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />} {done ? "Reopen as draft" : "Mark as completed"}
            </button>
            <div className="my-1 h-px bg-wb-line" />
          </div>
          <button type="button" role="menuitem" onClick={run(onRename)} className={item}>
            <Pencil className="h-4 w-4" /> Rename
          </button>
          <button type="button" role="menuitem" onClick={run(() => onAction("download"))} className={item}>
            <Download className="h-4 w-4" /> Download
          </button>
          <div className="my-1 h-px bg-wb-line" />
          {confirm ? (
            <div className="flex items-center gap-1.5 px-2 py-1.5">
              <span className="flex-1 pl-1 text-[13px] text-wb-ink-2">Delete for good?</span>
              <button type="button" onClick={() => setConfirm(false)} className="rounded-[8px] px-2 py-1 text-[12.5px] font-semibold text-wb-ink-2 hover:bg-wb-bench">
                Cancel
              </button>
              <button type="button" onClick={run(() => onAction("delete"))} className="rounded-[8px] bg-[#D13B41] px-2.5 py-1 text-[12.5px] font-semibold text-white hover:brightness-105">
                Delete
              </button>
            </div>
          ) : (
            <button type="button" role="menuitem" onClick={() => setConfirm(true)} className={`${base} text-[#D13B41]`}>
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
/** Asked when publishing an untitled robot. */
function NameDialog({ initial, onCancel, onSave }: { initial: string; onCancel: () => void; onSave: (title: string) => void }) {
  const [v, setV] = useState(initial);
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    ref.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onCancel]);
  const ok = v.trim().length > 0 && !isUntitled(v);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[rgba(20,26,23,0.45)] px-4" role="dialog" aria-modal="true" aria-labelledby="name-title" onMouseDown={onCancel}>
      <form
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (ok) onSave(v.trim());
        }}
        className="w-full max-w-[400px] rounded-[20px] bg-white p-6 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.45)]"
      >
        <h2 id="name-title" className="font-brand text-[20px] font-bold text-wb-ink" style={{ letterSpacing: "-0.035em" }}>
          Name your robot first
        </h2>
        <p className="mt-1.5 text-[14px] leading-[1.5] text-wb-ink-2">Builders find robots by name. Give yours one before it goes public.</p>
        <input
          ref={ref}
          value={v}
          onChange={(e) => setV(e.target.value)}
          maxLength={200}
          placeholder="e.g. Stair-climbing spider"
          aria-label="Robot name"
          className="mt-4 h-11 w-full rounded-[12px] border border-wb-line px-3.5 text-[15px] text-wb-ink placeholder:text-wb-ink-3 focus:border-wb-orange focus:outline-none"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-[10px] px-4 py-2 text-[14px] font-semibold text-wb-ink-2 hover:bg-wb-bench">
            Cancel
          </button>
          <button type="submit" disabled={!ok} className="rounded-[10px] bg-wb-orange px-4 py-2 text-[14px] font-semibold text-white transition-opacity disabled:opacity-40">
            Name and publish
          </button>
        </div>
      </form>
    </div>
  );
}

/** The editor's default blue cube; green once a robot is completed. */
function Cube({ done }: { done: boolean }) {
  const [t, l, r] = done ? ["#8FE0AE", "#4BC27C", "#33A564"] : ["#8ACDF6", "#56B0F0", "#3A97DA"];
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-wb-bench">
      <svg viewBox="0 0 80 80" className="h-6 w-6" aria-hidden>
        <path d="M40 10 L68 24 L40 38 L12 24 Z" fill={t} />
        <path d="M12 24 L40 38 L40 70 L12 56 Z" fill={l} />
        <path d="M68 24 L40 38 L40 70 L68 56 Z" fill={r} />
      </svg>
    </span>
  );
}

// ── Top: the editor's floating pill ──────────────────────────────────────────

function FloatingBar({
  name,
  onNew,
  onSignOut,
}: {
  name: string;
  onNew: () => void;
  onSignOut: () => void;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setMenu(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-3">
      <div className="flex items-center gap-1 rounded-full border border-wb-line bg-white/95 p-1.5 shadow-[0_12px_30px_-16px_rgba(28,36,33,0.4)] backdrop-blur">
        <Link to="/" aria-label="Constructa home" className="px-2">
          <img src={logo} alt="" className="h-7 w-auto" />
        </Link>
        <span className="mx-1 h-5 w-px bg-wb-line" />
        <span aria-current="page" className="whitespace-nowrap rounded-full bg-wb-ink px-3 py-1.5 text-[13.5px] font-semibold text-white">
          My robots
        </span>
        <Link
          to="/community"
          className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13.5px] font-semibold text-wb-ink-2 transition-colors hover:text-wb-ink"
        >
          Community
        </Link>
        <span className="mx-1 h-5 w-px bg-wb-line" />
        <button
          type="button"
          onClick={onNew}
          aria-label="New robot"
          className="inline-flex h-8 items-center gap-1.5 rounded-full bg-wb-orange px-2.5 text-[13px] font-semibold text-white hover:brightness-105 sm:px-3"
        >
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">New robot</span>
        </button>
        <div ref={ref} className="relative">
          <button
            type="button"
            aria-label="Account"
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
            className="flex h-8 items-center gap-0.5 rounded-full pl-0.5 pr-1 hover:bg-wb-bench"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-wb-bench text-[11px] font-bold text-wb-ink">{name.slice(0, 2).toUpperCase()}</span>
            <ChevronDown className="h-3 w-3 text-wb-ink-3" />
          </button>
          {menu && (
            <div className="absolute right-0 top-11 w-56 rounded-[14px] border border-wb-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(28,36,33,0.35)]">
              <p className="px-3 pb-2 pt-1.5 text-[13px] font-semibold">{name}</p>
              <a href="https://www.youtube.com/@AtumX" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13.5px] text-wb-ink-2 hover:bg-wb-bench">
                <Youtube className="h-4 w-4" /> Tutorials
              </a>
              <a href="https://discord.gg/QzEJ4Vrgn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13.5px] text-wb-ink-2 hover:bg-wb-bench">
                <MessageCircle className="h-4 w-4" /> Discord community
              </a>
              <div className="my-1 h-px bg-wb-line" />
              <button
                type="button"
                onClick={onSignOut}
                className="flex w-full items-center gap-2.5 rounded-[9px] px-3 py-2 text-[13.5px] text-wb-ink-2 hover:bg-wb-bench"
              >
                <LogOut className="h-4 w-4" /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── First visit ──────────────────────────────────────────────────────────────

function EmptyFloor({ onNew }: { onNew: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-brand text-[26px] font-bold text-wb-ink sm:text-[32px]" style={{ letterSpacing: "-0.045em" }}>
        Your workshop is empty.
      </p>
      <div className="mt-10 flex items-end gap-6">
        <ServoBot size={150} mood={hover ? "happy" : "idle"} />
        <button
          type="button"
          onClick={onNew}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onFocus={() => setHover(true)}
          onBlur={() => setHover(false)}
          className="group relative flex h-[150px] w-[190px] flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-wb-orange/60 bg-white/70 backdrop-blur transition-colors hover:border-wb-orange"
        >
          <span className="absolute inset-0 animate-pulse rounded-[12px] shadow-[0_0_0_6px_rgba(255,107,53,0.08)]" aria-hidden />
          <Plus className="h-7 w-7 text-wb-orange" strokeWidth={2.2} />
          <span className="text-[14px] font-semibold text-wb-ink">New robot</span>
        </button>
      </div>
    </div>
  );
}
