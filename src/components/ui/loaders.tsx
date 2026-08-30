import { cn } from "@/lib/utils";

/** Comic-style spinner: a thick ring with an orange sweep. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-[3px] border-ink/20 border-t-primary",
        className,
      )}
    />
  );
}

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-background halftone">
      <Spinner className="h-8 w-8" />
      {label && <p className="font-display text-sm font-bold text-text-secondary">{label}</p>}
    </div>
  );
}
