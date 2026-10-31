import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { useAuth, displayName } from "@/lib/auth";
import {
  WorkshopDashboard,
  type FloorRobot,
  type RobotAction,
} from "@/components/dashboard2/WorkshopDashboard";
import {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  markComplete,
  reopenDraft,
  publishToCommunity,
  unpublishFromCommunity,
  getOrCreateShareToken,
} from "@/lib/projects";
import { downloadProjectJSON } from "@/lib/download";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard | Constructa" }] }),
  validateSearch: (search: Record<string, unknown>): { highlight?: string } => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
  }),
  // Links shared before the community became public still point at
  // /dashboard?highlight=… — send them to the public page, which anyone can
  // open, instead of bouncing the recipient to a login screen.
  beforeLoad: ({ search }) => {
    if (search.highlight) {
      throw redirect({ to: "/community", search: { highlight: search.highlight } });
    }
  },
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
  const { data: projects, isError: projectsFailed } = useQuery({ queryKey: ["projects"], queryFn: listProjects });

  // Without this a failed load renders the "Your workshop is empty" screen, which
  // reads as "my robots are gone" rather than "the list did not load".
  useEffect(() => {
    if (projectsFailed) toast.error("Couldn't load your robots. Check your connection and refresh.");
  }, [projectsFailed]);
  const refreshMine = () => qc.invalidateQueries({ queryKey: ["projects"] });

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
      // Publishing changes what /community shows, so drop its cached list.
      if (action === "publish") qc.invalidateQueries({ queryKey: ["community"] });
      if (message) toast.success(message);
    },
    onError: () => toast.error("That didn't work. Please try again."),
  });

  const renameMut = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => updateProject(id, { title }),
    onSuccess: () => {
      refreshMine();
      qc.invalidateQueries({ queryKey: ["community"] });
    },
    onError: () => toast.error("Couldn't rename that robot."),
  });

  return (
    <WorkshopDashboard
      name={displayName(user)}
      robots={robots}
      onNew={() => createMut.mutate()}
      onOpen={(id) => navigate({ to: "/project/$id", params: { id } })}
      onAction={(id, action) => actionMut.mutate({ id, action })}
      onRename={(id, title) => renameMut.mutate({ id, title })}
      onSignOut={() => {
        void signOut().then(() => navigate({ to: "/" }));
      }}
    />
  );
}
