import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loaders";
import { Field, PasswordInput } from "./signup";
import { useAuth } from "@/lib/auth";

/**
 * Step 2 of a password reset. Two ways in, one form:
 *
 *  • From the email's link: /reset-password?token_hash=…&type=recovery
 *    The token is only spent when the person SUBMITS a new password — email
 *    scanners (common on school/office mail) open links but never submit forms,
 *    so they can't use the link up before the person sees it.
 *  • With the 6-digit code from the same email (link expired/used, or opened on
 *    another device): email + code + new password.
 *
 * Verifying signs the user in; then the password is updated and they go to the
 * dashboard. The link template lives in supabase/email-templates/reset-password.html.
 */
export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Set a new password | Constructa" }] }),
  validateSearch: (search: Record<string, unknown>): { token_hash?: string; type?: string; email?: string } => ({
    token_hash: typeof search.token_hash === "string" ? search.token_hash : undefined,
    type: typeof search.type === "string" ? search.type : undefined,
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { verifyPasswordReset, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { token_hash, email: prefill } = Route.useSearch();

  // Link mode while we have an unspent token; falls back to code mode if it fails.
  const [useCode, setUseCode] = useState(!token_hash);
  const [email, setEmail] = useState(prefill ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Once verified (the token/code is spent and the user is signed in), a retry —
  // e.g. after "must be different from your old password" — only updates.
  const [verified, setVerified] = useState(false);
  const [done, setDone] = useState(false);

  // Supabase's DEFAULT reset email (if our template isn't installed) links via
  // Supabase, which verifies the token itself and lands here with the session in
  // the URL fragment. The client turns that into a PASSWORD_RECOVERY event — that
  // already proves the reset, so skip straight to choosing the password. An
  // expired/used default link lands with #error_code=… instead.
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (/error_code=|error=/.test(hash)) {
      setUseCode(true);
      setError("This link has expired or was already used. Enter the 6-digit code from the email, or ask for a new email.");
    }
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setVerified(true);
        setUseCode(false);
        setError(null);
      }
    });
    return () => data.subscription.unsubscribe();
  }, []);

  function validate(): string | null {
    if (useCode && !verified) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Enter the email you signed up with.";
      if (!/^\d{6,10}$/.test(code.trim())) return "Enter the code from the email (numbers only).";
    }
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords don't match.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const problem = validate();
    if (problem) return setError(problem);

    setSubmitting(true);
    setError(null);

    if (!verified) {
      const proof = useCode ? { email, code } : { tokenHash: token_hash! };
      const { error } = await verifyPasswordReset(proof);
      if (error) {
        setSubmitting(false);
        // A dead link isn't the end: the same email carries a code.
        if (!useCode) setUseCode(true);
        return setError(
          useCode ? error : "This link has expired or was already used. Enter the 6-digit code from the same email instead, or ask for a new email.",
        );
      }
      setVerified(true);
    }

    const { error } = await updatePassword(password);
    setSubmitting(false);
    if (error) return setError(error);
    setDone(true);
  }

  if (done) {
    return (
      <AuthShell title="Password updated">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border-2 border-primary/30 bg-primary/5 px-3 py-3 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>Your new password is set and you're logged in. Use it next time you log in.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate({ to: "/dashboard", replace: true })}
            className="comic-btn inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-bold text-white"
          >
            Go to my robots
          </button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Set a new password"
      subtitle={
        useCode && !verified
          ? "Enter your email, the 6-digit code we emailed you, and your new password."
          : "Choose a new password for your Constructa account."
      }
      footer={
        <>
          Need a new email?{" "}
          <Link
            to="/forgot-password"
            search={email.trim() ? { email: email.trim() } : {}}
            className="font-bold text-primary hover:underline"
          >
            Send it again
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {useCode && !verified && (
          <>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                disabled={submitting}
              />
            </Field>
            <Field label="Code from the email" htmlFor="code">
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="123456"
                inputMode="numeric"
                autoComplete="one-time-code"
                disabled={submitting}
                className="tracking-[0.3em]"
              />
            </Field>
          </>
        )}

        <Field label="New password" htmlFor="password">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            show={showPw}
            onToggle={() => setShowPw((s) => !s)}
            autoComplete="new-password"
            disabled={submitting}
          />
        </Field>

        <Field label="Confirm new password" htmlFor="confirm">
          <PasswordInput
            id="confirm"
            value={confirm}
            onChange={setConfirm}
            show={showPw}
            onToggle={() => setShowPw((s) => !s)}
            autoComplete="new-password"
            disabled={submitting}
          />
        </Field>

        {error && (
          <p className="rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="comic-btn mt-1 inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed"
        >
          {submitting ? (
            <>
              <Spinner className="h-4 w-4 border-white/40 border-t-white" /> Saving…
            </>
          ) : (
            "Save new password"
          )}
        </button>

        {!useCode && !verified && (
          <button
            type="button"
            onClick={() => setUseCode(true)}
            className="text-xs font-semibold text-text-secondary hover:text-foreground"
          >
            Link not working? Use the 6-digit code instead
          </button>
        )}
      </form>
    </AuthShell>
  );
}
