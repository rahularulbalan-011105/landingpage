import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Download, ExternalLink, Eye, Bot } from "lucide-react";
import logo from "@/assets/constructa-logo.jpeg";
import { Badge } from "@/components/ui/badge";
import { FullPageLoader } from "@/components/ui/loaders";
import { getSharedProject } from "@/lib/projects";
import { downloadProjectJSON } from "@/lib/download";
import { EDITOR_ORIGIN } from "@/lib/workspace";

export const Route = createFileRoute("/share/$token")({
  head: () => ({ meta: [{ title: "Shared robot | Constructa" }] }),
  component: SharePage,
});

function SharePage() {
  const { token } = Route.useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["share", token],
    queryFn: () => getSharedProject(token),
    retry: false,
  });

  if (isLoading) return <FullPageLoader label="Loading shared robot…" />;

  if (isError || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background halftone px-4 text-center">
        <Bot className="h-14 w-14 text-text-tertiary" />
        <h1 className="font-display text-2xl font-extrabold text-foreground">Link expired or invalid</h1>
        <p className="max-w-sm text-text-secondary">
          This share link no longer works. Ask the owner for a fresh one.
        </p>
        <Link
          to="/"
          className="comic-btn inline-flex items-center justify-center bg-primary px-5 py-2.5 text-sm font-bold text-white"
        >
          Go to Constructa
        </Link>
      </div>
    );
  }

  const completed = data.status === "completed";
  const editorUrl = `${EDITOR_ORIGIN}/?app=1&share=${encodeURIComponent(token)}&ro=1`;

  return (
    <div className="min-h-screen bg-background halftone">
      <header className="border-b-[3px] border-ink bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[900px] items-center justify-between px-4 sm:px-8">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Constructa" className="h-[48px] w-auto -rotate-3 object-contain" />
          </Link>
          <Link
            to="/signup"
            className="comic-btn inline-flex items-center justify-center bg-primary px-4 py-2 text-sm font-bold text-white"
          >
            Build your own
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[900px] px-4 py-10 sm:px-8">
        <span className="comic-tag mb-4">
          <Eye className="h-3.5 w-3.5" /> Read-only
        </span>

        <div className="comic-outline bg-background p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
              {data.title || "Untitled robot"}
            </h1>
            <Badge
              className={
                completed
                  ? "border-2 border-ink bg-primary text-white"
                  : "border-2 border-ink bg-surface-2 text-foreground"
              }
            >
              {completed ? "Completed" : "Draft"}
            </Badge>
          </div>

          {data.description && (
            <p className="mt-3 text-text-secondary">{data.description}</p>
          )}

          <p className="mt-4 text-xs text-text-tertiary">
            Shared from Constructa · last updated {safeDate(data.updated_at)}
          </p>

          <div className="mt-6 flex flex-wrap gap-3 border-t-2 border-dashed border-ink/15 pt-6">
            <a
              href={editorUrl}
              className="comic-btn inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-white"
            >
              <ExternalLink className="h-4 w-4" /> Open in 3D workshop
            </a>
            <button
              onClick={() =>
                downloadProjectJSON({
                  title: data.title,
                  description: data.description,
                  content: data.content,
                  status: data.status,
                })
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border-[2.5px] border-ink bg-background px-5 py-3 text-sm font-bold text-foreground transition-colors hover:bg-surface-2"
            >
              <Download className="h-4 w-4" /> Download JSON
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-text-secondary">
          Want to build robots like this?{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Start free
          </Link>
        </p>
      </main>
    </div>
  );
}

function safeDate(iso: string): string {
  try {
    return format(new Date(iso), "MMM d, yyyy");
  } catch {
    return "recently";
  }
}
