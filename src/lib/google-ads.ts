/**
 * Google Ads tag (gtag.js) — landing-site side.
 * ----------------------------------------------------------------------------
 * Sends conversions TO Google Ads so it can optimise bidding for sign-ups. It
 * does not read anything back: spend / clicks / impressions reach our ads
 * dashboard through a Google Ads Script (see Imaginarium docs/ADS-SETUP.md).
 *
 * Loaded on the client after mount (SSR-safe, no hydration mismatch). Google
 * prefers the tag in <head>, but injecting it on mount works the same for
 * conversion measurement and keeps it out of the server render.
 */

const ADS_ID = "AW-18546217723";

// "Send to" of the Sign-up conversion action: Google Ads → Goals → Conversions →
// the action → Tag setup → "Install the tag yourself" → the
// `send_to: 'AW-…/LABEL'` value. Until it is filled in, no conversion is sent.
const SIGNUP_SEND_TO = "AW-18546217723/PtWcCJCgrbEdEPulw4tF";

type Gtag = (...args: unknown[]) => void;
type GtagWindow = Window & { dataLayer?: unknown[]; gtag?: Gtag };

const isBrowser = () => typeof window !== "undefined";

/** Load gtag.js once and configure the Ads account. Call on client mount. */
export function initGoogleAds(): void {
  if (!isBrowser()) return;
  const w = window as GtagWindow;
  if (w.gtag) return;
  w.dataLayer = w.dataLayer || [];
  // gtag must push the `arguments` object itself, not an array copy.
  w.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    w.dataLayer!.push(arguments);
  };
  w.gtag("js", new Date());
  w.gtag("config", ADS_ID);
  const s = document.createElement("script");
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`;
  document.head.appendChild(s);
}

/** Report a new account to Google Ads as a Sign-up conversion. */
export function reportSignupConversion(): void {
  if (!isBrowser() || !SIGNUP_SEND_TO) return;
  (window as GtagWindow).gtag?.("event", "conversion", { send_to: SIGNUP_SEND_TO });
}
