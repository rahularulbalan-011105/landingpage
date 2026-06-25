import { SignupForm } from "./SignupForm";

// Served as a static file from public/ (47 MB — kept out of the bundler).
const heroVideo = "/hero-video.mp4";


export function Hero() {
  return (
    <section
      id="top"
      className="relative min-h-[100vh] min-h-[720px] flex items-center pt-[72px] overflow-hidden"
    >
      {/* Subtle radial warmth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(255,107,53,0.06) 0%, transparent 50%)",
        }}
      />

      <div className="mx-auto max-w-[1280px] w-full px-6 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center relative">
        <div className="lg:col-span-6">
          <div className="font-mono text-[13px] uppercase tracking-[0.15em] text-[#FF6B35]">
            <span className="word-rise" style={{ animationDelay: "0ms" }}>
              Beta · Now open
            </span>
          </div>

          <h1
            className="mt-6 text-foreground font-medium tracking-tight"
            style={{
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              maxWidth: "900px",
            }}
          >
            <span className="block word-rise" style={{ animationDelay: "80ms" }}>
              Build any robot
            </span>
            <span className="block word-rise" style={{ animationDelay: "180ms" }}>
              you{" "}
              <em
                className="not-italic"
                style={{
                  color: "#FF6B35",
                  fontStyle: "italic",
                  fontWeight: 500,
                }}
              >
                imagine
              </em>
              .
            </span>
            <span className="block word-rise" style={{ animationDelay: "280ms" }}>
              Watch it run.
            </span>
          </h1>

          <p
            className="mt-6 text-text-secondary word-rise"
            style={{
              fontSize: "clamp(17px, 1.6vw, 20px)",
              lineHeight: 1.5,
              maxWidth: "600px",
              animationDelay: "420ms",
            }}
          >
            We make robots. So we built the tool we wished we had. Free-form 3D
            robot building with real physics — entirely in your browser.
          </p>

          <p
            className="mt-8 font-mono text-[12px] sm:text-[13px] uppercase tracking-[0.1em] text-text-tertiary word-rise"
            style={{ animationDelay: "520ms" }}
          >
            By the team behind SUBO · Used in 500+ schools · India, USA, UAE, Australia
          </p>

          <div
            className="mt-12 word-rise"
            style={{ animationDelay: "620ms" }}
          >
            <SignupForm variant="hero" />
          </div>
        </div>

        {/* Hero video */}
        <div className="lg:col-span-6 lg:-mr-8 xl:-mr-16">
          <div className="relative group">
            {/* Orange glow */}
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-md opacity-70 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,53,0.45), rgba(255,107,53,0.05) 45%, rgba(255,107,53,0.35))",
              }}
            />
            {/* Gradient border frame */}
            <div
              className="relative rounded-md p-px"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,107,53,0.9), rgba(255,107,53,0.15) 40%, rgba(255,255,255,0.08) 70%, rgba(255,107,53,0.6))",
              }}
            >
              {/* Corner ticks */}
              <span className="absolute -top-2 -left-2 h-3 w-3 border-t border-l border-[#FF6B35] z-10" />
              <span className="absolute -top-2 -right-2 h-3 w-3 border-t border-r border-[#FF6B35] z-10" />
              <span className="absolute -bottom-2 -left-2 h-3 w-3 border-b border-l border-[#FF6B35] z-10" />
              <span className="absolute -bottom-2 -right-2 h-3 w-3 border-b border-r border-[#FF6B35] z-10" />

              <div
                className="relative w-full rounded-[5px] overflow-hidden bg-[#0A0A0A]"
                style={{ aspectRatio: "16 / 9" }}
              >
                <video
                  src={heroVideo}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
                {/* Inner edge highlight to keep dark frames from bleeding into bg */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[5px]"
                  style={{
                    boxShadow:
                      "inset 0 0 0 1px rgba(255,255,255,0.06), inset 0 0 80px rgba(255,107,53,0.08)",
                  }}
                />
                {/* Mono label */}
                <div className="absolute top-3 left-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF6B35] animate-pulse" />
                  Live preview
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-tertiary">
          Scroll
        </span>
        <span className="block h-4 w-px bg-text-tertiary animate-scroll-line" />
      </div>
    </section>
  );
}
