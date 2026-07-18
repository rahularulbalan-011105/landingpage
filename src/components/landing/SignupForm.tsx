import { useState, type FormEvent } from "react";
import { submitBetaSignup, betaSignupSchema } from "@/lib/beta-signup";
import { ctrack } from "@/lib/landing-tracker";

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
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    ctrack("early_access_click");   // user attempted the beta signup

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
      ctrack("email_submitted", parsed.data.email);   // successful signup
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
          "w-full",
          variant === "cta" ? "text-center" : "text-left",
        ].join(" ")}
      >
        <h3 className="text-[32px] font-medium text-foreground tracking-tight">
          You're in.
        </h3>
        <p className="mt-3 text-[16px] text-text-secondary leading-relaxed max-w-md mx-auto">
          We'll send your access link within 7 days. Check your email.
        </p>
      </div>
    );
  }

  const align = variant === "cta" ? "items-center" : "items-start";

  return (
    <div className={`w-full flex flex-col ${align}`}>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-[560px] flex flex-col sm:flex-row gap-2 sm:gap-0"
      >
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 sm:w-[320px] h-12 bg-surface-1 border border-border rounded-md sm:rounded-r-none px-4 text-[16px] text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-[#FF6B35] transition-colors duration-200 ease-out-soft"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="h-12 bg-[#FF6B35] text-[#0A0A0A] text-[15px] font-medium px-6 rounded-md sm:rounded-l-none hover:brightness-110 transition-all duration-200 ease-out-soft disabled:opacity-60"
        >
          {status === "loading" ? "Sending…" : "Get early access"}
        </button>
      </form>

      {errorMsg && (
        <p className="mt-3 text-[13px] text-[#FF6B35]">{errorMsg}</p>
      )}

      <p className="mt-4 text-[13px] text-text-tertiary">
        Free during beta · No spam · No downloads
      </p>

      {expandable && (
        <div className={`w-full max-w-[560px] mt-4 ${variant === "cta" ? "text-center" : ""}`}>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[14px] text-text-secondary hover:text-foreground hover:underline underline-offset-4 transition-colors duration-200 ease-out-soft"
          >
            {expanded ? "Hide details ←" : "Tell us about yourself →"}
          </button>

          <div
            className="grid transition-all duration-300 ease-out-soft"
            style={{
              gridTemplateRows: expanded ? "1fr" : "0fr",
            }}
          >
            <div className="overflow-hidden">
              <div className="pt-6 space-y-4 text-left">
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.1em] text-text-tertiary font-mono mb-2">
                    I am a…
                  </label>
                  <select
                    value={userType}
                    onChange={(e) => setUserType(e.target.value)}
                    className="w-full h-12 bg-surface-1 border border-border rounded-md px-4 text-[15px] text-foreground focus:outline-none focus:border-[#FF6B35] transition-colors duration-200 ease-out-soft"
                  >
                    <option value="">Select one</option>
                    {USER_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] uppercase tracking-[0.1em] text-text-tertiary font-mono mb-2">
                    Describe a robot you want to build (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={robotIdea}
                    onChange={(e) => setRobotIdea(e.target.value)}
                    placeholder="A six-legged crawler that climbs stairs…"
                    className="w-full bg-surface-1 border border-border rounded-md px-4 py-3 text-[15px] text-foreground placeholder:text-text-tertiary focus:outline-none focus:border-[#FF6B35] transition-colors duration-200 ease-out-soft resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
