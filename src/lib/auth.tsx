import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ctrack, setTrackedEmail, signupAttribution } from "@/lib/landing-tracker";
import { reportSignupConversion } from "@/lib/google-ads";

type AuthResult = { error: string | null };
type SignUpResult = AuthResult & { needsConfirmation?: boolean };

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  /** Leave for Google's sign-in page; Supabase brings the user back to `redirectPath` signed in. */
  signInWithGoogle: (redirectPath: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Email a reset link + code. Succeeds for unknown emails too (no account enumeration). */
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  /** Prove the reset is genuine — by the link's token, or by email + the code from the email. Signs the user in. */
  verifyPasswordReset: (proof: { tokenHash: string } | { email: string; code: string }) => Promise<AuthResult>;
  /** Set a new password for the signed-in user (after verifyPasswordReset). */
  updatePassword: (password: string) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turn raw Supabase auth errors into copy a builder (often a kid or parent) can act on. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("expired") || m.includes("otp_") || m.includes("token has"))
    return "This reset link or code has expired or was already used. Ask for a new email below.";
  if (m.includes("should be different"))
    return "Your new password must be different from your old one.";
  if (m.includes("security purposes"))
    return "Please wait a minute before asking for another email.";
  if (m.includes("invalid login")) return "That email and password don't match. Try again.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "An account with this email already exists. Try logging in instead.";
  if (m.includes("password should be")) return "Password must be at least 6 characters.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "That email address doesn't look right.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first — check your inbox for the link.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Wait a moment and try again.";
  if (m.includes("network") || m.includes("fetch"))
    return "Can't reach the server. Check your connection and try again.";
  return message || "Something went wrong. Please try again.";
}

/**
 * Google sign-in leaves the site and comes back, so it can't count the sign-up
 * inline the way signUp() does. Before leaving we drop a marker in this tab's
 * sessionStorage; when the tab returns signed in, this fires the same analytics
 * + Google Ads conversion as an email sign-up (or a login, for an existing
 * account) and stores the visit's UTM attribution on a brand-new account.
 */
const OAUTH_PENDING_KEY = "constructa:oauth-pending";
const NEW_ACCOUNT_WINDOW_MS = 10 * 60_000;

function finishOAuthReturn(u: User | null) {
  if (typeof window === "undefined") return;
  let pending: string | null = null;
  try {
    pending = sessionStorage.getItem(OAUTH_PENDING_KEY);
    if (pending) sessionStorage.removeItem(OAUTH_PENDING_KEY);
  } catch {
    return;
  }
  if (!pending || !u) return; // nothing pending, or they backed out at Google
  const email = u.email ?? undefined;
  const isNew = Date.now() - new Date(u.created_at).getTime() < NEW_ACCOUNT_WINDOW_MS;
  if (isNew) {
    ctrack("signup", email, { confirmed: true, provider: pending });
    reportSignupConversion();
    const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
    if (!meta.signup_source) {
      void supabase.auth.updateUser({ data: signupAttribution() }).catch(() => {
        /* attribution is best-effort */
      });
    }
  } else {
    ctrack("login", email, { provider: pending });
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    // Register the listener BEFORE the initial getSession so we never miss an
    // auth event that fires during startup.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!active) return;
      setSession(s);
      setUser(s?.user ?? null);
      setTrackedEmail(s?.user?.email);
      // Deferred: Supabase must not be called from inside this callback.
      if (s?.user) setTimeout(() => finishOAuthReturn(s.user), 0);
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setTrackedEmail(data.session?.user?.email);
        finishOAuthReturn(data.session?.user ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      loading,
      async signUp(name, email, password) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: name.trim(), ...signupAttribution() },
              emailRedirectTo:
                typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
            },
          });
          if (error) return { error: friendlyAuthError(error.message) };
          // An existing email comes back "successful" with no identities (Supabase hides
          // account enumeration) — only count genuinely new accounts as sign-ups.
          const isNew = !data.user || (data.user.identities?.length ?? 1) > 0;
          if (isNew) {
            ctrack("signup", email, { confirmed: !!data.session });
            reportSignupConversion();
          }
          // If email confirmation is ON, Supabase returns a user but no session.
          return { error: null, needsConfirmation: !data.session };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async signIn(email, password) {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error) ctrack("login", email);
          return { error: error ? friendlyAuthError(error.message) : null };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async signInWithGoogle(redirectPath) {
        try {
          try {
            sessionStorage.setItem(OAUTH_PENDING_KEY, "google");
          } catch {
            /* no tracking marker in private mode — sign-in still works */
          }
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              // Must match the Redirect URLs allow-list (https://constructa-page.atumx.in/**).
              redirectTo: `${window.location.origin}${redirectPath.startsWith("/") ? redirectPath : "/dashboard"}`,
              // Always show Google's account picker, so a shared/school computer
              // doesn't silently sign in as whoever used it last.
              queryParams: { prompt: "select_account" },
            },
          });
          if (error) {
            try {
              sessionStorage.removeItem(OAUTH_PENDING_KEY);
            } catch {
              /* ignore */
            }
            return { error: friendlyAuthError(error.message) };
          }
          return { error: null }; // the browser is on its way to Google
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async signOut() {
        await supabase.auth.signOut();
      },
      async requestPasswordReset(email) {
        try {
          // The email template links straight to /reset-password with a token hash
          // (see supabase/email-templates/reset-password.html); redirectTo is the
          // fallback for Supabase's default template.
          const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo:
              typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined,
          });
          return { error: error ? friendlyAuthError(error.message) : null };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async verifyPasswordReset(proof) {
        try {
          const { error } =
            "tokenHash" in proof
              ? await supabase.auth.verifyOtp({ token_hash: proof.tokenHash, type: "recovery" })
              : await supabase.auth.verifyOtp({
                  email: proof.email.trim(),
                  token: proof.code.trim(),
                  type: "recovery",
                });
          return { error: error ? friendlyAuthError(error.message) : null };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async updatePassword(password) {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          return { error: error ? friendlyAuthError(error.message) : null };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
    }),
    [user, session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

/** Display name for the header/avatar, with graceful fallbacks. */
export function displayName(user: User | null): string {
  if (!user) return "Builder";
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const name = (meta.full_name || meta.name) as string | undefined;
  if (name && name.trim()) return name.trim();
  return user.email?.split("@")[0] ?? "Builder";
}

export function initials(user: User | null): string {
  const n = displayName(user);
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return n.slice(0, 2).toUpperCase();
}
