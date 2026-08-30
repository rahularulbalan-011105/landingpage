import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import logo from "@/assets/constructa-logo.jpeg";

/** Branded, comic-theme wrapper shared by the login + signup screens. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="relative min-h-screen w-full bg-background halftone flex flex-col items-center justify-center px-4 py-12">
      {/* Home link / brand */}
      <Link
        to="/"
        className="group mb-8 flex items-center gap-3 leading-none"
        aria-label="Constructa — home"
      >
        <img
          src={logo}
          alt="Constructa"
          className="h-[64px] w-auto object-contain -rotate-3 transition-transform duration-200 ease-out-soft group-hover:rotate-0 group-hover:scale-105"
        />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
          by AtumX
        </span>
      </Link>

      <div className="w-full max-w-[420px] comic-outline bg-background p-7 sm:p-8">
        <span className="comic-tag mb-4">Workshop access</span>
        <h1 className="font-display text-3xl font-extrabold text-foreground tracking-tight">
          {title}
        </h1>
        {subtitle && <p className="mt-2 text-sm text-text-secondary">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="mt-6 text-sm text-text-secondary">{footer}</div>}
    </main>
  );
}
