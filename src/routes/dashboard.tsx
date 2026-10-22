import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth, displayName } from "@/lib/auth";
import {
  WorkshopDashboard,
  type CommunityAction,
  type CommunityRobot,
  type FloorRobot,
  type RobotAction,
} from "@/components/dashboard2/WorkshopDashboard";
import {
  listProjects,
  listCommunity,
  listMyLikes,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  markComplete,
  reopenDraft,
  publishToCommunity,
  unpublishFromCommunity,
  likeProject,
  unlikeProject,
  forkProject,
  getOrCreateShareToken,
} from "@/lib/projects";
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

// ── formatting ───────────────────────────────────────────────────────────────

const MINUTE = 60_000;

/** Whole minutes since `iso` — drives the Community "Newest" sort. */
function minutesSince(iso: string | null): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / MINUTE));
}

/** "just now" · "22 hours ago" · "4 days ago" · "1 month ago" */
function ago(iso: string | null): string {
  if (!iso) return "—";
  const mins = minutesSince(iso);
  if (mins < 1) return "just now";
  const steps: [number, string][] = [
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let value = mins;
  let unit = "minute";
  for (const [size, next] of steps) {
    if (value < size) break;
    value = Math.floor(value / size);
    unit = next;
  }
  return `${value} ${unit}${value === 1 ? "" : "s"} ago`;
}

/** "Oct 14, 2026" */
function onDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function copyLink(url: string, ok: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(ok);
  } catch {
    // The clipboard can be blocked (permission, or too long after the click) —
    // still hand the user the link rather than failing silently.
    toast.message("Copy this link", { description: url, duration: 12_000 });
  }
}

// ── page ─────────────────────────────────────────────────────────────────────

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, signOut } = useAuth();
  const { highlight } = Route.useSearch();

  // A shared community link (?highlight=<id>) opens straight on the Community tab.
  const [tab, setTab] = useState<"mine" | "community">(highlight ? "community" : "mine");

  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: listProjects });
  const { data: community } = useQuery({
    queryKey: ["community"],
    queryFn: listCommunity,
    enabled: tab === "community",
  });
  const { data: likes } = useQuery({
    queryKey: ["likes"],
    queryFn: listMyLikes,
    enabled: tab === "community",
  });

  const refreshMine = () => qc.invalidateQueries({ queryKey: ["projects"] });
  const refreshCommunity = () => {
    qc.invalidateQueries({ queryKey: ["community"] });
    qc.invalidateQueries({ queryKey: ["likes"] });
  };

  // ── my robots ──────────────────────────────────────────────────────────────

  const robots: FloorRobot[] = useMemo(
    () =>
      (projects ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status === "completed" ? "completed" : "draft",
        editedAgo: ago(p.updated_at),
        created: onDate(p.created_at),
        isPublic: !!p.is_public,
      })),
    [projects],
  );

  const createMut = useMutation({
    mutationFn: () => createProject(),
    onSuccess: (p) => {
      refreshMine();
      navigate({ to: "/project/$id", params: { id: p.id } });
    },
    onError: () => toast.error("Couldn't create the project. Please try again."),
  });

  const actionMut = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: RobotAction }) => {
      const p = (projects ?? []).find((x) => x.id === id);
      switch (action) {
        case "delete":
          await deleteProject(id);
          return "Project deleted.";
        case "toggle-complete": {
          const updated = p?.status === "completed" ? await reopenDraft(id) : await markComplete(id);
          return updated.status === "completed" ? "Marked as complete 🎉" : "Reopened as draft.";
        }
        case "publish": {
          const updated = p?.is_public ? await unpublishFromCommunity(id) : await publishToCommunity(id);
          return updated.is_public ? "Published to the community 🎉" : "Taken out of the community.";
        }
        case "share": {
          const token = await getOrCreateShareToken(id);
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          await copyLink(`${origin}/share/${token}`, "Link copied ✓ — anyone with it can view this robot");
          return null;
        }
        case "download": {
          // The list query omits `content`, so fetch the full row before exporting.
          const full = await getProject(id);
          if (!full) throw new Error("missing project");
          downloadProjectJSON(full);
          return "Download started.";
        }
      }
    },
    onSuccess: (message, { action }) => {
      if (action !== "share" && action !== "download") refreshMine();
      if (action === "publish") refreshCommunity();
      if (message) toast.success(message);
    },
    onError: () => toast.error("That didn't work. Please try again."),
  });

  const renameMut = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateProject(id, { title }),
    onSuccess: () => {
      refreshMine();
      refreshCommunity();
    },
    onError: () => toast.error("Couldn't rename that robot."),
  });

  // ── community ──────────────────────────────────────────────────────────────

  const communityRobots: CommunityRobot[] = useMemo(
    () =>
      (community ?? []).map((p) => ({
        id: p.id,
        title: p.title,
        author: p.author_name || "A builder",
        likes: p.likes_count ?? 0,
        liked: likes?.has(p.id) ?? false,
        publishedAgo: ago(p.published_at),
        age: minutesSince(p.published_at),
        own: p.user_id === user?.id,
      })),
    [community, likes, user?.id],
  );

  const likeMut = useMutation({
    mutationFn: async (id: string) => {
      const liked = likes?.has(id) ?? false;
      await (liked ? unlikeProject(id) : likeProject(id));
    },
    onSuccess: refreshCommunity,
    onError: () => toast.error("Couldn't update your like."),
  });

  // The community list omits `content`, so load the full project before forking.
  const reuseMut = useMutation({
    mutationFn: async (id: string) => {
      const full = await getProject(id);
      if (!full) throw new Error("missing project");
      return forkProject(full);
    },
    onSuccess: (made) => {
      refreshMine();
      setTab("mine");
      toast.success(`“${made.title}” is now in My robots. Edit it freely — the original stays as it is.`);
    },
    onError: () => toast.error("Couldn't copy that robot. Please try again."),
  });

  const onCommunity = (id: string, action: CommunityAction) => {
    switch (action) {
      case "like":
        return likeMut.mutate(id);
      case "view":
        return void openWorkspace(id, { readOnly: true });
      case "reuse":
        return reuseMut.mutate(id);
      case "share": {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        return void copyLink(`${origin}/dashboard?highlight=${id}`, "Link copied ✓ — share it with anyone");
      }
    }
  };

  // Landing on a ?highlight= link should show the Community tab.
  useEffect(() => {
    if (highlight) setTab("community");
  }, [highlight]);

  return (
    <WorkshopDashboard
      name={displayName(user)}
      robots={robots}
      tab={tab}
      onTab={setTab}
      onNew={() => createMut.mutate()}
      onOpen={(id) => navigate({ to: "/project/$id", params: { id } })}
      onAction={(id, action) => actionMut.mutate({ id, action })}
      onRename={(id, title) => renameMut.mutate({ id, title })}
      community={communityRobots}
      onCommunity={onCommunity}
      onSignOut={() => {
        void signOut().then(() => navigate({ to: "/" }));
      }}
    />
  );
}
