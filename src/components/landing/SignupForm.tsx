import { useEffect, useState, type FormEvent } from "react";
import { submitBetaSignup, betaSignupSchema } from "@/lib/beta-signup";
import { ctrack } from "@/lib/landing-tracker";
import { Mascot } from "./Mascot";

type Props = {
  variant?: "hero" | "cta";
  expandable?: boolean;
};

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
const WHATSAPP = "https://chat.whatsapp.com/Kxikh3QnPIaHW92hssMTRK?s=cl&p=a&ilr=1&amv=0";

function WhatsAppLink() {
  return (
    <a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-3 inline-flex items-center gap-2 text-[14px] font-bold text-[#128C7E] hover:underline"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
      </svg>
      Join the WhatsApp community
    </a>
  );
}

// The creative, one-of-a-kind CTA — an arcade "LAUNCH" button whose rocket
// blasts off on hover — that drops the user straight into the workshop.
function LaunchButton({ centered }: { centered?: boolean }) {
  return (
    <div className={`w-full max-w-[560px] ${centered ? "flex flex-col items-center" : ""}`}>
      <a
        href={APP_URL}
        className="comic-btn group relative inline-flex items-center justify-center gap-2.5 bg-[#FFD34E] text-ink text-[17px] font-extrabold h-14 px-7 overflow-hidden"
      >
        <span
          className="text-2xl transition-transform duration-300 ease-out-soft group-hover:-translate-y-6 group-hover:translate-x-6 group-hover:rotate-12"
          aria-hidden="true"
        >
          🚀
        </span>
        Launch the workshop
        <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">→</span>
      </a>
      <span className="mt-2 text-[12px] font-bold uppercase tracking-wide text-text-tertiary">
        Free · No login · Opens in your browser
      </span>
    </div>
  );
}

export function SignupForm({ variant = "hero", expandable = true }: Props) {
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
    ctrack("early_access_click"); // user attempted the beta signup

    const parsed = betaSignupSchema.safeParse({
      email,
      user_type: userType || undefined,
      robot_idea: robotIdea || undefined,
    });
    if (!parsed.success) {
      setErrorMsg(parsed.error.issues[0]?.message ?? "Check the form");
      return;
    }

    setStatus("loading");
    try {
      await submitBetaSignup(parsed.data);
      ctrack("email_submitted", parsed.data.email); // successful signup
      setStatus("success");
    } catch (err) {
      console.error(err);
      setStatus("error");
      setErrorMsg("Something went wrong. Try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className={[
          "comic-outline bg-white p-6 sm:p-7 w-full max-w-[560px]",
          variant === "cta" ? "mx-auto text-center" : "text-left",
        ].join(" ")}
      >
        <div className={`flex items-center gap-3 ${variant === "cta" ? "justify-center" : ""}`}>
          <Mascot size={54} mood="wow" className="animate-bob shrink-0" />
          <h3 className="font-display text-[30px] font-extrabold text-foreground tracking-tight">
            You're in! 🎉
          </h3>
        </div>
        <p className="mt-3 text-[15px] text-text-secondary leading-relaxed font-medium">
          We'll email you every Constructa update from here. Want to dive in right now?
          Jump into the workshop on a <span className="font-bold">computer</span> — Constructa
          needs a big screen to build big robots. 🖥️
        </p>
        <div className={`mt-5 flex flex-col gap-1 ${variant === "cta" ? "items-center" : "items-start"}`}>
          <LaunchButton centered={variant === "cta"} />
          <WhatsAppLink />
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
        <span className="h-px flex-1 bg-ink/15" />
        <span className="text-[12px] font-bold uppercase tracking-wide text-text-tertiary">or get updates</span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>

      {/* Mascot speech bubble — the imagination hook */}
      <div className={`mb-3 flex items-end gap-2 ${variant === "cta" ? "justify-center" : ""}`}>
        <Mascot size={40} mood="happy" className="shrink-0" />
        <span className="comic-outline-sm bg-[#FFD34E] px-3 py-1.5 text-[13px] font-bold text-ink">
          Psst… what robot would <span className="text-primary">you</span> build?
        </span>
      </div>

      <form
        onSubmit={onSubmit}
        className="w-full max-w-[560px] flex flex-col gap-2.5"
      >
        {/* Robot idea — the hook, shown up front */}
        <input
          type="text"
          placeholder="A six-legged crawler that climbs stairs…"
          value={robotIdea}
          onChange={(e) => setRobotIdea(e.target.value)}
          maxLength={2000}
          className="comic-outline-sm w-full h-12 bg-white px-4 text-[15px] font-medium text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-primary"
        />

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="comic-outline-sm flex-1 h-12 bg-white px-4 text-[16px] font-medium text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="comic-btn h-12 bg-primary text-white text-[15px] font-bold px-6 whitespace-nowrap"
          >
            {status === "loading" ? "Opening…" : "Get my key 🔑"}
          </button>
        </div>
      </form>

      {errorMsg && (
        <p className="mt-3 text-[13px] font-semibold text-primary">{errorMsg}</p>
      )}

      <p className="mt-3 text-[13px] font-semibold text-text-tertiary">
        📬 All updates about Constructa — new features, releases &amp; tips — are sent
        straight to this email.{isMobile ? " (On a phone? We'll email a link to open it on a computer.)" : " No spam."}
      </p>

      {/* WhatsApp community */}
      <WhatsAppLink />

      {expandable && (
        <div className={`w-full max-w-[560px] mt-3 ${variant === "cta" ? "text-center" : ""}`}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[14px] font-semibold text-text-secondary hover:text-primary underline underline-offset-4 transition-colors duration-200 ease-out-soft"
          >
            {expanded ? "Hide ←" : "Tell us who you are →"}
          </button>

          <div
            className="grid transition-all duration-300 ease-out-soft"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <div className="pt-5 text-left">
                <label className="block text-[13px] font-bold text-ink mb-2">
                  I am a…
                </label>
                <select
                  value={userType}
                  onChange={(e) => setUserType(e.target.value)}
                  className="comic-outline-sm w-full h-12 bg-white px-4 text-[15px] font-medium text-foreground focus:outline-none focus:border-primary"
                >
                  <option value="">Select one</option>
                  {USER_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
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
