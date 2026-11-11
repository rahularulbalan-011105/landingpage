import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { MailCheck } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loaders";
import { Field } from "./signup";
import { useAuth } from "@/lib/auth";

/**
 * Step 1 of a password reset: ask for the email and have Supabase send a reset
 * email (link + 6-digit code) through our Gmail SMTP. The confirmation is the
 * same whether or not an account exists, so this page can't be used to find out
 * which emails are registered.
 */
export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset your password | Constructa" }] }),
  validateSearch: (search: Record<string, unknown>): { email?: string } => ({
    email: typeof search.email === "string" ? search.email : undefined,
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const { email: prefill } = Route.useSearch();

  const [email, setEmail] = useState(prefill ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return setError("Enter a valid email address.");

    setSubmitting(true);
    setError(null);
    const { error } = await requestPasswordReset(email);
    setSubmitting(false);
    if (error) return setError(error);
    setSent(true);
  }

  if (sent) {
    return (
      <AuthShell
        title="Check your email"
        footer={
          <Link to="/login" className="font-bold text-primary hover:underline">
            Back to log in
          </Link>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-md border-2 border-primary/30 bg-primary/5 px-3 py-3 text-sm text-foreground">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <p>
              If an account exists for <b className="break-all">{email.trim()}</b>, we've sent it a link and a
              6-digit code to reset your password. They work for 1 hour.
            </p>
          </div>

          <Link
            to="/reset-password"
            search={{ email: email.trim() }}
            className="comic-btn inline-flex items-center justify-center bg-primary px-5 py-3 text-sm font-bold text-white"
          >
            I have a code
          </Link>

          <p className="text-xs text-text-secondary">
            Nothing arrived? Check your spam folder, make sure the email is spelled right, and wait a minute
            before{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              className="font-bold text-primary hover:underline"
            >
              trying again
            </button>
            .
          </p>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you signed up with. We'll send you a link and a code to set a new one."
      footer={
        <>
          Remembered it?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            autoFocus
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
              <Spinner className="h-4 w-4 border-white/40 border-t-white" /> Sending…
            </>
          ) : (
            "Send reset email"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
