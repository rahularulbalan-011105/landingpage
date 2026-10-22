import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { RobotStage, type RobotModel, type StagePhase } from "./RobotStage";
import { Lines, useT } from "@/i18n";

const MODELS: RobotModel[] = ["crawler", "arm", "humanoid"];

// Served as a static file from public/ (kept out of the bundler).
const tourVideo = "/hero-video.mp4";

export function Hero() {
  const t = useT();
  const h = t.hero;
  const [model, setModel] = useState<RobotModel>("crawler");
  const [phase, setPhase] = useState<StagePhase>("loading");
  const [rebuildKey, setRebuildKey] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);

  return (
    <>
      <section id="top" className="relative isolate overflow-hidden bg-wb-canvas font-ui text-wb-ink">
        <div className="relative flex min-h-[max(700px,100dvh)] flex-col">
          {/* The robot on the editor's grid */}
          <RobotStage
            className="absolute inset-0"
            model={model}
            rebuildKey={rebuildKey}
            onPhase={setPhase}
          />

          {/* Copy. Pointer events pass through to the robot, except on controls. */}
          <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1320px] px-5 pt-[132px] pb-[440px] sm:px-8 sm:pt-[168px] min-[900px]:pb-[180px]">
            <h1
              className="w-fit font-brand font-bold text-wb-ink"
              style={{ fontSize: "clamp(38px, 5.1vw, 74px)", lineHeight: 1.04, letterSpacing: "-0.045em" }}
            >
              <Lines text={h.title} />
            </h1>

            <p
              className="mt-6 max-w-[30em] text-wb-ink-2"
              style={{ fontSize: "clamp(17px, 1.35vw, 19px)", lineHeight: 1.6, textWrap: "pretty" }}
            >
              <span className="font-semibold text-wb-ink">{h.lead}</span>
              <br />
              {h.sub}
            </p>

            <div className="pointer-events-auto mt-9 flex w-fit flex-wrap items-center gap-x-6 gap-y-4">
              <Link to="/signup" className="wb-btn wb-btn-primary h-14 px-7 text-[17px]">
                {h.cta}
              </Link>
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="group inline-flex items-center gap-3 rounded-full py-1 pe-2 text-[16px] font-semibold text-wb-ink transition-colors hover:text-wb-orange"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-wb-line bg-white transition-transform group-hover:scale-105">
                  <Play className="h-4 w-4 translate-x-[1px] fill-current" />
                </span>
                {h.tour}
              </button>
            </div>
          </div>

          {/* Robot prompt / rebuild */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[96px]">
            <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between gap-3 px-5 sm:px-8">
              <div
                role="group"
                aria-label={h.chooseRobot}
                className="pointer-events-auto flex items-center gap-1 rounded-[14px] border border-wb-line bg-white/85 p-1 backdrop-blur"
              >
                {MODELS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={model === m}
                    onClick={() => setModel(m)}
                    className={[
                      "whitespace-nowrap rounded-[10px] px-3 py-2 text-[13px] font-semibold transition-colors sm:px-3.5",
                      model === m ? "bg-wb-ink text-white" : "text-wb-ink-2 hover:bg-wb-bench hover:text-wb-ink",
                    ].join(" ")}
                  >
                    {h.models[m]}
                  </button>
                ))}
              </div>
              {phase === "floating" || phase === "rebuilding" ? (
                <div className="flex items-center gap-4">
                <p className="hidden font-key text-[12px] text-wb-ink-3 md:block">{h.throwHint}</p>
                <button
                  type="button"
                  onClick={() => setRebuildKey((k) => k + 1)}
                  disabled={phase === "rebuilding"}
                  className="pointer-events-auto inline-flex items-center gap-2 whitespace-nowrap rounded-[12px] border border-wb-line bg-white/90 px-4 py-2.5 text-[14px] font-semibold text-wb-ink backdrop-blur transition-colors hover:border-wb-orange hover:text-wb-orange disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span className="sm:hidden">{h.rebuildShort}</span>
                  <span className="hidden sm:inline">{h.rebuildLong}</span>
                </button>
                </div>
              ) : (
                <p
                  className={[
                    "hidden font-key text-[12px] text-wb-ink-3 transition-opacity duration-500 sm:block",
                    phase === "assembled" ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                >
                  {h.dragHint}{" "}
                  <span className="[@media(pointer:coarse)]:hidden">{h.clickApart}</span>
                  <span className="hidden [@media(pointer:coarse)]:inline">{h.tapApart}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Dialog open={tourOpen} onOpenChange={setTourOpen}>
        <DialogContent className="w-[min(1120px,92vw)] max-w-none gap-0 overflow-hidden border-0 bg-black p-0 sm:rounded-[20px] [&>button]:right-3 [&>button]:top-3 [&>button]:rounded-full [&>button]:bg-white/90 [&>button]:p-2 [&>button]:text-wb-ink [&>button]:opacity-100">
          <DialogTitle className="sr-only">{h.tourTitle}</DialogTitle>
          {tourOpen && (
            <video src={tourVideo} autoPlay controls playsInline className="block aspect-video w-full bg-black" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
