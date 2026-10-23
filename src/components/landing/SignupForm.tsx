import { useEffect, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { submitBetaSignup, betaSignupSchema } from "@/lib/beta-signup";
import { ctrack } from "@/lib/landing-tracker";
import { ArrowRight, Check, Monitor } from "lucide-react";
import { useT } from "@/i18n";

// Shared field style: hairline box that darkens on focus.
const FIELD =
  "w-full h-12 rounded-[12px] border border-wb-line bg-white px-4 text-[15px] text-wb-ink placeholder:text-wb-ink-3 transition-colors focus:border-wb-ink focus:outline-none";

type Props = {
  variant?: "hero" | "cta";
  expandable?: boolean;
};

// Submitted as-is so sign-up data stays in English; the dropdown shows translated labels.
const USER_TYPES = [
  "Student",
  "Teacher or educator",
  "Parent",
  "Maker or hobbyist",
  "Distributor or reseller",
  "Other",
];

// Direct link into the editor — ?app=1 tells the app to skip the landing gate
// (and is remembered), so this button drops the user straight into Constructa.
const APP_URL = "https://constructa.atumx.in/?app=1";

// Map a referrer host to a source name (same buckets the app uses), so a visit
// with no utm_source still gets attributed to the site that sent it.
function inferSource(ref: string): string | null {
  try {
    if (!ref) return null;
    const h = new URL(ref).hostname.toLowerCase();
    if (h.includes("constructa") || h.includes("atumx")) return null; // our own domains
    if (h.includes("instagram")) return "instagram";
    if (h.includes("youtube") || h.includes("youtu.be")) return "youtube";
    if (h.includes("discord")) return "discord";
    if (h.includes("whatsapp") || h.includes("wa.me")) return "whatsapp";   // older links still circulating
    if (h.includes("facebook") || h.startsWith("fb.") || h.includes("fb.me")) return "facebook";
    if (h.includes("linkedin")) return "linkedin";
    if (h.includes("twitter") || h.includes("x.com") || h === "t.co") return "twitter";
    if (h.includes("reddit")) return "reddit";
    if (h.includes("google")) return "google";
    if (h.includes("t.me") || h.includes("telegram")) return "telegram";
    return h;
  } catch {
    return null;
  }
}

// Preserve attribution for EVERY source: forward the UTM/ref params that brought
// the user to the landing on to the app. If there's no utm_source (e.g. a plain
// link shared on YouTube/Email), infer it from the referrer — otherwise the app
// would log it as "landing page" via the landing-page referrer.
function appUrlWithUtm(): string {
  if (typeof window === "undefined") return APP_URL;
  try {
    const p = new URLSearchParams(window.location.search);
    const out = new URLSearchParams();
    for (const k of ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"]) {
      const v = p.get(k);
      if (v) out.set(k, v);
    }
    if (!out.get("utm_source")) {
      const inferred = inferSource(document.referrer);
      if (inferred) {
        out.set("utm_source", inferred);
        if (!out.get("utm_medium")) out.set("utm_medium", "referral");
      }
    }
    const fwd = out.toString();
    return fwd ? `${APP_URL}&${fwd}` : APP_URL;
  } catch {
    return APP_URL;
  }
}
const DISCORD = "https://discord.gg/QzEJ4Vrgn";

function DiscordLink() {
  const s = useT().signup;
  return (
    <a
      href={DISCORD}
      onClick={() => ctrack("whatsapp_click")}   // historical name = "community link clicked"
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 inline-flex items-center gap-2 text-[14px] font-semibold text-wb-ink-2 underline-offset-4 transition-colors hover:text-wb-ink hover:underline"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="#5865F2" aria-hidden="true">
        <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
      </svg>
      {s.discord}
    </a>
  );
}

// Primary CTA: the same orange tile as the editor's Save button, straight into the workshop.
function LaunchButton({ centered }: { centered?: boolean }) {
  const s = useT().signup;
  return (
    <div className={`flex flex-col w-full max-w-[560px] ${centered ? "items-center" : "items-start"}`}>
      <Link
        to="/signup"
        onClick={() => ctrack("cta_click", undefined, { where: "launch" })}
        className="wb-btn wb-btn-primary group h-14 px-7 text-[17px]"
      >
        {s.tryFree}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden />
      </Link>
      <span className="mt-3 text-[13px] text-wb-ink-3">{s.tryMeta}</span>
      <span className={`mt-2 inline-flex items-center gap-1.5 text-[12.5px] text-wb-ink-3 ${centered ? "text-center" : ""}`}>
        <Monitor className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
        {s.bigScreen}
      </span>
    </div>
  );
}

export function SignupForm({ variant = "hero", expandable = true }: Props) {
  const s = useT().signup;
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState("");
  const [robotIdea, setRobotIdea] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Frontend-only: Constructa needs a big screen, so we tailor the copy for
  // phone visitors (we email them a link to open it on a computer).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 820px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    ctrack("cta_click", undefined, { where: "hero" }); // user attempted the beta signup

    const parsed = betaSignupSchema.safeParse({
      email,
      user_type: userType || undefined,
      robot_idea: robotIdea || undefined,
    });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? s.checkForm);
      return;
    }

    setStatus("loading");
    try {
      await submitBetaSignup(parsed.data);
      ctrack("updates_signup", parsed.data.email); // joined the updates list
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg(s.error);
    }
  }

  if (status === "success") {
    return (
      <div
        className={[
          "w-full max-w-[560px] rounded-[16px] border border-wb-line bg-wb-bench p-6 sm:p-7",
          variant === "cta" ? "mx-auto text-center" : "text-left",
        ].join(" ")}
      >
        <div className={`flex items-center gap-3 ${variant === "cta" ? "justify-center" : ""}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-wb-axis text-white">
            <Check className="h-4.5 w-4.5" strokeWidth={3} aria-hidden />
          </span>
          <h3 className="font-brand text-[26px] font-bold text-wb-ink" style={{ letterSpacing: "-0.04em" }}>
            {s.youreIn}
          </h3>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-wb-ink-2">
          {s.successBefore}
          <span className="font-semibold text-wb-ink">{s.successComputer}</span>
          {s.successAfter}
        </p>
        <div className={`mt-5 flex flex-col gap-1 ${variant === "cta" ? "items-center" : "items-start"}`}>
          <LaunchButton centered={variant === "cta"} />
          <DiscordLink />
        </div>
      </div>
    );
  }

  const align = variant === "cta" ? "items-center" : "items-start";

  return (
    <div className={`w-full flex flex-col ${align}`}>
      {/* Creative, one-of-a-kind CTA → straight into the workshop */}
      <LaunchButton centered={variant === "cta"} />

      <div className={`my-5 flex items-center gap-3 w-full max-w-[560px] ${variant === "cta" ? "mx-auto" : ""}`}>
        <span className="h-px flex-1 bg-wb-line" />
        <span className="font-key text-[11px] uppercase tracking-[0.12em] text-wb-ink-3">{s.orUpdates}</span>
        <span className="h-px flex-1 bg-wb-line" />
      </div>

      {/* The imagination hook */}
      <label
        htmlFor="robot-idea"
        className={`mb-2 w-full max-w-[560px] text-[14px] font-semibold text-wb-ink ${variant === "cta" ? "text-center" : "text-left"}`}
      >
        {s.robotQuestion}
      </label>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-[560px] flex flex-col gap-2.5"
      >
        {/* Robot idea — the hook, shown up front */}
        <input
          id="robot-idea"
          type="text"
          placeholder={s.robotPlaceholder}
          value={robotIdea}
          onChange={(e) => setRobotIdea(e.target.value)}
          maxLength={2000}
          className={FIELD}
        />

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            required
            aria-label={s.email}
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`${FIELD} flex-1 text-[16px]`}
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="wb-btn h-12 whitespace-nowrap bg-wb-ink px-6 text-[15px] text-white hover:bg-[#232B27] disabled:opacity-60"
          >
            {status === "loading" ? s.sending : s.submit}
          </button>
        </div>
      </form>

      {errorMsg && (
        <p role="alert" className="mt-3 text-[13px] font-semibold text-[#C2362F]">{errorMsg}</p>
      )}

      <p className={`mt-3 max-w-[560px] text-[13px] leading-relaxed text-wb-ink-3 ${variant === "cta" ? "text-center" : ""}`}>
        {s.note} {isMobile ? s.notePhone : s.noteDesktop}
      </p>

      {/* Discord community */}
      <DiscordLink />

      {expandable && (
        <div className={`w-full max-w-[560px] mt-3 ${variant === "cta" ? "text-center" : ""}`}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="text-[14px] font-semibold text-wb-ink-2 underline underline-offset-4 transition-colors duration-200 ease-out-soft hover:text-wb-ink"
          >
            {expanded ? s.hide : s.tellUs}
          </button>

          <div
            className="grid transition-all duration-300 ease-out-soft"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <div className="pt-5 text-left">
                <label htmlFor="user-type" className="mb-2 block text-[13px] font-semibold text-wb-ink">
                  {s.iAm}
                </label>
                <select
                  id="user-type"
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className={FIELD}
                >
                  <option value="">{s.selectOne}</option>
                  {USER_TYPES.map((t, i) => (
                    <option key={t} value={t}>
                      {s.userTypes[i] ?? t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
