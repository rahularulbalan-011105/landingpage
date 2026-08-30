import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthResult = { error: string | null };
type SignUpResult = AuthResult & { needsConfirmation?: boolean };

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Turn raw Supabase auth errors into copy a builder (often a kid or parent) can act on. */
function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
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
    });

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!active) return;
        setSession(data.session);
        setUser(data.session?.user ?? null);
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
              data: { full_name: name.trim() },
              emailRedirectTo:
                typeof window !== "undefined" ? `${window.location.origin}/dashboard` : undefined,
            },
          });
          if (error) return { error: friendlyAuthError(error.message) };
          // If email confirmation is ON, Supabase returns a user but no session.
          return { error: null, needsConfirmation: !data.session };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async signIn(email, password) {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          return { error: error ? friendlyAuthError(error.message) : null };
        } catch (e: any) {
          return { error: friendlyAuthError(e?.message ?? "") };
        }
      },
      async signOut() {
        await supabase.auth.signOut();
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
