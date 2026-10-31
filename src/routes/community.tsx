import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { useAuth, displayName } from "@/lib/auth";
import {
  CommunityList,
  type CommunityAction,
  type CommunityRobot,
} from "@/components/dashboard2/community-ui";
import {
  listCommunity,
  listMyLikes,
  getProject,
  likeProject,
  unlikeProject,
  forkProject,
} from "@/lib/projects";
import { openWorkspace } from "@/lib/workspace";

/**
 * The community gallery — PUBLIC on purpose.
 *
 * Browsing and opening a build read-only needs no account: the `projects` RLS
 * policy "Anyone reads public projects" already grants anon SELECT on published
 * rows, so the list and the read-only editor both work signed out.
 *
 * Signing up is asked for only where it is genuinely needed — the two actions
 * that write something owned by you: Reuse (copies the build into YOUR robots)
 * and Like. Both bounce to /signup carrying a redirect back here, and Reuse
 * carries the project id so the copy finishes by itself once the account exists.
 */
export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community builds | Constructa" },
      {
        name: "description",
        content:
          "Robots built and shared by the Constructa community. Open any build in your browser — no account needed.",
      },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { highlight?: string; reuse?: string } => ({
    highlight: typeof search.highlight === "string" ? search.highlight : undefined,
    reuse: typeof search.reuse === "string" ? search.reuse : undefined,
  }),
  component: Community,
});

const MINUTE = 60_000;

function minutesSince(iso: string | null): number {
  if (!iso) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / MINUTE));
}

/** "just now" - "22 hours ago" - "4 days ago" - "1 month ago" */
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

async function copyLink(url: string, ok: string) {
  try {
    await navigator.clipboard.writeText(url);
    toast.success(ok);
  } catch {
    toast.message("Copy this link", { description: url, duration: 12_000 });
  }
}

function Community() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading, signOut } = useAuth();
  const { reuse } = Route.useSearch();

  const { data: community, isError } = useQuery({ queryKey: ["community"], queryFn: listCommunity });

  // Likes are per-account, so only ask for them when there is an account. An
  // anon read of project_likes comes back empty, which renders every heart
  // hollow — not wrong, but there is no reason to spend the request.
  const { data: likes } = useQuery({
    queryKey: ["likes"],
    queryFn: listMyLikes,
    enabled: !!user,
  });

  useEffect(() => {
    if (isError) toast.error("Couldn't load the community. Check your connection and refresh.");
  }, [isError]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["community"] });
    qc.invalidateQueries({ queryKey: ["likes"] });
  };

  const robots: CommunityRobot[] = useMemo(
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
    onSuccess: refresh,
    onError: () => toast.error("Couldn't update your like."),
  });

  // The list omits `content`, so load the full project before forking.
  const reuseMut = useMutation({
    mutationFn: async (id: string) => {
      const full = await getProject(id);
      if (!full) throw new Error("missing project");
      return forkProject(full);
    },
    onSuccess: (made) => {
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(`"${made.title}" is now in My robots. Edit it freely — the original stays as it is.`);
      navigate({ to: "/dashboard" });
    },
    onError: () => toast.error("Couldn't copy that robot. Please try again."),
  });

  /** Send a signed-out visitor to sign-up, remembering what they were trying to do. */
  const askToSignUp = (why: string, forReuse?: string) => {
    toast.message(why, { description: "It only takes a moment, and it is free." });
    navigate({
      to: "/signup",
      search: { redirect: "/community", ...(forReuse ? { reuse: forReuse } : {}) },
    });
  };

  // Back from sign-up with ?reuse=<id>: finish the copy they originally asked
  // for. The ref stops a re-render (or a refetch) forking twice, and the param
  // is dropped straight away so a page refresh cannot fork a third time.
  const resumed = useRef(false);
  useEffect(() => {
    if (loading || !user || !reuse || resumed.current) return;
    resumed.current = true;
    navigate({ to: "/community", replace: true });
    reuseMut.mutate(reuse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, reuse]);

  const onAction = (id: string, action: CommunityAction) => {
    switch (action) {
      case "view":
        // Read-only viewing is public — no account, no gate.
        return void openWorkspace(id, { readOnly: true });
      case "share": {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        return void copyLink(`${origin}/community?highlight=${id}`, "Link copied — share it with anyone");
      }
      case "like":
        if (!user) return askToSignUp("Create a free account to like builds.");
        return likeMut.mutate(id);
      case "reuse":
        if (!user) return askToSignUp("Create a free account to copy this robot into My robots.", id);
        return reuseMut.mutate(id);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white font-ui text-wb-ink">
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 h-[60vh] opacity-60">
        <div className="wb-floor" />
      </div>

      <CommunityBar name={user ? displayName(user) : null} onSignOut={() => void signOut()} />

      <main className="relative mx-auto max-w-[920px] px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
        <CommunityList robots={robots} onAction={onAction} />
      </main>
    </div>
  );
}

/**
 * The same floating pill as the dashboard, but it has to work with no account:
 * signed out it offers Log in / Sign up in place of the workshop controls.
 */
function CommunityBar({ name, onSignOut }: { name: string | null; onSignOut: () => void }) {
  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-3">
      <div className="flex items-center gap-1 rounded-full border border-wb-line bg-white/95 p-1.5 shadow-[0_12px_30px_-16px_rgba(28,36,33,0.4)] backdrop-blur">
        <Link to="/" aria-label="Constructa home" className="px-2">
          <img src={logo} alt="" className="h-7 w-auto" />
        </Link>
        <span className="mx-1 h-5 w-px bg-wb-line" />
        {name && (
          <Link
            to="/dashboard"
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13.5px] font-semibold text-wb-ink-2 transition-colors hover:text-wb-ink"
          >
            My robots
          </Link>
        )}
        <span
          aria-current="page"
          className="whitespace-nowrap rounded-full bg-wb-ink px-3 py-1.5 text-[13.5px] font-semibold text-white"
        >
          Community
        </span>
        <span className="mx-1 h-5 w-px bg-wb-line" />
        {name ? (
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[13px] font-semibold text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        ) : (
          <>
            <Link
              to="/login"
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13.5px] font-semibold text-wb-ink-2 transition-colors hover:text-wb-ink"
            >
              Log in
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-8 items-center rounded-full bg-wb-orange px-3 text-[13px] font-semibold text-white hover:brightness-105"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
