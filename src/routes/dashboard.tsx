import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { DeleteConfirm } from "@/components/dashboard/DeleteConfirm";
import { Input } from "@/components/ui/input";
import {
  listProjects,
  createProject,
  deleteProject,
  markComplete,
  reopenDraft,
  type Project,
} from "@/lib/projects";
import { downloadProjectJSON } from "@/lib/download";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | Constructa" }] }),
  component: () => (
    <RequireAuth>
      <Dashboard />
    </RequireAuth>
  ),
});

type Filter = "all" | "draft" | "completed";

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [shareTarget, setShareTarget] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);

  const createMut = useMutation({
    mutationFn: () => createProject(),
    onSuccess: (p) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      navigate({ to: "/project/$id", params: { id: p.id } });
    },
    onError: () => toast.error("Couldn't create the project. Please try again."),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: (id) => setBusyId(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success("Project deleted.");
    },
    onError: () => toast.error("Couldn't delete the project."),
    onSettled: () => setBusyId(null),
  });

  const completeMut = useMutation({
    mutationFn: (p: Project) => (p.status === "completed" ? reopenDraft(p.id) : markComplete(p.id)),
    onMutate: (p) => setBusyId(p.id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(updated.status === "completed" ? "Marked as complete 🎉" : "Reopened as draft.");
    },
    onError: () => toast.error("Couldn't update the project."),
    onSettled: () => setBusyId(null),
  });

  const counts = useMemo(() => {
    const all = projects ?? [];
    return {
      all: all.length,
      draft: all.filter((p) => p.status === "draft").length,
      completed: all.filter((p) => p.status === "completed").length,
    };
  }, [projects]);

  const visible = useMemo(() => {
    let list = projects ?? [];
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.title || "").toLowerCase().includes(q));
    return list;
  }, [projects, filter, search]);

  const hasAny = (projects?.length ?? 0) > 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onNewProject={() => createMut.mutate()} creating={createMut.isPending} />

      <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8">
        {/* Controls */}
        {hasAny && (
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "draft", "completed"] as Filter[]).map((f) => (
                <FilterPill
                  key={f}
                  active={filter === f}
                  label={f === "all" ? "All" : f === "draft" ? "Drafts" : "Completed"}
                  count={counts[f]}
                  onClick={() => setFilter(f)}
                />
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your robots…"
                className="pl-9"
              />
            </div>
          </div>
        )}

        {/* Body */}
        {isLoading ? (
          <SkeletonGrid />
        ) : isError ? (
          <ErrorState onRetry={() => refetch()} />
        ) : !hasAny ? (
          <EmptyState onCreate={() => createMut.mutate()} creating={createMut.isPending} />
        ) : visible.length === 0 ? (
          <NoMatches onClear={() => { setSearch(""); setFilter("all"); }} />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                busy={busyId === p.id}
                onOpen={() => navigate({ to: "/project/$id", params: { id: p.id } })}
                onShare={() => setShareTarget(p)}
                onDownload={() => {
                  downloadProjectJSON(p);
                  toast.success("Download started.");
                }}
                onDelete={() => setDeleteTarget(p)}
                onToggleComplete={() => completeMut.mutate(p)}
              />
            ))}
          </div>
        )}
      </main>

      <ShareDialog
        project={shareTarget}
        open={!!shareTarget}
        onOpenChange={(v) => !v && setShareTarget(null)}
      />
      <DeleteConfirm
        project={deleteTarget}
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteMut.mutate(deleteTarget.id);
          setDeleteTarget(null);
        }}
      />
    </div>
  );
}

function FilterPill({
  active,
  label,
  count,
  onClick,
}: {
  active: boolean;
  label: string;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "inline-flex items-center gap-2 rounded-full border-[2.5px] border-ink px-4 py-1.5 text-sm font-bold transition-all",
        active
          ? "bg-primary text-white shadow-[3px_3px_0_var(--ink)]"
          : "bg-background text-foreground hover:bg-surface-2",
      ].join(" ")}
    >
      {label}
      <span className={active ? "text-white/80" : "text-text-tertiary"}>{count}</span>
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="comic-outline animate-pulse bg-background p-5">
          <div className="h-5 w-2/3 rounded bg-surface-2" />
          <div className="mt-3 h-3 w-full rounded bg-surface-1" />
          <div className="mt-2 h-3 w-1/2 rounded bg-surface-1" />
          <div className="mt-6 h-9 w-full rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ onCreate, creating }: { onCreate: () => void; creating: boolean }) {
  return (
    <div className="comic-outline mx-auto mt-6 flex max-w-xl flex-col items-center bg-background halftone px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-primary text-white">
        <Sparkles className="h-8 w-8" />
      </div>
      <h2 className="font-display text-2xl font-extrabold text-foreground">No robots yet</h2>
      <p className="mt-2 max-w-sm text-text-secondary">
        Create your first Constructa project and start building. Everything you make auto-saves here.
      </p>
      <button
        onClick={onCreate}
        disabled={creating}
        className="comic-btn mt-6 inline-flex items-center justify-center gap-2 bg-primary px-6 py-3 text-base font-bold text-white disabled:cursor-not-allowed"
      >
        {creating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
        Create new project
      </button>
    </div>
  );
}

function NoMatches({ onClear }: { onClear: () => void }) {
  return (
    <div className="mt-10 text-center">
      <p className="font-display text-lg font-bold text-foreground">No robots match that.</p>
      <button onClick={onClear} className="mt-2 text-sm font-bold text-primary hover:underline">
        Clear search & filters
      </button>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="comic-outline mx-auto mt-6 flex max-w-md flex-col items-center bg-background px-8 py-12 text-center">
      <h2 className="font-display text-xl font-extrabold text-foreground">Couldn't load your projects</h2>
      <p className="mt-2 text-sm text-text-secondary">
        Something went wrong reaching the server. Check your connection and try again.
      </p>
      <button
        onClick={onRetry}
        className="comic-btn mt-5 inline-flex items-center justify-center bg-primary px-5 py-2.5 text-sm font-bold text-white"
      >
        Retry
      </button>
    </div>
  );
}
