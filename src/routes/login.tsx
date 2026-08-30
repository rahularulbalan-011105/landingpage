import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/loaders";
import { Field, PasswordInput } from "./signup";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Log in | Constructa" }] }),
  validateSearch: (search: Record<string, unknown>): { redirect?: string } => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dest = redirect && redirect.startsWith("/") ? redirect : "/dashboard";

  useEffect(() => {
    if (!loading && user) navigate({ to: dest, replace: true });
  }, [loading, user, navigate, dest]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!email || !password) return setError("Enter your email and password.");

    setSubmitting(true);
    setError(null);
    const { error } = await signIn(email, password);
    setSubmitting(false);
    if (error) return setError(error);
    navigate({ to: dest, replace: true });
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to open your workshop and pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link to="/signup" className="font-bold text-primary hover:underline">
            Create an account
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
            disabled={submitting}
          />
        </Field>

        <Field label="Password" htmlFor="password">
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            show={showPw}
            onToggle={() => setShowPw((s) => !s)}
            autoComplete="current-password"
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
              <Spinner className="h-4 w-4 border-white/40 border-t-white" /> Logging in…
            </>
          ) : (
            "Log in"
          )}
        </button>
      </form>
    </AuthShell>
  );
}
