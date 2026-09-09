import { formatDistanceToNow } from "date-fns";
import { Eye, GitFork, Share2, Loader2, Cpu, Pencil, Undo2, Heart } from "lucide-react";
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

function parts(p: Project): number {
  const c = p.content as { objects?: unknown[] } | null;
  return Array.isArray(c?.objects) ? c!.objects!.length : 0;
}

function IconBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
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
  onView,
  onRemix,
  onShare,
  onEdit,
  onUnpublish,
  liked,
  onToggleLike,
}: {
  project: Project;
  isOwn: boolean;
  busy?: boolean;
  onView: () => void;
  onRemix: () => void;
  onShare: () => void;
  onEdit?: () => void;
  onUnpublish?: () => void;
  liked: boolean;
  onToggleLike: () => void;
}) {
  const author = project.author_name || "A builder";
  const initials = author.slice(0, 2).toUpperCase();

  return (
    <div className="comic-outline group relative flex flex-col bg-background p-5 transition-transform duration-150 hover:-translate-y-1">
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
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-bold text-foreground">{author}</div>
          {project.author_email && (
            <div className="truncate text-xs text-text-tertiary">{project.author_email}</div>
          )}
        </div>
      </div>

      <div className="mt-2 flex items-center gap-3 text-xs text-text-tertiary">
        <span className="inline-flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5" /> {parts(project)} parts
        </span>
        <span>· published {safeDistance(project.published_at)}</span>
      </div>

      {/* actions */}
      <div className="mt-4 flex items-center gap-2 border-t-2 border-dashed border-ink/15 pt-4">
        {isOwn ? (
          <>
            <button
              onClick={onEdit}
              className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-bold text-white"
            >
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <IconBtn label="Copy share link" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </IconBtn>
            <IconBtn label="Unpublish (move back to My Robots)" onClick={onUnpublish}>
              <Undo2 className="h-4 w-4" />
            </IconBtn>
          </>
        ) : (
          <>
            <button
              onClick={onRemix}
              className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-bold text-white"
            >
              <GitFork className="h-4 w-4" /> Remix
            </button>
            <IconBtn label="View (read-only)" onClick={onView}>
              <Eye className="h-4 w-4" />
            </IconBtn>
            <IconBtn label="Copy share link" onClick={onShare}>
              <Share2 className="h-4 w-4" />
            </IconBtn>
          </>
        )}
      </div>
    </div>
  );
}
