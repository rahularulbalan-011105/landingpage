/**
 * AtumX landing-page tracker  →  Google Sheet ("landing" tab)
 * ----------------------------------------------------------------------------
 * Records, to the SAME Apps Script collector the 3D app uses:
 *   • a PAGE VIEW (once per tab-session), with UTM source/campaign/ref
 *   • an EARLY-ACCESS CLICK (the beta form is submitted)
 *   • an EMAIL SUBMIT (a successful beta signup, with the email)
 *
 * View it in the app repo's utm-dashboard2.html.
 *
 * SSR-safe: every function no-ops on the server (guards `typeof window`).
 * Sends are text/plain beacons → no CORS preflight (Apps Script can't answer one).
 */

// Same Apps Script Web-app URL the 3D app / collector uses.
const ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxgWlc_0ZkVdtNGznRm1pCRmKZes18Yrm_XzgDknByKcRfiHxfNh6lfgM0EWIi2SKc0sw/exec";

export type LandingSub = "view" | "early_access_click" | "email_submitted";

function qp(name: string): string {
  try {
    return new URLSearchParams(window.location.search).get(name) || "";
  } catch {
    return "";
  }
}

function deviceType(): string {
  const ua = navigator.userAgent || "";
  if (/Mobi|Android|iPhone|iPod|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

function sid(): string {
  try {
    let s = sessionStorage.getItem("atumx_landing_sid");
    if (!s) {
      s = "ls_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("atumx_landing_sid", s);
    }
    return s;
  } catch {
    return "ls_" + Date.now();
  }
}

/** Fire one tracking ping. Safe to call anywhere; no-ops during SSR. */
export function ctrack(sub: LandingSub, email?: string): void {
  if (typeof window === "undefined") return;
  const rec = {
    type: "landing",
    sub,
    sid: sid(),
    ts: new Date().toISOString(),
    email: email || "",
    source: qp("utm_source") || "(direct)",
    medium: qp("utm_medium") || "(none)",
    campaign: qp("utm_campaign") || "(not set)",
    term: qp("utm_term"),
    content: qp("utm_content"),
    ref: qp("ref"),
    device_type: deviceType(),
    referrer: document.referrer || "",
    url: window.location.pathname + window.location.search,
  };
  const payload = JSON.stringify(rec);
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: "text/plain;charset=UTF-8" }));
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: payload,
      });
    }
  } catch {
    /* best-effort */
  }
}

/** Record a page view once per tab-session. Call from the client after mount. */
export function initLandingTracker(): void {
  if (typeof window === "undefined") return;
  // Expose for quick console verification: `typeof window.ctrack === 'function'`.
  (window as unknown as { ctrack?: typeof ctrack }).ctrack = ctrack;
  try {
    if (sessionStorage.getItem("atumx_landing_view")) return;
    sessionStorage.setItem("atumx_landing_view", "1");
  } catch {
    /* private mode → still fire once below */
  }
  ctrack("view");
}
