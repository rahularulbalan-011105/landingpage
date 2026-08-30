import { useEffect, useState } from "react";
import { Check, Copy, Link2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Project } from "@/lib/projects";
import { getOrCreateShareToken } from "@/lib/projects";

export function ShareDialog({
  project,
  open,
  onOpenChange,
}: {
  project: Project | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !project) return;
    let active = true;
    setLoading(true);
    setError(null);
    setUrl(null);
    setCopied(false);

    getOrCreateShareToken(project.id)
      .then((token) => {
        if (!active) return;
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setUrl(`${origin}/share/${token}`);
      })
      .catch(() => active && setError("Couldn't create a share link. Please try again."))
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [open, project]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy automatically — select the link and copy it.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="comic-outline border-ink bg-background sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="font-display text-xl font-extrabold text-foreground">
            Share “{project?.title || "robot"}”
          </DialogTitle>
          <DialogDescription className="text-text-secondary">
            Anyone with this link can view a read-only copy of this robot. They can't edit it.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Creating your link…
            </div>
          ) : error ? (
            <p className="rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {error}
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Link2 className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <Input readOnly value={url ?? ""} className="pl-9 font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
              </div>
              <button
                onClick={copy}
                className="comic-btn inline-flex items-center justify-center gap-1.5 bg-primary px-3.5 py-2 text-sm font-bold text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" /> Copy
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
