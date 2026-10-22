/**
 * How hard the landing page is allowed to push the GPU.
 *
 * The two 3D scenes (the hero robot and the car story) were authored at desktop
 * quality: 2048² soft shadows, MSAA, and up to 2× device pixel ratio. On an
 * integrated-graphics laptop that combination costs far more than the scene is
 * worth — the shadow map alone is redrawn every frame — so the page janks or
 * the fans spin up on machines that should render it comfortably.
 *
 * This reads what the browser will tell us about the machine ONCE, picks a
 * tier, and hands both scenes concrete settings. Nothing here fingerprints the
 * visitor: it is the same capability information any WebGL app reads to size
 * its own buffers, it never leaves the tab, and it is not stored.
 *
 * Deliberately conservative: anything we cannot identify is treated as
 * "medium", never "high".
 */

export type Tier = "off" | "low" | "medium" | "high";

export type StageQuality = {
  tier: Tier;
  /** false when the machine has no usable GPU path — callers skip 3D entirely. */
  enabled: boolean;
  dpr: number;
  antialias: boolean;
  shadows: boolean;
  /** Square shadow-map resolution; 0 when shadows are off. */
  shadowMapSize: number;
};

const SETTINGS: Record<Tier, Omit<StageQuality, "tier">> = {
  // Software rasteriser (or no WebGL): a 3D scene would be a slideshow. The
  // scenes already handle this - the hero copy stands on its own without it.
  off: { enabled: false, dpr: 1, antialias: false, shadows: false, shadowMapSize: 0 },
  // Weak integrated GPU / few cores: keep the scene, drop everything per-pixel.
  // No MSAA, no shadow pass, render at 1 device pixel per CSS pixel.
  low: { enabled: true, dpr: 1, antialias: false, shadows: false, shadowMapSize: 0 },
  // Typical laptop: shadows but a quarter of the map area, no MSAA.
  medium: { enabled: true, dpr: 1.5, antialias: false, shadows: true, shadowMapSize: 1024 },
  // What the scenes were authored at.
  high: { enabled: true, dpr: 2, antialias: true, shadows: true, shadowMapSize: 2048 },
};

/** Renderer strings that mean "there is no real GPU behind this". */
const SOFTWARE = /swiftshader|llvmpipe|softpipe|basic render|microsoft basic|mesa offscreen/i;
/** Integrated parts that cannot afford a full-resolution shadow pass. */
const WEAK_GPU = /intel.*(hd|uhd) graphics|gma|apple a[0-9]|mali-[4-6]|adreno [1-4][0-9]{2}|videocore/i;
/** Integrated parts that are fine at medium but not worth MSAA + 2048² shadows. */
const MID_GPU = /intel|iris|radeon (vega|r[2-7])|uhd/i;

function gpuName(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const name = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) ?? "") : "";
    // Release the probe context immediately - browsers cap how many may exist,
    // and the page needs two of its own.
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return name;
  } catch {
    return "";
  }
}

function detect(): StageQuality {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { tier: "medium", ...SETTINGS.medium }; // SSR: never assume the best case
  }

  const gpu = gpuName();
  if (!gpu && !window.WebGLRenderingContext) return { tier: "off", ...SETTINGS.off };
  if (SOFTWARE.test(gpu)) return { tier: "off", ...SETTINGS.off };

  const cores = navigator.hardwareConcurrency || 0;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0;

  // Reported values of 0 mean "not exposed", so only treat real numbers as weak.
  const fewCores = cores > 0 && cores <= 4;
  const lowMemory = memory > 0 && memory <= 4;

  let tier: Tier;
  if (WEAK_GPU.test(gpu) || (fewCores && lowMemory)) tier = "low";
  else if (MID_GPU.test(gpu) || fewCores || lowMemory) tier = "medium";
  else if (!gpu) tier = "medium"; // unknown GPU: never the top tier
  else tier = "high";

  const settings = SETTINGS[tier];
  return {
    tier,
    ...settings,
    // Never render more pixels than the display actually has.
    dpr: Math.min(window.devicePixelRatio || 1, settings.dpr),
  };
}

let cached: StageQuality | null = null;

/** Probe once per page load; both scenes share the answer. */
export function stageQuality(): StageQuality {
  if (!cached) cached = detect();
  return cached;
}
