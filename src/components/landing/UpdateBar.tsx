import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { LATEST } from "@/data/updates";
import { ctrack } from "@/lib/landing-tracker";
import { useT } from "@/i18n";

const DISMISS_KEY = "constructa-update-dismissed";

/**
 * Slim announcement strip above the nav for the newest update (src/data/updates.ts), linking to /updates.
 * Client-only: whether it shows depends on the visitor's dismissal and clock, so it mounts closed and
 * slides open, which keeps server and client markup identical. Dismissal is per update id, so the next
 * release brings it back. `collapsed` folds it away once the page scrolls.
 */
export function UpdateBar({ collapsed }: { collapsed: boolean }) {
  const t = useT();
  const u = t.updates;
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let dismissed: string | null = null;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY);
    } catch {
      /* storage blocked: just show it */
    }
    if (dismissed === LATEST.id) return;
    setOpen(true);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(DISMISS_KEY, LATEST.id);
    } catch {
      /* private mode: it'll be back next visit */
    }
  };

  const upcoming = !!LATEST.upcoming;

  return (
    <div
      className={[
        "grid transition-[grid-template-rows] duration-500 ease-out-soft",
        open && !collapsed ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
      ].join(" ")}
      aria-hidden={!open || collapsed}
      inert={!open || collapsed}
    >
      <div className="overflow-hidden">
        <div className="relative border-b border-wb-line bg-wb-bench">
          <Link
            to="/updates"
            onClick={() =>
              ctrack("cta_click", undefined, { where: "update_bar", update: LATEST.id })
            }
            className="group mx-auto flex h-9 max-w-[1320px] items-center justify-center gap-2.5 ps-5 pe-12 text-[13px] text-wb-ink-2 sm:px-12"
          >
            <span className={open ? "upd-gear-roll inline-flex" : "inline-flex opacity-0"}>
              <Gear className="h-4 w-4 shrink-0 transition-transform duration-700 ease-out-soft group-hover:rotate-[180deg]" />
            </span>
            {/* version + status read as one quiet mono label: "v2.0 | COMING SOON" */}
            <span className="inline-flex shrink-0 items-center gap-2 font-key text-[11px]">
              {/* UI font, not mono: JetBrains Mono's dotted zero reads as "v2.ø" at this size */}
              {LATEST.version && (
                <span className="font-ui text-[13px] font-semibold text-wb-ink">
                  {LATEST.version}
                </span>
              )}
              {LATEST.version && (
                <span aria-hidden className="hidden h-3 w-px bg-wb-ink-3/40 sm:block" />
              )}
              <span className="hidden uppercase tracking-[0.12em] text-wb-ink-3 sm:inline">
                {upcoming ? t.whatsNew.comingSoon : u.new}
              </span>
            </span>
            <span className="truncate font-semibold text-wb-ink">{LATEST.title}</span>
            <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-wb-orange">
              <span className="hidden sm:inline">{u.seeWhatsNew}</span>
              <ArrowRight
                aria-hidden
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100"
              />
            </span>
          </Link>
          <button
            type="button"
            onClick={dismiss}
            aria-label={u.dismiss}
            className="absolute end-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-wb-ink-3 transition-colors hover:bg-white hover:text-wb-ink sm:end-4"
          >
            <X aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/** Spur gear from the parts box: motor yellow with an ink outline, so it reads as a physics part. */
function Gear({ className }: { className?: string }) {
  const teeth = 8;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    for (const [da, r] of [
      [-0.3, 6.2],
      [-0.17, 8],
      [0.17, 8],
      [0.3, 6.2],
    ] as const) {
      const ang = a + da * step * 1.6;
      pts.push(`${(10 + Math.cos(ang) * r).toFixed(2)},${(10 + Math.sin(ang) * r).toFixed(2)}`);
    }
  }
  return (
    <svg viewBox="0 0 20 20" aria-hidden className={className}>
      <polygon
        points={pts.join(" ")}
        fill="var(--part-yellow)"
        stroke="var(--wb-ink)"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
      <circle
        cx="10"
        cy="10"
        r="2.2"
        fill="var(--wb-bench)"
        stroke="var(--wb-ink)"
        strokeWidth="1.1"
      />
    </svg>
  );
}
