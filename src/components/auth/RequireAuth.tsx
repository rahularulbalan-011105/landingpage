import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { FullPageLoader } from "@/components/ui/loaders";

/**
 * Client-side route guard. SSR renders without a session, so we wait for the
 * client auth check to resolve, then bounce unauthenticated users to /login.
 * RLS is the real security boundary — this is UX, not the lock on the data.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      const redirect = typeof window !== "undefined" ? window.location.pathname : "/dashboard";
      navigate({ to: "/login", search: { redirect }, replace: true });
    }
  }, [loading, user, navigate]);

  if (loading) return <FullPageLoader label="Loading your workshop…" />;
  if (!user) return <FullPageLoader label="Redirecting…" />;
  return <>{children}</>;
}
