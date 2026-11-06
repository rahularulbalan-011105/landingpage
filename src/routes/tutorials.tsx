import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LogOut, Play, Youtube } from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { useAuth, displayName } from "@/lib/auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import tutorials from "@/data/tutorials.json";

type Tutorial = { id: string; title: string; level?: string };

/**
 * Video tutorials — public, like the community page. The list is hardcoded in
 * src/data/tutorials.json; to add a video, append its YouTube id and title there.
 * Thumbnails come straight from YouTube's image CDN and videos play in a modal
 * through the privacy-enhanced embed, so everything stays client-side.
 */
export const Route = createFileRoute("/tutorials")({
  head: () => ({
    meta: [
      { title: "Tutorials | Constructa" },
      { name: "description", content: "Video tutorials for building robots with Constructa." },
    ],
  }),
  component: TutorialsPage,
});

function TutorialsPage() {
  const { user, signOut } = useAuth();
  const [playing, setPlaying] = useState<Tutorial | null>(null);
  const videos: Tutorial[] = tutorials.videos;

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-white font-ui text-wb-ink">
      <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 h-[60vh] opacity-60">
        <div className="wb-floor" />
      </div>

      <TutorialsBar name={user ? displayName(user) : null} onSignOut={() => void signOut()} />

      <main className="relative mx-auto max-w-[920px] px-4 pb-24 pt-28 sm:px-8 sm:pt-32">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-brand text-[26px] font-bold sm:text-[32px]" style={{ letterSpacing: "-0.045em" }}>
            Tutorials
          </h1>
          <a
            href={tutorials.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-wb-ink-2 hover:text-wb-ink"
          >
            <Youtube className="h-4 w-4 text-[#FF0000]" /> YouTube channel
          </a>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {videos.map((v) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setPlaying(v)}
              className="group overflow-hidden rounded-[14px] border border-wb-line bg-white text-left transition-shadow hover:shadow-[0_18px_40px_-22px_rgba(28,36,33,0.45)]"
            >
              <span className="relative block aspect-video bg-wb-bench">
                <img
                  src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-wb-orange text-white shadow-lg transition-transform group-hover:scale-110">
                    <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                  </span>
                </span>
              </span>
              <span className="block p-4">
                {v.level && (
                  <span className="mb-1.5 inline-block rounded-full bg-wb-bench px-2 py-0.5 text-[11.5px] font-semibold text-wb-ink-2">
                    {v.level}
                  </span>
                )}
                <span className="block text-[15px] font-semibold leading-snug text-wb-ink">{v.title}</span>
              </span>
            </button>
          ))}
        </div>
      </main>

      <Dialog open={!!playing} onOpenChange={(o) => !o && setPlaying(null)}>
        <DialogContent className="max-w-[min(960px,calc(100vw-2rem))] gap-3 p-3 sm:p-4">
          <DialogTitle className="pr-8 text-[15px] font-semibold leading-snug">{playing?.title}</DialogTitle>
          {playing && (
            <div className="aspect-video w-full overflow-hidden rounded-[10px] bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${playing.id}?autoplay=1&rel=0`}
                title={playing.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** The same floating pill as the dashboard and community pages, with Tutorials active. */
function TutorialsBar({ name, onSignOut }: { name: string | null; onSignOut: () => void }) {
  const tab = "whitespace-nowrap rounded-full px-3 py-1.5 text-[13.5px] font-semibold text-wb-ink-2 transition-colors hover:text-wb-ink";
  return (
    <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-3">
      <div className="flex items-center gap-1 rounded-full border border-wb-line bg-white/95 p-1.5 shadow-[0_12px_30px_-16px_rgba(28,36,33,0.4)] backdrop-blur">
        <Link to="/" aria-label="Constructa home" className="px-2">
          <img src={logo} alt="" className="h-7 w-auto" />
        </Link>
        <span className="mx-1 h-5 w-px bg-wb-line" />
        {name && (
          <Link to="/dashboard" className={tab}>
            My robots
          </Link>
        )}
        <Link to="/community" className={tab}>
          Community
        </Link>
        <span aria-current="page" className="whitespace-nowrap rounded-full bg-wb-ink px-3 py-1.5 text-[13.5px] font-semibold text-white">
          Tutorials
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
            <Link to="/login" className={tab}>
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
