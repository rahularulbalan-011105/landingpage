import { useState } from "react";
import {
  FolderOpen,
  Globe2,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  FileClock,
  CheckCircle2,
  Youtube,
  Instagram,
  ExternalLink,
} from "lucide-react";

export type DashFilter = "all" | "draft" | "completed";

const WHATSAPP_URL = "https://chat.whatsapp.com/Kxikh3QnPIaHW92hssMTRK";
const TUTORIAL_URL = "https://youtu.be/cxg7tS3il8M";
const INSTAGRAM_URL = "https://www.instagram.com/constructa.io?stkn=cGkxOGUxdHY4NDE5";

/**
 * Dashboard sidebar: My Robots (expands to All / Drafts / Completed) · Community ·
 * WhatsApp community · YouTube tutorial · Instagram. On small screens it sits
 * above the content instead of beside it.
 */
export function DashboardSidebar({
  mode,
  filter,
  counts,
  onSelectMine,
  onSelectCommunity,
}: {
  /** "home" = nothing selected (the welcome view). */
  mode: "home" | "mine" | "community";
  filter: DashFilter;
  counts: Record<DashFilter, number>;
  onSelectMine: (f: DashFilter) => void;
  onSelectCommunity: () => void;
}) {
  const [open, setOpen] = useState(mode === "mine");

  return (
    <aside className="lg:sticky lg:top-[100px] lg:self-start">
      <nav className="comic-outline flex flex-col gap-1 bg-background p-3" aria-label="Dashboard">
        {/* My Robots — click toggles the sub-list and shows your robots */}
        <button
          onClick={() => {
            if (mode !== "mine") { setOpen(true); onSelectMine(filter); }
            else setOpen((v) => !v);
          }}
          aria-expanded={open}
          data-guide="my-robots"
          className={navCls(mode === "mine")}
        >
          <FolderOpen className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">My Robots</span>
          <span className={mode === "mine" ? "text-white/80" : "text-text-tertiary"}>{counts.all}</span>
          {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        </button>

        {open && (
          <div className="ml-4 flex flex-col gap-0.5 border-l-2 border-dashed border-ink/20 pl-2">
            <SubItem
              active={mode === "mine" && filter === "all"}
              icon={<LayoutGrid className="h-3.5 w-3.5" />}
              label="All"
              count={counts.all}
              onClick={() => onSelectMine("all")}
            />
            <SubItem
              active={mode === "mine" && filter === "draft"}
              icon={<FileClock className="h-3.5 w-3.5" />}
              label="Drafts"
              count={counts.draft}
              onClick={() => onSelectMine("draft")}
            />
            <SubItem
              active={mode === "mine" && filter === "completed"}
              icon={<CheckCircle2 className="h-3.5 w-3.5" />}
              label="Completed"
              count={counts.completed}
              onClick={() => onSelectMine("completed")}
            />
          </div>
        )}

        <button onClick={onSelectCommunity} data-guide="community" className={navCls(mode === "community")}>
          <Globe2 className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">Community</span>
        </button>
      </nav>

      <div className="mt-4 flex flex-col gap-2">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-guide="whatsapp"
          className="comic-btn inline-flex items-center justify-center gap-2 bg-[#25D366] px-4 py-2.5 text-sm font-bold text-white"
        >
          <WhatsAppIcon />
          WhatsApp Community
        </a>
        <ExtLink guide="tutorial" href={TUTORIAL_URL} icon={<Youtube className="h-4 w-4 text-[#FF0000]" />} label="Watch the tutorial" />
        <ExtLink guide="instagram" href={INSTAGRAM_URL} icon={<Instagram className="h-4 w-4 text-[#E1306C]" />} label="Follow on Instagram" />
      </div>
    </aside>
  );
}

const navCls = (active: boolean) =>
  [
    "inline-flex w-full items-center gap-2 rounded-lg border-[2.5px] px-3 py-2 text-sm font-extrabold transition-all",
    active
      ? "border-ink bg-primary text-white shadow-[3px_3px_0_var(--ink)]"
      : "border-transparent text-foreground hover:bg-surface-2",
  ].join(" ");

function SubItem({
  active,
  icon,
  label,
  count,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={[
        "inline-flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-bold transition-colors",
        active ? "bg-primary/15 text-primary" : "text-text-secondary hover:bg-surface-2 hover:text-foreground",
      ].join(" ")}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      <span className="text-xs text-text-tertiary">{count}</span>
    </button>
  );
}

function ExtLink({ guide, href, icon, label }: { guide: string; href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-guide={guide}
      className="comic-outline-sm inline-flex items-center gap-2 bg-background px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
    >
      {icon}
      <span className="flex-1">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-text-tertiary" />
    </a>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}
