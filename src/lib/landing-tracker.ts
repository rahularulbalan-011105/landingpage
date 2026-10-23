/**
 * Constructa analytics — landing-site side (v2).
 * ----------------------------------------------------------------------------
 * Sends events to the same Apps Script collector as the editor ("cx_events" tab,
 * see toolsapp/docs/utm-collector.gs); the dashboard is
 * https://constructa.atumx.in/utm-dashboard.html
 *
 *  • vid   — a persistent visitor id (localStorage). Handed to the editor in the
 *            workspace URL (?cx_vid=…) so landing visits and workshop activity
 *            belong to the same person.
 *  • attribution — utm_* / ref captured on ARRIVAL and stored, so it survives
 *            navigating to /signup, /login, /dashboard (which drop the query).
 *            Rule: explicit UTM > external referrer > previously stored > direct.
 *  • email — attached once the visitor signs up / logs in.
 *
 * SSR-safe: every function no-ops on the server. Sends are text/plain beacons
 * (no CORS preflight — Apps Script can't answer one).
 */

const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxgWlc_0ZkVdtNGznRm1pCRmKZes18Yrm_XzgDknByKcRfiHxfNh6lfgM0EWIi2SKc0sw/exec";

export type LandingEvent =
  | "landing_view"
  | "cta_click"
  | "updates_signup"
  | "signup"
  | "login"
  | "open_editor"
  | "whatsapp_click";

type Attribution = {
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
  ref: string;
  referrer: string;
};

// Ingest token for the collector. It ships in this bundle, so it is NOT a secret:
// it only stops drive-by posting to a public endpoint.
const WRITE_TOKEN = "cx1_w7kQ2mBvRt";

const ATTR_KEY = "cx_attr_v2";
const VID_KEY = "cx_vid";
const SID_KEY = "cx_sid";
const EMAIL_KEY = "cx_email";
const VIEW_KEY = "cx_viewed";
const UTM = ["source", "medium", "campaign", "content", "term"] as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isBrowser = () => typeof window !== "undefined";
function lsGet(k: string) { try { return localStorage.getItem(k); } catch { return null; } }
function lsSet(k: string, v: string) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
function ssGet(k: string) { try { return sessionStorage.getItem(k); } catch { return null; } }
function ssSet(k: string, v: string) { try { sessionStorage.setItem(k, v); } catch { /* private mode */ } }
const makeId = (p: string) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);

let _attr: Attribution | null = null;

// Coarse location straight from the browser: the IANA time zone and the UI
// language. No IP lookup and no third-party geo service — a time zone is a
// region, not an address. The dashboard maps it to a city/country dot.
function visitorZone(): string {
  try { return (Intl.DateTimeFormat().resolvedOptions().timeZone || "").slice(0, 60); } catch { return ""; }
}
function visitorLang(): string {
  try { return String(navigator.language || "").slice(0, 20); } catch { return ""; }
}

function deviceType(): string {
  const ua = navigator.userAgent || "";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) return "tablet";
  if (/Mobi|Android|iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  return "desktop";
}

/** Source name from an external referrer (null for our own sites / none). */
function sourceFromReferrer(ref: string): string | null {
  try {
    if (!ref) return null;
    const h = new URL(ref).hostname.toLowerCase().replace(/^www\./, "");
    if (!h || /constructa|atumx/.test(h)) return null;
    if (h.includes("instagram")) return "instagram";
    if (h.includes("youtube") || h.includes("youtu.be")) return "youtube";
    if (h.includes("discord")) return "discord";
    if (h.includes("whatsapp") || h.includes("wa.me")) return "whatsapp";   // older links still circulating
    if (h.includes("facebook") || h.startsWith("fb.") || h.includes("fb.me")) return "facebook";
    if (h.includes("linkedin") || h === "lnkd.in") return "linkedin";
    if (h.includes("twitter") || h === "x.com" || h === "t.co") return "twitter";
    if (h.includes("reddit")) return "reddit";
    if (h === "t.me" || h.includes("telegram")) return "telegram";
    if (h.includes("google")) return "google";
    if (h.includes("bing")) return "bing";
    return h;
  } catch {
    return null;
  }
}

const DIRECT: Attribution = { source: "(direct)", medium: "", campaign: "", content: "", term: "", ref: "", referrer: "" };

/** Resolve (and persist) this visitor's attribution. Call on first client mount. */
function resolveAttribution(): Attribution {
  const p = new URLSearchParams(window.location.search);
  let stored: Attribution | null = null;
  try { stored = JSON.parse(lsGet(ATTR_KEY) || "null"); } catch { stored = null; }
  let fresh: Attribution | null = null;
  if (p.get("utm_source")) {
    fresh = { ...DIRECT, ref: (p.get("ref") || "").slice(0, 80), referrer: (document.referrer || "").slice(0, 300) };
    for (const k of UTM) fresh[k] = (p.get("utm_" + k) || "").slice(0, 120);
  } else {
    const inferred = sourceFromReferrer(document.referrer);
    if (inferred)
      fresh = { ...DIRECT, source: inferred, medium: "referral", ref: (p.get("ref") || "").slice(0, 80), referrer: document.referrer.slice(0, 300) };
  }
  if (fresh) { lsSet(ATTR_KEY, JSON.stringify(fresh)); return fresh; }
  return stored && stored.source ? stored : DIRECT;
}

function attribution(): Attribution {
  if (!_attr) _attr = resolveAttribution();
  return _attr;
}

function vid(): string {
  let v = lsGet(VID_KEY);
  if (!v) { v = makeId("v"); lsSet(VID_KEY, v); }
  return v;
}

function sid(): string {
  let s = ssGet(SID_KEY);
  if (!s) { s = makeId("s"); ssSet(SID_KEY, s); }
  return s;
}

/** Remember who this visitor is (after sign-up / login) so later events carry the email. */
export function setTrackedEmail(email?: string | null): void {
  if (!isBrowser() || !email) return;
  const e = email.trim().toLowerCase();
  if (EMAIL_RE.test(e)) lsSet(EMAIL_KEY, e);
}

/** Fire one event. Safe anywhere; no-ops during SSR. */
export function ctrack(event: LandingEvent, email?: string, meta?: Record<string, unknown>): void {
  if (!isBrowser()) return;
  if (email) setTrackedEmail(email);
  const a = attribution();
  const rec = {
    type: "cx",
    app: "landing",
    w: WRITE_TOKEN,
    event,
    eid: makeId("e"),
    ts: new Date().toISOString(),
    vid: vid(),
    sid: sid(),
    email: lsGet(EMAIL_KEY) || "",
    ...a,
    page: (window.location.pathname + window.location.search).slice(0, 300),
    host: window.location.hostname,
    device: deviceType(),
    tz: visitorZone(),
    lang: visitorLang(),
    meta: meta && Object.keys(meta).length ? meta : undefined,
  };
  const payload = JSON.stringify(rec);
  try {
    if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain;charset=UTF-8" }))) return;
    void fetch(ENDPOINT, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" }, body: payload });
  } catch {
    /* best-effort */
  }
}

/**
 * Query params to append to any editor (constructa.atumx.in) URL so the
 * workshop session joins this visitor: same vid + the stored attribution.
 */
export function editorHandoffParams(): URLSearchParams {
  const out = new URLSearchParams();
  if (!isBrowser()) return out;
  const a = attribution();
  out.set("cx_vid", vid());
  if (a.source && a.source !== "(direct)") {
    for (const k of UTM) if (a[k]) out.set("utm_" + k, a[k]);
    if (a.ref) out.set("ref", a.ref);
    if (a.referrer) out.set("cx_ref", a.referrer);
  }
  return out;
}

/** Append the hand-off params to an editor URL (keeps any #fragment at the end). */
export function withEditorHandoff(url: string): string {
  const [base, hash] = url.split("#");
  const qs = editorHandoffParams().toString();
  if (!qs) return url;
  return base + (base.includes("?") ? "&" : "?") + qs + (hash !== undefined ? "#" + hash : "");
}

/** Resolve attribution and record one landing view per tab-session. Call on client mount. */
export function initLandingTracker(): void {
  if (!isBrowser()) return;
  (window as unknown as { ctrack?: typeof ctrack }).ctrack = ctrack;
  attribution();
  if (ssGet(VIEW_KEY)) return;
  ssSet(VIEW_KEY, "1");
  ctrack("landing_view", undefined, { referrer: (document.referrer || "").slice(0, 200) || undefined });
}

/** Attribution to store on the Supabase account at sign-up. */
export function signupAttribution(): Record<string, string> {
  if (!isBrowser()) return {};
  const a = attribution();
  return {
    signup_source: a.source, signup_medium: a.medium, signup_campaign: a.campaign,
    signup_content: a.content, signup_ref: a.ref, signup_vid: vid(),
  };
}
