import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Sparkles, Loader2 } from "lucide-react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth, displayName } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { CommunityCard } from "@/components/dashboard/CommunityCard";
import { ShareDialog } from "@/components/dashboard/ShareDialog";
import { DeleteConfirm } from "@/components/dashboard/DeleteConfirm";
import { Input } from "@/components/ui/input";
import {
  listProjects,
  listCommunity,
  getProject,
  createProject,
  deleteProject,
  markComplete,
  reopenDraft,
  publishToCommunity,
  unpublishFromCommunity,
  listMyLikes,
  likeProject,
  unlikeProject,
  forkProject,
  type Project,
} from "@/lib/projects";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { BoltGuide } from "@/components/guide/BoltGuide";
import { downloadProjectJSON } from "@/lib/download";
import { openWorkspace } from "@/lib/workspace";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | Constructa" }] }),
  validateSearch: (search: Record<string, unknown>): { highlight?: string } => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
  }),
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
  const { user } = useAuth();
  const { highlight } = Route.useSearch();

  // A shared community link (?highlight=<id>) opens straight on the Community tab
  // with that build flashed, so voters know exactly which one they came for.
  // Nothing is selected by default: the dashboard opens on the welcome view
  // (Bolt + what Constructa does). A shared community link opens Community.
  const [mode, setMode] = useState<"home" | "mine" | "community">(highlight ? "community" : "home");
  const [highlightId, setHighlightId] = useState<string | null>(highlight ?? null);

  const { data: projects, isLoading, isError, refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: listProjects,
  });

  const {
    data: community,
    isLoading: commLoading,
    isError: commError,
    refetch: commRefetch,
  } = useQuery({
    queryKey: ["community"],
    queryFn: listCommunity,
    enabled: mode === "community",
  });

  const { data: myLikes } = useQuery({
    queryKey: ["myLikes"],
    queryFn: listMyLikes,
    enabled: mode === "community",
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

  const publishMut = useMutation({
    mutationFn: (p: Project) =>
      p.is_public ? unpublishFromCommunity(p.id) : publishToCommunity(p.id),
    onMutate: (p) => setBusyId(p.id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      qc.invalidateQueries({ queryKey: ["community"] });
      toast.success(
        updated.is_public ? "Published to the Community 🌍" : "Removed from the Community.",
      );
    },
    onError: () => toast.error("Couldn't update community sharing."),
    onSettled: () => setBusyId(null),
  });

  // Reuse = copy a community build into MY dashboard as a private draft. The list
  // query omits `content`, so fetch the full project first; forkProject inserts a
  // brand-new row owned by me and never writes to the original.
  const reuseMut = useMutation({
    mutationFn: async (p: Project) => {
      const full = await getProject(p.id);
      if (!full) throw new Error("not found");
      return forkProject(full);
    },
    onMutate: (p) => setBusyId(p.id),
    onSuccess: (copy) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      setMode("mine");
      setFilter("draft");
      setSearch("");
      toast.success(`“${copy.title}” is now in My Robots → Drafts. Edit it freely — the original stays as it is.`);
    },
    onError: () => toast.error("Couldn't copy that robot. Please try again."),
    onSettled: () => setBusyId(null),
  });

  const likeMut = useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) =>
      liked ? unlikeProject(id) : likeProject(id),
    // Optimistic: flip the heart + tally instantly, roll back on error.
    onMutate: async ({ id, liked }) => {
      await qc.cancelQueries({ queryKey: ["myLikes"] });
      await qc.cancelQueries({ queryKey: ["community"] });
      const prevLikes = qc.getQueryData<Set<string>>(["myLikes"]);
      const prevComm = qc.getQueryData<Project[]>(["community"]);
      const nextLikes = new Set(prevLikes ?? []);
      if (liked) nextLikes.delete(id);
      else nextLikes.add(id);
      qc.setQueryData(["myLikes"], nextLikes);
      qc.setQueryData<Project[]>(["community"], (old) =>
        (old ?? []).map((p) =>
          p.id === id
            ? { ...p, likes_count: Math.max(0, (p.likes_count || 0) + (liked ? -1 : 1)) }
            : p,
        ),
      );
      return { prevLikes, prevComm };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prevLikes !== undefined) qc.setQueryData(["myLikes"], ctx.prevLikes);
      if (ctx?.prevComm !== undefined) qc.setQueryData(["community"], ctx.prevComm);
      toast.error("Couldn't update your like.");
    },
    // No refetch on success — the optimistic update already reflects it. Avoids a
    // full community re-query on every single like (which pounded the DB).
  });

  // Scroll to + flash the shared build once the community list has loaded.
  useEffect(() => {
    if (!highlightId || mode !== "community" || !community?.length) return;
    const el = document.getElementById(`community-card-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = setTimeout(() => setHighlightId(null), 4000); // fade the flash after 4s
    return () => clearTimeout(t);
  }, [highlightId, community, mode]);

  const copyCommunityLink = (p: Project) => {
    // Link into the Community tab with this build highlighted (so voters land on
    // the right one). Goes to the dashboard, which requires login.
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/dashboard?highlight=${p.id}`;
    navigator.clipboard.writeText(url).then(
      () => toast.success("Link copied ✓ — share it with anyone"),
      () => toast.error("Couldn't copy the link."),
    );
  };

  // Personal dashboard = only your PRIVATE projects. Once published, a project
  // lives in the Community tab (not here) until it's unpublished.
  const mine = useMemo(() => (projects ?? []).filter((p) => !p.is_public), [projects]);

  const counts = useMemo(
    () => ({
      all: mine.length,
      draft: mine.filter((p) => p.status === "draft").length,
      completed: mine.filter((p) => p.status === "completed").length,
    }),
    [mine],
  );

  const visible = useMemo(() => {
    let list = mine;
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((p) => (p.title || "").toLowerCase().includes(q));
    return list;
  }, [mine, filter, search]);

  const communityVisible = useMemo(() => {
    let list = community ?? [];
    const q = search.trim().toLowerCase();
    if (q)
      list = list.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.author_name || "").toLowerCase().includes(q),
      );
    return list;
  }, [community, search]);

  const hasAny = mine.length > 0;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader onNewProject={() => createMut.mutate()} creating={createMut.isPending} />

      <main className="mx-auto grid max-w-[1280px] grid-cols-1 gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)]">
        <DashboardSidebar
          mode={mode}
          filter={filter}
          counts={counts}
          onSelectMine={(f) => {
            if (mode !== "mine") setSearch("");
            setMode("mine");
            setFilter(f);
          }}
          onSelectCommunity={() => { setMode("community"); setSearch(""); }}
        />

        <section className="min-w-0">
        {mode === "home" ? (
          <DashboardHome
            name={displayName(user).split(" ")[0]}
            counts={counts}
            latest={mine[0] ?? null}
            creating={createMut.isPending}
            onNewProject={() => createMut.mutate()}
            onOpenLatest={() => mine[0] && navigate({ to: "/project/$id", params: { id: mine[0].id } })}
            onCommunity={() => { setMode("community"); setSearch(""); }}
          />
        ) : mode === "mine" ? (
          <>
            {/* Controls */}
            {hasAny && (
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-display text-2xl font-extrabold text-foreground">
                  {filter === "all" ? "My Robots" : filter === "draft" ? "Drafts" : "Completed"}
                </h2>
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
                    onDownload={async () => {
                      try {
                        const full = await getProject(p.id); // fetch content on demand
                        if (full) {
                          downloadProjectJSON(full);
                          toast.success("Download started.");
                        }
                      } catch {
                        toast.error("Couldn't prepare the download.");
                      }
                    }}
                    onDelete={() => setDeleteTarget(p)}
                    onToggleComplete={() => completeMut.mutate(p)}
                    onTogglePublish={() => publishMut.mutate(p)}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-extrabold text-foreground">
                  Community builds 🌍
                </h2>
                <p className="text-sm text-text-secondary">
                  View anyone's robot, or <span className="font-bold">Reuse</span> it to get your own editable copy in My Robots — the original post never changes.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search builds or makers…"
                  className="pl-9"
                />
              </div>
            </div>

            {commLoading ? (
              <SkeletonGrid />
            ) : commError ? (
              <ErrorState onRetry={() => commRefetch()} />
            ) : (community?.length ?? 0) === 0 ? (
              <CommunityEmpty />
            ) : communityVisible.length === 0 ? (
              <NoMatches onClear={() => setSearch("")} />
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {communityVisible.map((p) => (
                  <CommunityCard
                    key={p.id}
                    project={p}
                    isOwn={p.user_id === user?.id}
                    highlighted={p.id === highlightId}
                    busy={busyId === p.id}
                    onView={() => openWorkspace(p.id, { readOnly: true })}
                    onShare={() => copyCommunityLink(p)}
                    onEdit={() => navigate({ to: "/project/$id", params: { id: p.id } })}
                    onUnpublish={() => publishMut.mutate(p)}
                    onReuse={() => reuseMut.mutate(p)}
                    reusing={reuseMut.isPending && busyId === p.id}
                    liked={myLikes?.has(p.id) ?? false}
                    onToggleLike={() => likeMut.mutate({ id: p.id, liked: myLikes?.has(p.id) ?? false })}
                  />
                ))}
              </div>
            )}
          </>
        )}
        </section>
      </main>

      <BoltGuide context={mode} />

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

function CommunityEmpty() {
  return (
    <div className="comic-outline mx-auto mt-6 flex max-w-xl flex-col items-center bg-background halftone px-8 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-ink bg-sky text-white text-3xl">
        🌍
      </div>
      <h2 className="font-display text-2xl font-extrabold text-foreground">No community builds yet</h2>
      <p className="mt-2 max-w-sm text-text-secondary">
        Be the first! Open one of your robots and hit the 🌐 <span className="font-bold">Publish to Community</span> button to share it with everyone.
      </p>
    </div>
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
