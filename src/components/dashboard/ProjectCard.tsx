import { formatDistanceToNow, format } from "date-fns";
import {
  ArrowRight,
  Share2,
  Download,
  Trash2,
  CheckCircle2,
  RotateCcw,
  Loader2,
  Globe2,
} from "lucide-react";
import type { Project } from "@/lib/projects";
import { Badge } from "@/components/ui/badge";

function safeDistance(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return "recently";
  }
}
function safeDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "—";
  }
}

export function ProjectCard({
  project,
  busy,
  onOpen,
  onShare,
  onDownload,
  onDelete,
  onToggleComplete,
  onTogglePublish,
}: {
  project: Project;
  busy?: boolean;
  onOpen: () => void;
  onShare: () => void;
  onDownload: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  onTogglePublish: () => void;
}) {
  const completed = project.status === "completed";
  const isPublic = project.is_public;

  return (
    <div className="comic-outline group relative flex flex-col bg-background p-5 transition-transform duration-150 hover:-translate-y-1">
      {busy && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      {/* Title + status */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-extrabold leading-tight text-foreground line-clamp-2">
          {project.title || "Untitled robot"}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <Badge
            className={
              completed
                ? "border-2 border-ink bg-primary text-white"
                : "border-2 border-ink bg-surface-2 text-foreground"
            }
          >
            {completed ? "Completed" : "Draft"}
          </Badge>
          {isPublic && (
            <Badge className="border-2 border-ink bg-sky text-white">
              <Globe2 className="mr-1 h-3 w-3" /> Public
            </Badge>
          )}
        </div>
      </div>

      {project.description && (
        <p className="mt-2 text-sm text-text-secondary line-clamp-2">{project.description}</p>
      )}

      {/* Meta */}
      <dl className="mt-3 space-y-0.5 text-xs text-text-tertiary">
        <div>
          Edited <span className="font-semibold text-text-secondary">{safeDistance(project.updated_at)}</span>
        </div>
        {completed && project.completed_at ? (
          <div>Completed {safeDate(project.completed_at)}</div>
        ) : (
          <div>Created {safeDate(project.created_at)}</div>
        )}
      </dl>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2 border-t-2 border-dashed border-ink/15 pt-4">
        <button
          onClick={onOpen}
          className="comic-btn inline-flex flex-1 items-center justify-center gap-1.5 bg-primary px-3 py-2 text-sm font-bold text-white"
        >
          Open <ArrowRight className="h-4 w-4" />
        </button>

        <IconAction
          label={isPublic ? "Remove from Community" : "Publish to Community"}
          onClick={onTogglePublish}
          active={isPublic}
        >
          <Globe2 className="h-4 w-4" />
        </IconAction>
        <IconAction label="Share" onClick={onShare}>
          <Share2 className="h-4 w-4" />
        </IconAction>
        <IconAction label="Download JSON" onClick={onDownload}>
          <Download className="h-4 w-4" />
        </IconAction>
        <IconAction
          label={completed ? "Reopen as draft" : "Mark complete"}
          onClick={onToggleComplete}
        >
          {completed ? <RotateCcw className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
        </IconAction>
        <IconAction label="Delete" onClick={onDelete} danger>
          <Trash2 className="h-4 w-4" />
        </IconAction>
      </div>
    </div>
  );
}

function IconAction({
  label,
  onClick,
  danger,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={[
        "inline-flex h-9 w-9 items-center justify-center rounded-md border-2 border-ink transition-colors",
        active
          ? "bg-sky text-white"
          : danger
            ? "bg-background text-destructive hover:bg-destructive hover:text-white"
            : "bg-background text-foreground hover:bg-surface-2",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
