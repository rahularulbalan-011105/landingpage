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
          Check your email for your <span className="font-bold text-primary">workshop key</span>.
          When it lands, open the link on a <span className="font-bold">computer</span> — Constructa
          needs a big screen to build big robots. 🖥️
        </p>
      </div>
    );
  }

  const align = variant === "cta" ? "items-center" : "items-start";

  return (
    <div className={`w-full flex flex-col ${align}`}>
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
        {isMobile
          ? "🖥️ On your phone? Drop your email — we'll send a link to open Constructa on a computer."
          : "Free during beta · No spam · No downloads"}
      </p>

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
