import { useState } from "react";
import { Spinner } from "@/components/ui/loaders";
import { useAuth } from "@/lib/auth";

/**
 * Google sign-in is switched on per environment: always in local dev, and in
 * production only when VITE_ENABLE_GOOGLE_SIGNIN=true is set (Vercel → Settings →
 * Environment Variables, then redeploy). Keep it off until the Google Auth
 * Platform app is published — while it is in "Testing", only listed test users
 * can sign in and everyone else gets a Google error.
 */
export const GOOGLE_SIGNIN_ENABLED =
  import.meta.env.DEV || import.meta.env.VITE_ENABLE_GOOGLE_SIGNIN === "true";

/** "Continue with Google" + an "or" divider, for the top of the login / sign-up forms. */
export function GoogleSignIn({ redirectPath, disabled }: { redirectPath: string; disabled?: boolean }) {
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!GOOGLE_SIGNIN_ENABLED) return null;

  async function go() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const { error } = await signInWithGoogle(redirectPath);
    // On success the page is already leaving for Google, so stay "busy".
    if (error) {
      setBusy(false);
      setError(error);
    }
  }

  return (
    <div className="mb-5 flex flex-col gap-4">
      <button
        type="button"
        onClick={go}
        disabled={busy || disabled}
        className="comic-btn inline-flex items-center justify-center gap-3 bg-background px-5 py-3 text-sm font-bold text-foreground disabled:cursor-not-allowed"
      >
        {busy ? <Spinner className="h-4 w-4" /> : <GoogleG />}
        {busy ? "Opening Google…" : "Continue with Google"}
      </button>

      {error && (
        <p className="rounded-md border-2 border-destructive/40 bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.14em] text-text-tertiary">
        <span className="h-px flex-1 bg-border" />
        or with email
        <span className="h-px flex-1 bg-border" />
      </div>
    </div>
  );
}

/** Google's standard multicolour "G" mark. */
function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}
