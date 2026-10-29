import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { initLandingTracker } from "../lib/landing-tracker";
import { LanguageProvider } from "../i18n";
import { AuthProvider } from "../lib/auth";
import { Toaster } from "../components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl font-extrabold text-primary tracking-tight">404</h1>
        <h2 className="mt-4 font-display text-xl font-bold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-text-secondary">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="comic-btn inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

// `error` is `unknown` in the router's ErrorComponentProps — it is whatever was
// thrown, not necessarily an Error. Both console.error and reportLovableError
// take unknown, so nothing here needs it narrowed.
function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-medium tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Something went wrong on our end. Try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="comic-btn inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="comic-btn inline-flex items-center justify-center rounded-full bg-background px-4 py-2 text-sm font-semibold text-foreground"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

// Favicons are real files under public/ on purpose. A data: URI renders in a
// browser tab but is NOT crawlable, so Google falls back to the generic globe
// in search results. /favicon.ico is the one Google looks for first.

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#FF6B35" },
      { name: "author", content: "Constructa by AtumX" },
      { property: "og:site_name", content: "Constructa" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Constructa — Build any robot you imagine" },
      { property: "og:title", content: "Constructa — Build any robot you imagine" },
      { name: "twitter:title", content: "Constructa — Build any robot you imagine" },
      { name: "description", content: "Constructa is a browser-based 3D robot workshop for young builders. Build any robot, watch it run, make it battle. By the team behind SUBO." },
      { property: "og:description", content: "Constructa is a browser-based 3D robot workshop for young builders. Build any robot, watch it run, make it battle. By the team behind SUBO." },
      { name: "twitter:description", content: "Constructa is a browser-based 3D robot workshop for young builders. Build any robot, watch it run, make it battle." },
      { property: "og:image", content: "/og-image.png" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Fredoka:wght@400;500;600;700&family=Unbounded:wght@500..800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Record a landing page view once per tab-session (client-only).
  useEffect(() => {
    initLandingTracker();
  }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <Outlet />
          <Toaster />
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
