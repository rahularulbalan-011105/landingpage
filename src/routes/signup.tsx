import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/loaders";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create your account | Constructa" }] }),
  component: SignupPage,
});

function SignupPage() {
  const { signUp, user, loading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Already signed in → straight to the dashboard.
  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  function validate(): string | null {
    if (!name.trim()) return "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address.";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (password !== confirm) return "Passwords don't match.";
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v = validate();
    if (v) return setError(v);

    setSubmitting(true);
    setError(null);
    const { error, needsConfirmation } = await signUp(name, email, password);
    setSubmitting(false);

    if (error) return setError(error);
    if (needsConfirmation) return setDone(true);
    navigate({ to: "/dashboard", replace: true });
  }

  if (done) {
    return (
      <AuthShell title="Check your inbox" subtitle="One quick step to finish.">
        <div className="flex flex-col items-center gap-3 py-2 text-center">
          <CheckCircle2 className="h-12 w-12 text-primary" />
          <p className="text-sm text-text-secondary">
            We sent a confirmation link to <span className="font-bold text-foreground">{email}</span>.
            Click it, then come back and log in.
          </p>
          <Link
            to="/login"
            className="comic-btn mt-2 inline-flex items-center justify-center bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Go to login
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Start building"
      subtitle="Create a free account to save, share, and pick up your robots anywhere."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Name" htmlFor="name">
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ada Lovelace"
            autoComplete="name"
            disabled={submitting}
          />
        </Field>

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
            autoComplete="new-password"
            disabled={submitting}
          />
        </Field>

        <Field label="Confirm password" htmlFor="confirm">
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
              <Spinner className="h-4 w-4 border-white/40 border-t-white" /> Creating…
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>
    </AuthShell>
  );
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-bold text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function PasswordInput({
  id,
  value,
  onChange,
  show,
  onToggle,
  autoComplete,
  disabled,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggle: () => void;
  autoComplete?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="••••••••"
        autoComplete={autoComplete}
        disabled={disabled}
        className="pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-foreground"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
