import { useEffect, useRef } from "react";
import {
  ArrowUpFromLine,
  Axis3d,
  Box,
  Braces,
  Check,
  Cpu,
  Crosshair,
  GripVertical,
  Grid3x3,
  Layers,
  Magnet,
  Minus,
  Move,
  Play,
  RotateCcw,
  RotateCw,
  Save,
  Scaling,
  Scissors,
  Settings,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import { STORY, seg } from "./CarStoryStage";
import { useT } from "@/i18n";

/**
 * The Constructa editor's own chrome (constructa.atumx.in), rebuilt in HTML so it
 * stays crisp, laid around the car story. Everything here only reads scroll
 * progress `p`; the 3D stage is never touched.
 */

type Item = { name: string; at: readonly [number, number] };
const state = (p: number, it: Item) => {
  const k = seg(p, it.at[0], it.at[1]);
  return k >= 1 ? "done" : k > 0 ? "placing" : "idle";
};
const placing = (p: number) => [...STORY.build, ...STORY.wire].find((it) => state(p, it) === "placing");

// Shared "enter" motion: the chrome slides in once the stage is on screen.
const ENTER =
  "opacity-0 transition-[opacity,transform] duration-700 ease-out group-[.is-visible]:translate-x-0 group-[.is-visible]:translate-y-0 group-[.is-visible]:opacity-100 motion-reduce:transition-none";

// ── Top bar: the floating Dashboard · Save · name · status pill ──────────────

export function EditorTopBar({ p }: { p: number }) {
  const typing = p > STORY.code.type[0] && p < STORY.code.type[1];
  const saving = !!placing(p) || typing;
  return (
    <div
      aria-hidden
      className={`${ENTER} -translate-y-3 flex items-center gap-2 rounded-full border border-wb-line bg-white/95 py-1.5 pl-1.5 pr-4 shadow-[0_10px_30px_-14px_rgba(28,36,33,0.35)] backdrop-blur`}
    >
      <span className="rounded-full bg-wb-orange px-3 py-1 text-[12.5px] font-semibold text-white">← Dashboard</span>
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22B35E] px-3 py-1 text-[12.5px] font-semibold text-white">
        <Save className="h-3.5 w-3.5" strokeWidth={2.25} />
        Save
      </span>
      <span className="ml-1 text-[13.5px] font-semibold text-wb-ink">Robot car</span>
      <span className="inline-flex w-[72px] items-center gap-1.5 text-[12.5px] font-medium">
        {saving ? (
          <>
            <span className="h-2 w-2 animate-pulse rounded-full bg-wb-orange" />
            <span className="text-wb-ink-2">Saving…</span>
          </>
        ) : (
          <>
            <Check className="h-3.5 w-3.5 text-[#22B35E]" strokeWidth={2.75} />
            <span className="text-[#22B35E]">Saved</span>
          </>
        )}
      </span>
    </div>
  );
}

// ── Right icon rail: CAD · ELEC · CODE · SIMULATE ────────────────────────────

const RAIL: { label: string; icon: LucideIcon }[] = [
  { label: "CAD", icon: Box },
  { label: "ELEC", icon: Cpu },
  { label: "CODE", icon: Braces },
  { label: "SIMULATE", icon: Play },
];

export function EditorRail({
  active,
  p,
  onPick,
  onSimulate,
}: {
  active: number;
  p: number;
  onPick: (i: number) => void;
  onSimulate: () => void;
}) {
  const running = p >= STORY.code.upload[1];
  const on = running ? 3 : active;
  const stepsLabel = useT().how.stepsLabel;
  return (
    <nav
      aria-label={stepsLabel}
      className={`${ENTER} translate-x-4 wb-panel flex flex-col items-center gap-1 rounded-[18px] p-1.5`}
    >
      {RAIL.map(({ label, icon: Icon }, i) => (
        <button
          key={label}
          type="button"
          aria-pressed={on === i}
          onClick={() => (i === 3 ? onSimulate() : onPick(i))}
          className={[
            "flex h-[58px] w-[64px] flex-col items-center justify-center gap-1 rounded-[14px] transition-[background-color,color,box-shadow] duration-300",
            on === i
              ? "bg-wb-orange text-white shadow-[0_8px_18px_-8px_rgba(255,107,53,0.8)]"
              : "text-wb-ink hover:bg-wb-bench",
          ].join(" ")}
        >
          <Icon className={i === 3 ? "h-4 w-4 fill-current" : "h-[18px] w-[18px]"} strokeWidth={1.9} />
          <span className="text-[9.5px] font-semibold tracking-[0.04em]">{label}</span>
        </button>
      ))}
      <span aria-hidden className="mt-1 flex h-[50px] w-[64px] flex-col items-center justify-center gap-1 text-wb-ink-3">
        <Settings className="h-[17px] w-[17px]" strokeWidth={1.9} />
        <span className="text-[9.5px] font-semibold tracking-[0.04em]">SETTINGS</span>
      </span>
      {/* scroll progress, where the old step pill kept it */}
      <span aria-hidden className="mb-1 mt-1 h-[2px] w-[44px] overflow-hidden rounded-full bg-wb-line">
        <span className="block h-full origin-left bg-wb-orange" style={{ transform: `scaleX(${p})` }} />
      </span>
    </nav>
  );
}

// ── Status bar: object count, selection, the real shortcut strip ────────────

const QTY = [1, 2, 2, 1, 1, 1]; // chassis, motors, wheels, caster, UNO, sonar

export function EditorStatusBar({ p }: { p: number }) {
  const parts = [...STORY.build, ...STORY.wire.slice(0, 2)];
  const objects = parts.reduce((n, it, i) => n + (state(p, it) === "done" ? QTY[i] : 0), 0);
  const now = placing(p);
  const running = p >= STORY.code.upload[1];
  const selection = running ? "Running on Arduino UNO" : now ? `Selected: ${now.name}` : "No selection";
  return (
    <div
      aria-hidden
      className={`${ENTER} translate-y-3 flex h-9 items-center gap-6 border-t border-wb-line bg-white/90 px-5 text-[12px] text-wb-ink-2 backdrop-blur sm:px-8`}
    >
      <span className="tabular-nums">Objects: {objects}</span>
      <span className={running ? "text-[#22B35E]" : ""}>{selection}</span>
      <span className="ml-auto hidden truncate text-wb-ink-3 min-[1280px]:block">
        Shortcuts: 1-0 add shape · W/E/R move-rotate-scale · G grid · A axes · Del delete · Ctrl+Z/Y undo/redo · F fit
      </span>
    </div>
  );
}

// ── Step panels (left column): faithful copies of the editor's own drawers ──

/** Header shared by the editor's floating drawers: icon tile, title / tab, close or collapse. */
function DrawerHead({ icon: Icon, title, sub, grip }: { icon: LucideIcon; title: string; sub?: string; grip?: boolean }) {
  return (
    <div className="flex items-center gap-2.5 px-4 pb-3 pt-3.5">
      {grip && <GripVertical className="-ml-1 h-4 w-4 text-wb-ink-3" />}
      {grip ? (
        <Icon className="h-[17px] w-[17px] text-wb-orange" strokeWidth={2.1} />
      ) : (
        <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#FFF0E9] text-wb-orange">
          <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
        </span>
      )}
      <span className="text-[15px] font-bold text-wb-ink">{title}</span>
      {sub && <span className="text-[13px] text-wb-ink-3">/ {sub}</span>}
      <span className="ml-auto text-wb-ink-2">{grip ? <Minus className="h-4 w-4" /> : <X className="h-4 w-4" />}</span>
    </div>
  );
}

function Pills({ items, on }: { items: string[]; on: string }) {
  return (
    <div className="flex gap-1.5 px-4 pb-3">
      {items.map((t) => (
        <span
          key={t}
          className={[
            "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-300",
            t === on ? "bg-wb-orange text-white" : "bg-[#EEF1F5] text-wb-ink",
          ].join(" ")}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

type Tool = { label: string; icon: LucideIcon; key?: string; on?: boolean };
const TOOL_ROWS: Tool[][] = [
  [
    { label: "Move", icon: Move, key: "W", on: true },
    { label: "Rotate", icon: RotateCw, key: "E" },
    { label: "Scale", icon: Scaling, key: "R" },
  ],
  [
    { label: "Surface", icon: Layers },
    { label: "Extrude", icon: ArrowUpFromLine },
    { label: "Slice", icon: Scissors },
  ],
  [
    { label: "Snap", icon: Magnet },
    { label: "Rot snap", icon: RotateCcw },
    { label: "Guides", icon: Crosshair, on: true },
    { label: "Grid", icon: Grid3x3, on: true },
    { label: "Axes", icon: Axis3d, on: true },
  ],
];

/** CAD step: the editor's Quick Tools panel. Snap lights up while a part snaps into place. */
export function QuickToolsPanel({ p }: { p: number }) {
  const now = STORY.build.find((it) => state(p, it) === "placing");
  return (
    <div className="w-[244px] overflow-hidden rounded-[20px] border border-wb-line bg-white shadow-[0_18px_40px_-18px_rgba(28,36,33,0.28)]">
      <DrawerHead icon={Wrench} title="Quick Tools" grip />
      <div className="px-2.5 pb-2.5">
        {TOOL_ROWS.map((row, r) => (
          <div key={r} className={["grid grid-cols-3 gap-1.5 py-1.5", r > 0 ? "border-t border-wb-line" : ""].join(" ")}>
            {row.map(({ label, icon: Icon, key, on }) => {
              const lit = on || (label === "Snap" && !!now);
              return (
                <span
                  key={label}
                  className={[
                    "relative flex h-[62px] flex-col items-center justify-center gap-1 rounded-[14px] transition-[background-color,color,box-shadow] duration-300",
                    lit ? "bg-wb-orange text-white shadow-[0_6px_14px_-6px_rgba(255,107,53,0.75)]" : "bg-[#F4F6F8] text-wb-ink",
                  ].join(" ")}
                >
                  <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
                  <span className="text-[11px] font-semibold leading-none">{label}</span>
                  {key && <span className={`absolute right-1.5 top-1 text-[8.5px] font-semibold ${lit ? "text-white/85" : "text-wb-ink-3"}`}>{key}</span>}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div className="flex h-8 items-center border-t border-wb-line px-4 font-key text-[10.5px] text-wb-ink-3">
        {now ? <span className="text-wb-orange">Snapping {now.name.toLowerCase()}…</span> : <span>Objects snap to the grid</span>}
      </div>
    </div>
  );
}

// The ELEC library, as it appears in the editor.
const LIBRARY = [
  {
    title: "MCUs",
    color: "#3B82F6",
    tint: "#E8F0FE",
    blurb: "Controllers that run your code.",
    items: [
      { name: "Arduino", sub: "Microcontroller board", story: 0 },
      { name: "SUBO", sub: "ESP32 board (AtumX)" },
    ],
  },
  {
    title: "Sensors",
    color: "#14B8A6",
    tint: "#E6F6F4",
    blurb: "Measure the world and report back.",
    items: [
      { name: "Ultrasonic", sub: "HC-SR04 distance", story: 1 },
      { name: "IR Sensor", sub: "Obstacle detect" },
      { name: "Gas Sensor", sub: "MQ combustible" },
      { name: "Color Sensor", sub: "TCS3200 RGB" },
      { name: "LDR Sensor", sub: "Light level" },
      { name: "DHT11", sub: "Temp + humidity" },
    ],
  },
  {
    title: "Displays",
    color: "#8B5CF6",
    tint: "#F1ECFE",
    blurb: "Show text and graphics.",
    items: [{ name: "OLED", sub: "SSD1306 128×64" }],
  },
] as const;

/** ELEC step: the ELEC drawer's library, then its Wiring tab with the 2D workbench. */
export function ElecPanel({ p }: { p: number }) {
  const wireIt = STORY.wire[2];
  const wiring = p >= wireIt.at[0];
  return (
    <div className="w-[340px] overflow-hidden rounded-[20px] border border-wb-line bg-white shadow-[0_18px_40px_-18px_rgba(28,36,33,0.28)]">
      <DrawerHead icon={Cpu} title="ELEC" sub={wiring ? "Wiring" : "Elec"} />
      <Pills items={["Elec", "Mech", "Wiring"]} on={wiring ? "Wiring" : "Elec"} />
      <div className="border-t border-wb-line">{wiring ? <WiringView p={p} /> : <LibraryView p={p} />}</div>
    </div>
  );
}

function LibraryView({ p }: { p: number }) {
  // Like the real drawer: a fixed-height list that scrolls to the part being added.
  const listRef = useRef<HTMLDivElement>(null);
  const placingIdx = STORY.wire.slice(0, 2).findIndex((it) => state(p, it) === "placing");
  useEffect(() => {
    const list = listRef.current;
    if (!list || placingIdx < 0) return;
    const row = list.querySelector<HTMLElement>(`[data-story="${placingIdx}"]`);
    if (row) list.scrollTo({ top: Math.max(0, row.offsetTop - 64), behavior: "smooth" });
  }, [placingIdx]);

  return (
    <div className="pb-3 pl-3 pr-1.5 pt-2.5">
      <p className="px-1 pb-2 text-[10.5px] font-bold uppercase tracking-[0.1em] text-wb-orange">Electronics</p>
      <div
        ref={listRef}
        className="relative h-[292px] space-y-2 overflow-y-auto pr-1.5 [scrollbar-color:#CBD3DC_transparent] [scrollbar-width:thin]"
      >
        {LIBRARY.map((g) => (
          <div key={g.title} className="overflow-hidden rounded-[12px] border border-wb-line" style={{ borderLeft: `3px solid ${g.color}` }}>
            <div className="flex items-center gap-2 px-3 py-2" style={{ background: g.tint }}>
              <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
              <span className="text-[13.5px] font-semibold text-wb-ink">{g.title}</span>
              <span className="text-[12px] font-semibold" style={{ color: g.color }}>
                {g.items.length}
              </span>
              <span className="ml-auto text-[8px] text-wb-ink-3">▼</span>
            </div>
            <p className="px-3 pb-1.5 pt-1.5 text-[10.5px] text-wb-ink-3">{g.blurb}</p>
            <div className="space-y-1.5 px-2 pb-2">
              {g.items.map((it) => {
                const s = "story" in it ? state(p, STORY.wire[it.story]) : "idle";
                return (
                  <div
                    key={it.name}
                    data-story={"story" in it ? it.story : undefined}
                    className={[
                      "flex items-center rounded-[9px] px-2.5 py-1.5 transition-[background-color,box-shadow] duration-300",
                      s === "placing" ? "bg-[#FFF3EC] shadow-[inset_0_0_0_1.5px_#FF6B35]" : "bg-[#F6F8FA]",
                    ].join(" ")}
                  >
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold leading-tight text-wb-ink">{it.name}</p>
                      <p className="text-[11px] leading-tight text-wb-ink-3">{it.sub}</p>
                    </div>
                    <span className="ml-auto pl-2">
                      {s === "placing" ? (
                        <span className="font-key text-[10px] text-wb-orange">adding…</span>
                      ) : s === "done" ? (
                        <span className="flex h-[16px] w-[16px] items-center justify-center rounded-full bg-wb-axis text-white">
                          <Check className="h-2.5 w-2.5" strokeWidth={3.2} />
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 2D workbench, like the editor's Wiring view: parts as flat cards, wires drawn pin to pin.
const WIRES = [
  { d: "M58 70 C 58 112, 170 112, 186 92", color: "#EF4444", label: "5V → Sonar VCC" },
  { d: "M70 70 C 72 120, 196 122, 202 92", color: "#1C2421", label: "GND → Sonar GND" },
  { d: "M96 24 C 120 -4, 214 0, 218 60", color: "#22C55E", label: "D9 → TRIG" },
  { d: "M106 24 C 140 6, 236 10, 234 60", color: "#EC4899", label: "D10 → ECHO" },
  { d: "M82 24 C 60 -6, 10 20, 30 140", color: "#06B6D4", label: "D5 → Motor A" },
  { d: "M118 24 C 150 -2, 300 30, 270 140", color: "#A855F7", label: "D6 → Motor B" },
];

function WiringView({ p }: { p: number }) {
  const wireIt = STORY.wire[2];
  const k = seg(p, wireIt.at[0], wireIt.at[1]);
  const drawn = k * WIRES.length;
  const current = WIRES[Math.min(WIRES.length - 1, Math.floor(drawn))];
  return (
    <div className="px-3 pb-3 pt-3">
      <div className="grid grid-cols-2 rounded-[11px] bg-[#EEF1F5] p-1 text-center text-[12.5px] font-semibold">
        <span className="rounded-[8px] bg-white py-1.5 text-wb-orange shadow-sm">Workbench</span>
        <span className="py-1.5 text-wb-ink">Pick a Pin</span>
      </div>
      <div className="mt-2.5 overflow-hidden rounded-[12px] border border-wb-line bg-[#F7F8FA]" style={{ backgroundImage: "radial-gradient(#E3E7EC 1px, transparent 1px)", backgroundSize: "12px 12px" }}>
        <svg viewBox="0 0 314 196" className="block h-auto w-full" aria-hidden>
          {/* Arduino UNO */}
          <rect x="18" y="18" width="116" height="58" rx="7" fill="#138C8C" />
          <rect x="30" y="20" width="96" height="6" rx="2" fill="#0B5F5F" />
          <rect x="20" y="36" width="10" height="16" rx="2" fill="#D9DEE2" />
          <text x="76" y="52" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" letterSpacing="1.5">ARDUINO</text>
          <rect x="60" y="57" width="32" height="10" rx="2" fill="#0E1A18" />
          <text x="76" y="64.5" textAnchor="middle" fontSize="6.5" fontWeight="800" fill="#fff">UNO</text>
          {/* Ultrasonic */}
          <rect x="176" y="56" width="74" height="40" rx="6" fill="#1F4FD8" />
          <circle cx="198" cy="72" r="9" fill="#E8ECEF" />
          <circle cx="228" cy="72" r="9" fill="#E8ECEF" />
          <circle cx="198" cy="72" r="4.5" fill="#6E7A84" />
          <circle cx="228" cy="72" r="4.5" fill="#6E7A84" />
          <text x="213" y="91" textAnchor="middle" fontSize="6" fontWeight="800" fill="#fff" letterSpacing="0.8">ULTRASONIC</text>
          {/* BO motors */}
          <rect x="12" y="138" width="52" height="28" rx="5" fill="#F5C518" />
          <rect x="64" y="146" width="12" height="12" rx="2" fill="#E2B000" />
          <text x="38" y="155" textAnchor="middle" fontSize="6" fontWeight="800" fill="#1C2421">BO MOTOR</text>
          <rect x="240" y="138" width="52" height="28" rx="5" fill="#F5C518" />
          <rect x="228" y="146" width="12" height="12" rx="2" fill="#E2B000" />
          <text x="266" y="155" textAnchor="middle" fontSize="6" fontWeight="800" fill="#1C2421">BO MOTOR</text>
          {/* wires, drawn on one after another */}
          {WIRES.map((w, i) => {
            const t = Math.min(1, Math.max(0, drawn - i));
            return (
              <path
                key={w.label}
                d={w.d}
                fill="none"
                stroke={w.color}
                strokeWidth="2.2"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray="1"
                strokeDashoffset={1 - t}
                opacity={t > 0 ? 1 : 0}
              />
            );
          })}
        </svg>
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-wb-ink-3">
        {[
          ["#EF4444", "Power"],
          ["#1C2421", "GND"],
          ["#FF6B35", "Signal"],
        ].map(([c, l]) => (
          <span key={l} className="inline-flex items-center gap-1.5">
            <span className="h-[3px] w-3.5 rounded-full" style={{ background: c }} />
            {l}
          </span>
        ))}
        <span className="ml-auto font-key tabular-nums text-wb-ink-2">
          {Math.min(WIRES.length, Math.floor(drawn + 0.001))}/{WIRES.length} wires
        </span>
      </div>
      <p className="mt-1.5 h-4 truncate font-key text-[10.5px] text-wb-orange">{k > 0 && k < 1 ? `Wiring ${current.label}…` : k >= 1 ? "All connected" : ""}</p>
    </div>
  );
}
