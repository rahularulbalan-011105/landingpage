import { formatDistanceToNow } from "date-fns";
import { Eye, Share2, Loader2, Pencil, Undo2, Heart, CopyPlus } from "lucide-react";
import type { Project } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";

function safeDistance(iso: string | null): string {
  if (!iso) return "recently";
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "recently";
  }
}

function IconBtn({
  label,
  onClick,
  guide,
  children,
}: {
  label: string;
  guide?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      data-guide={guide}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink bg-background text-foreground transition-colors hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

export function CommunityCard({
  project,
  isOwn,
  busy,
  highlighted,
  onView,
  onShare,
  onEdit,
  onUnpublish,
  onReuse,
  reusing,
  liked,
  onToggleLike,
}: {
  project: Project;
  isOwn: boolean;
  busy?: boolean;
  highlighted?: boolean;
  onView: () => void;
  onShare: () => void;
  onEdit?: () => void;
  onUnpublish?: () => void;
  /** Copy this build into the viewer's own dashboard (the original is never touched). */
  onReuse?: () => void;
  reusing?: boolean;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const author = project.author_name || "A builder";
  const initials = author.slice(0, 2).toUpperCase();

  return (
    <div
      id={`community-card-${project.id}`}
      className={[
        "comic-outline group relative flex flex-col scroll-mt-24 bg-background p-5 transition-all duration-150 hover:-translate-y-1",
        highlighted
          ? "ring-4 ring-sky ring-offset-2 ring-offset-background animate-pulse"
          : "",
      ].join(" ")}
    >
      {highlighted && (
        <span className="comic-outline-sm absolute -top-3 left-4 z-20 bg-sky px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide text-white">
          👉 Vote for this
        </span>
      )}
      {busy && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* title */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-extrabold leading-tight text-foreground line-clamp-2">
          {project.title || "Untitled robot"}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            onClick={onToggleLike}
            data-guide="c-like"
            aria-pressed={liked}
            title={liked ? "Remove your like" : "Like this build"}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-ink px-3 py-1 text-sm font-extrabold transition-all",
              liked
                ? "bg-primary text-white shadow-[2px_2px_0_var(--ink)]"
                : "bg-background text-foreground hover:bg-surface-2",
            ].join(" ")}
          >
            <Heart className={liked ? "h-4 w-4 fill-current" : "h-4 w-4"} />
            {project.likes_count}
          </button>
          {isOwn && <Badge className="border-2 border-ink bg-sky text-white">Yours</Badge>}
        </div>
      </div>

      {project.description && (
        <p className="mt-2 text-sm text-text-secondary line-clamp-2">{project.description}</p>
      )}

      {/* author */}
      <div className="mt-3 flex items-center gap-2.5">
        <span className="comic-outline-sm flex h-9 w-9 shrink-0 items-center justify-center bg-surface-2 font-display text-xs font-extrabold text-foreground">
          {initials}
        </span>
        {/* Display name only — a publisher's email address is never shown or
            fetched (community rows are world-readable). */}
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-bold text-foreground">{author}</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-text-tertiary">
        published {safeDistance(project.published_at)}
      </div>

      {/* actions */}
      <div className="mt-4 flex items-center gap-2 border-t-2 border-dashed border-ink/15 pt-4">
        {isOwn ? (
          <>
            <button
              onClick={onEdit}
              data-guide="c-edit"
              className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-bold text-white"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <IconBtn label="Copy share link" guide="c-share" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </IconBtn>
            <IconBtn label="Unpublish (move back to My Robots)" onClick={onUnpublish}>
              <Undo2 className="h-4 w-4" />
            </IconBtn>
          </>
        ) : (
          <>
            <button
              onClick={onView}
              data-guide="c-view"
              className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-bold text-white"
            >
              <Eye className="h-4 w-4" /> View
            </button>
            <button
              onClick={onReuse}
              data-guide="c-reuse"
              disabled={reusing}
              title="Copy this robot into My Robots as your own draft — the original stays untouched"
              className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-[#FFD34E] px-3 py-2 text-sm font-bold text-ink disabled:cursor-not-allowed disabled:opacity-70"
            >
              {reusing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CopyPlus className="h-4 w-4" />} Reuse
            </button>
            <IconBtn label="Copy share link" guide="c-share" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </IconBtn>
          </>
        )}
      </div>
    </div>
  );
}
