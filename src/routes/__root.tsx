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

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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

const FAVICON =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="16" fill="%23FFFFFF" stroke="%23111111" stroke-width="4"/><text x="50%25" y="56%25" text-anchor="middle" dominant-baseline="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="42" fill="%23FF6B35" stroke="%23111111" stroke-width="1.2">C</text></svg>`
  );

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
      { rel: "icon", type: "image/svg+xml", href: FAVICON },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Fredoka:wght@400;500;600;700&display=swap",
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
      <Outlet />
    </QueryClientProvider>
  );
}
