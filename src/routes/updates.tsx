import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowLeft } from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { Footer } from "@/components/landing/Footer";
import { TAG_LABELS, UPDATES, formatUpdateDate, type Update } from "@/data/updates";
import { useReveal } from "@/hooks/use-reveal";
import { useAuth } from "@/lib/auth";
import { ctrack } from "@/lib/landing-tracker";
import { en } from "@/i18n/en";

/**
 * /updates: the Constructa build log. Every entry in src/data/updates.ts, newest first, on a timeline
 * drawn like the editor's axis line. The announcement bar above the homepage nav links here.
 *
 * English only, whatever language the visitor picked: updates ship often, and translating each one
 * into every language would slow that down. The shared footer still follows the site language.
 */
export const Route = createFileRoute("/updates")({
  head: () => ({
    meta: [
      { title: "What's new | Constructa" },
      {
        name: "description",
        content:
          "The Constructa build log: every new feature and improvement, newest first. Every update ships free, straight to your browser.",
      },
      { property: "og:title", content: "What's new in Constructa" },
      {
        property: "og:description",
        content: "Every new feature and improvement in Constructa, newest first.",
      },
      { property: "og:url", content: "/updates" },
    ],
    links: [{ rel: "canonical", href: "/updates" }],
  }),
  component: UpdatesPage,
});

function UpdatesPage() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-[100dvh] bg-wb-canvas font-ui text-wb-ink">
      {/* lang="en": the page's own text is English even when <html lang> is another language */}
      <div lang="en">
        <header className="sticky top-0 z-40 border-b border-wb-line bg-white/85 backdrop-blur-md">
          <div className="mx-auto flex h-[68px] max-w-[1080px] items-center justify-between gap-3 px-5 sm:px-8">
            <div className="flex items-center gap-4">
              <Link to="/" aria-label={en.nav.home}>
                <img src={logo} alt="" className="h-[42px] w-auto object-contain" />
              </Link>
              <Link
                to="/"
                className="hidden items-center gap-1.5 text-[13.5px] font-semibold text-wb-ink-3 transition-colors hover:text-wb-ink sm:inline-flex"
              >
                <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
                Back to Constructa
              </Link>
            </div>
            {loading ? null : user ? (
              <Link
                to="/dashboard"
                className="wb-btn wb-btn-primary h-10 whitespace-nowrap px-4 text-[14px]"
              >
                {en.nav.myRobots}
              </Link>
            ) : (
              <Link
                to="/signup"
                onClick={() => ctrack("cta_click", undefined, { where: "updates_header" })}
                className="wb-btn wb-btn-primary h-10 whitespace-nowrap px-4 text-[14px]"
              >
                {en.nav.start}
              </Link>
            )}
          </div>
        </header>

        <main className="mx-auto max-w-[1080px] px-5 pb-28 pt-16 sm:px-8 sm:pt-24">
          <p className="font-key text-[12px] uppercase tracking-[0.14em] text-wb-ink-3">
            Build log
          </p>
          <h1
            className="mt-4 max-w-[14em] font-brand font-bold text-wb-ink"
            style={{
              fontSize: "clamp(34px, 4.6vw, 60px)",
              lineHeight: 1.05,
              letterSpacing: "-0.045em",
              textWrap: "balance",
            }}
          >
            What's new in Constructa.
          </h1>
          <p className="mt-5 max-w-[34em] text-[16.5px] leading-[1.6] text-wb-ink-2">
            Every update ships free, straight to your browser. Newest first.
          </p>

          <ol aria-label="Constructa updates, newest first" className="relative mt-16 sm:mt-20">
            {/* the axis: same green as the editor's axis lines, fading out at the oldest entry */}
            <span
              aria-hidden
              className="absolute bottom-0 start-[5px] top-2 w-px md:start-[180px]"
              style={{
                background:
                  "linear-gradient(to bottom, var(--wb-axis), var(--wb-grid) 70%, transparent)",
              }}
            />
            {UPDATES.map((entry, i) => (
              <Entry key={entry.id} entry={entry} featured={i === 0} />
            ))}
          </ol>
        </main>
      </div>

      <Footer />
    </div>
  );
}

function Entry({ entry, featured }: { entry: Update; featured: boolean }) {
  const ref = useReveal<HTMLLIElement>(0.1);
  const upcoming = !!entry.upcoming;

  return (
    <li
      ref={ref}
      className="reveal relative ps-9 pb-14 last:pb-0 md:grid md:grid-cols-[180px_minmax(0,1fr)] md:ps-0"
    >
      {/* node on the axis: hollow while it's still coming, solid once shipped */}
      <span
        aria-hidden
        className={[
          "absolute start-[5px] top-[7px] h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-white md:start-[180px]",
          upcoming ? "border-2 border-wb-ink bg-white" : "bg-wb-axis",
        ].join(" ")}
      >
        {upcoming && (
          <span className="absolute inset-[-5px] animate-ping rounded-full border border-wb-axis/60" />
        )}
      </span>

      {/* date column */}
      <div className="mb-3 flex items-center gap-2 md:mb-0 md:flex-col md:items-start md:gap-1.5 md:pe-8 md:pt-0.5">
        {/* no exact day for an unreleased update: just the rough timing, as on the homepage teaser */}
        {upcoming ? (
          entry.month && <span className="font-key text-[12.5px] text-wb-ink-3">{entry.month}</span>
        ) : (
          <time dateTime={entry.date} className="font-key text-[12.5px] text-wb-ink-3">
            {formatUpdateDate(entry.date)}
          </time>
        )}
        {entry.version && (
          <span className="rounded-[6px] bg-wb-ink px-1.5 py-px font-key text-[11px] font-medium text-white">
            {entry.version}
          </span>
        )}
      </div>

      <div className="md:ps-10">
        {upcoming ? (
          <UpcomingCard entry={entry} />
        ) : (
          <article>
            <Tags entry={entry} />
            <h2
              className="mt-3 font-brand font-bold text-wb-ink"
              style={{
                fontSize: featured ? "clamp(28px, 3vw, 40px)" : "clamp(21px, 2vw, 26px)",
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
              }}
            >
              {entry.title}
            </h2>
            <p
              className={`mt-3 max-w-[36em] leading-[1.65] text-wb-ink-2 ${featured ? "text-[16.5px]" : "text-[15.5px]"}`}
            >
              {entry.summary}
            </p>
            <EntryLink entry={entry} className="mt-4 text-wb-orange" />
          </article>
        )}
      </div>
    </li>
  );
}

/** The next release: the same dark arena card as the homepage teaser, smaller. */
function UpcomingCard({ entry }: { entry: Update }) {
  return (
    <article className="relative overflow-hidden rounded-[22px] bg-[#0C100E] p-6 text-white ring-1 ring-white/10 sm:p-8">
      {/* floor grid fading up from the bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
      <div className="relative min-w-0">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-0.5 text-[11.5px] font-semibold text-white/85">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />
          {en.whatsNew.comingSoon}
        </span>
        <h2
          className="mt-4 font-brand font-bold"
          style={{
            fontSize: "clamp(30px, 3.4vw, 46px)",
            lineHeight: 1.04,
            letterSpacing: "-0.045em",
          }}
        >
          {entry.title}
        </h2>
        <p className="mt-3 max-w-[32em] text-[15.5px] leading-[1.6] text-white/70">
          {entry.summary}
        </p>
      </div>
      <div className="relative mt-7 border-t border-white/10 pt-6">
        <Link
          to={entry.cta.to}
          hash={entry.cta.hash}
          onClick={() =>
            ctrack("cta_click", undefined, { where: "updates_page", update: entry.id })
          }
          className="inline-flex h-11 items-center gap-2 rounded-[12px] bg-wb-orange px-5 text-[15px] font-semibold text-white transition-[filter] hover:brightness-110"
        >
          {entry.cta.label}
        </Link>
      </div>
    </article>
  );
}

function Tags({ entry }: { entry: Update }) {
  return (
    <ul className="flex flex-wrap gap-1.5">
      {entry.tags.map((tag) => (
        <li
          key={tag}
          className="rounded-full border border-wb-line bg-wb-bench px-2.5 py-0.5 text-[11.5px] font-semibold text-wb-ink-2"
        >
          {TAG_LABELS[tag]}
        </li>
      ))}
    </ul>
  );
}

function EntryLink({ entry, className = "" }: { entry: Update; className?: string }) {
  return (
    <Link
      to={entry.cta.to}
      hash={entry.cta.hash}
      onClick={() => ctrack("cta_click", undefined, { where: "updates_page", update: entry.id })}
      className={`group inline-flex items-center gap-1.5 text-[14.5px] font-semibold ${className}`}
    >
      {entry.cta.label}
      <ArrowRight
        aria-hidden
        className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
