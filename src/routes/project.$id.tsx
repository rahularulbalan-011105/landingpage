import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { Spinner } from "@/components/ui/loaders";
import { getProject } from "@/lib/projects";
import { buildWorkspaceUrl } from "@/lib/workspace";

export const Route = createFileRoute("/project/$id")({
  head: () => ({ meta: [{ title: "Opening workshop… | Constructa" }] }),
  component: () => (
    <RequireAuth>
      <ProjectLauncher />
    </RequireAuth>
  ),
});

/**
 * Thin launcher: confirms the project exists (and is the user's, via RLS), then
 * hands the session to the editor and redirects the tab into the 3D workshop.
 */
function ProjectLauncher() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const launched = useRef(false);

  useEffect(() => {
    // Guard against the double-invoke (React StrictMode / re-render): the launcher
    // must run exactly once and ALWAYS reach the redirect — no "active" flag,
    // because a redirect navigates the tab away regardless of mount state.
    if (launched.current) return;
    launched.current = true;

    (async () => {
      try {
        const project = await getProject(id);
        if (!project) {
          setError("That project doesn't exist or you don't have access to it.");
          return;
        }
        const url = await buildWorkspaceUrl(id);
        window.location.href = url;
      } catch {
        setError("Couldn't open the workshop. Please try again.");
      }
    })();
  }, [id]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background halftone px-4 text-center">
        <h1 className="font-display text-2xl font-extrabold text-foreground">Can't open this project</h1>
        <p className="max-w-sm text-text-secondary">{error}</p>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="comic-btn inline-flex items-center justify-center bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Back to dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background halftone">
      <Spinner className="h-8 w-8" />
      <p className="font-display text-sm font-bold text-text-secondary">Opening your workshop…</p>
    </div>
  );
}
