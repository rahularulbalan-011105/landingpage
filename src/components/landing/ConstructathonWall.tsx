import { SectionHead } from "./SectionHead";
import { useT, type Messages } from "@/i18n";

/**
 * Constructathon recap: builders at work on the day and the robots they made,
 * laid out as one wall, then a running line of everything built in Constructa.
 */

type Alt = keyof Messages["constructathon"]["alts"];
type Tile =
  | { kind: "photo"; src: string; alt: Alt; caption: number; span: string; pos?: string }
  | { kind: "robot"; src: string; alt: Alt; span?: string };

// Laid out to fill a 6-column grid exactly (dense flow). Alt text and captions come from the translations.
const WALL: Tile[] = [
  { kind: "photo", src: "/constructathon/build-1.jpg", alt: "build1", caption: 0, span: "col-span-2 row-span-2 lg:row-span-3", pos: "50% 60%" },
  { kind: "robot", src: "/robots/spider.png", alt: "spider", span: "col-span-2 row-span-2" },
  { kind: "robot", src: "/constructathon/wall-humanoid.png", alt: "humanoid" },
  { kind: "robot", src: "/constructathon/wall-quad.png", alt: "quad" },
  { kind: "robot", src: "/constructathon/wall-battle.png", alt: "battle" },
  { kind: "robot", src: "/constructathon/wall-duck.png", alt: "duck" },
  { kind: "robot", src: "/constructathon/wall-car.png", alt: "car" },
  { kind: "robot", src: "/constructathon/wall-scorpion.png", alt: "scorpion" },
  { kind: "photo", src: "/constructathon/build-2.jpg", alt: "build2", caption: 1, span: "col-span-2 row-span-2 lg:row-span-3", pos: "50% 45%" },
  { kind: "photo", src: "/constructathon/build-3.jpg", alt: "build3", caption: 2, span: "col-span-2 row-span-2 lg:col-span-4", pos: "45% 52%" },
];

// Everything built in Constructa, for the running line.
const STRIP = [
  "/constructathon/wall-humanoid.png",
  "/robots/spider.png",
  "/constructathon/wall-quad.png",
  "/robots/car.png",
  "/constructathon/wall-battle.png",
  "/robots/highfive.png",
  "/robots/gripper.png",
  "/constructathon/wall-duck.png",
];

export function ConstructathonWall() {
  const c = useT().constructathon;
  return (
    <section id="constructathon" className="scroll-mt-20 bg-wb-canvas pb-4 pt-28 font-ui text-wb-ink sm:pt-36">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
        <SectionHead eyebrow={c.eyebrow} title={c.title} aside={c.aside} />

        {/* The wall */}
        <div className="mt-12 grid grid-flow-row-dense auto-rows-[132px] grid-cols-2 gap-3 sm:auto-rows-[150px] sm:grid-cols-4 lg:auto-rows-[136px] lg:grid-cols-6 lg:gap-4">
          {WALL.map((t, idx) =>
            t.kind === "photo" ? (
              <figure key={idx} className={`group relative overflow-hidden rounded-[18px] bg-wb-bench ${t.span}`}>
                <img
                  src={t.src}
                  alt={c.alts[t.alt]}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{ objectPosition: t.pos }}
                />
                <figcaption className="absolute bottom-3 start-3 rounded-[9px] bg-white/92 px-2.5 py-1 text-[12px] font-semibold text-wb-ink backdrop-blur">
                  {c.captions[t.caption]}
                </figcaption>
              </figure>
            ) : (
              <div key={idx} className={`overflow-hidden rounded-[18px] border border-wb-line bg-white ${t.span ?? ""}`}>
                <img src={t.src} alt={c.alts[t.alt]} loading="lazy" className="h-full w-full scale-[1.04] object-cover" />
              </div>
            ),
          )}
        </div>
      </div>

      {/* Running line: everything built in Constructa */}
      {/* dir="ltr": the marquee animation scrolls leftward, so keep its layout LTR even on Arabic */}
      <div dir="ltr" className="relative mt-12 overflow-hidden" aria-label={c.stripLabel}>
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent sm:w-32" />
        <ul className="wb-marquee flex w-max gap-3">
          {[...STRIP, ...STRIP].map((src, i) => (
            <li
              key={i}
              aria-hidden={i >= STRIP.length}
              className="h-[118px] w-[132px] shrink-0 overflow-hidden rounded-[14px] border border-wb-line bg-white sm:h-[138px] sm:w-[156px]"
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full scale-[1.04] object-cover" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
