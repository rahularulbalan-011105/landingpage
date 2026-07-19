import { useRef, useState } from "react";
import { SignupForm } from "./SignupForm";
import { Mascot } from "./Mascot";

// Served as a static file from public/ (kept out of the bundler).
const heroVideo = "/hero-video.mp4";

export function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      // unmuting — make sure it's actually playing
      v.play().catch(() => {});
    }
    setMuted(next);
  }

  return (
    <section
      id="top"
      className="relative min-h-[100vh] min-h-[720px] flex items-center pt-[112px] overflow-hidden halftone"
    >
      <div className="mx-auto max-w-[1280px] w-full px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative">
        <div className="lg:col-span-6">
          <div className="flex items-center gap-3">
            <span className="comic-tag">🚀 Beta · now open</span>
            <Mascot size={40} mood="wink" className="animate-bob hidden sm:block" />
          </div>

          <h1
            className="mt-6 font-display text-foreground font-extrabold"
            style={{
              fontSize: "clamp(46px, 8vw, 92px)",
              lineHeight: 0.92,
              letterSpacing: "-0.02em",
              maxWidth: "900px",
            }}
          >
            <span className="block word-rise" style={{ animationDelay: "80ms" }}>
              Build any robot
            </span>
            <span className="block word-rise" style={{ animationDelay: "180ms" }}>
              you <span className="text-primary">imagine</span>.
            </span>
            <span className="block word-rise" style={{ animationDelay: "280ms" }}>
              Watch it <span className="text-sky">run</span>.
            </span>
          </h1>

          <p
            className="mt-6 text-text-secondary word-rise font-medium"
            style={{
              fontSize: "clamp(17px, 1.6vw, 20px)",
              lineHeight: 1.5,
              maxWidth: "560px",
              animationDelay: "420ms",
            }}
          >
            A free-form 3D robot workshop — right in your browser. Snap parts
            together, add real physics, and watch your creation come alive. No
            downloads, no limits.
          </p>

          <p
            className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-text-tertiary word-rise"
            style={{ animationDelay: "520ms" }}
          >
            <span>By the team behind SUBO</span>
            <span className="text-primary">·</span>
            <span>Used in 500+ schools</span>
            <span className="text-primary">·</span>
            <span>India · USA · UAE · Australia</span>
          </p>

          <div className="mt-10 word-rise" style={{ animationDelay: "620ms" }}>
            <SignupForm variant="hero" />
          </div>
        </div>

        {/* Hero video — comic panel frame */}
        <div className="lg:col-span-6 lg:-mr-8 xl:-mr-16">
          <div className="relative">
            {/* floating mascot peeking over the panel */}
            <Mascot
              size={72}
              mood="wow"
              className="absolute -top-9 -left-5 z-20 animate-bob drop-shadow-sm"
            />

            <div className="comic-outline relative w-full overflow-hidden bg-white" style={{ borderRadius: "22px" }}>
              {/* corner screws */}
              <span className="absolute top-2.5 left-2.5 h-2.5 w-2.5 rounded-full bg-ink z-10" />
              <span className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-ink z-10" />
              <span className="absolute bottom-2.5 left-2.5 h-2.5 w-2.5 rounded-full bg-ink z-10" />
              <span className="absolute bottom-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-ink z-10" />

              <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16 / 9" }}>
                <video
                  ref={videoRef}
                  src={heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />

                {/* Live badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 border-2 border-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-ink">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Live preview
                </div>

                {/* Sound sticker */}
                <button
                  type="button"
                  onClick={toggleSound}
                  aria-pressed={!muted}
                  className="comic-btn absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#FFD34E] px-3 py-1.5 text-[12px] font-bold text-ink"
                >
                  {muted ? "🔊 Tap for sound" : "🔇 Mute"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-text-tertiary">
          Scroll
        </span>
        <span className="block h-4 w-[3px] rounded-full bg-ink animate-scroll-line" />
      </div>
    </section>
  );
}
