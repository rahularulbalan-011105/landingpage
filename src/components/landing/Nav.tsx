import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Globe } from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { useAuth } from "@/lib/auth";
import { LANGUAGES } from "@/lib/languages";
import { ATUMX_URL } from "@/lib/links";
import { ctrack } from "@/lib/landing-tracker";
import { useI18n, useT } from "@/i18n";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const t = useT();
  const links = [
    { href: "#how", label: t.nav.how },
    { href: "#features", label: t.nav.features },
    { href: "#whats-new", label: t.nav.whatsNew, dot: true },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 font-ui transition-all duration-300 ease-out-soft",
        scrolled ? "bg-white/85 backdrop-blur-md border-b border-wb-line" : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between gap-3 px-5 sm:gap-6 sm:px-8">
        <div className="flex items-center gap-2.5">
          <a href="#top" aria-label={t.nav.home}>
            <img src={logo} alt="" className="h-[50px] w-auto object-contain" />
          </a>
          <a
            href={ATUMX_URL}
            target="_blank"
            rel="noopener"
            className="hidden whitespace-nowrap text-[12px] font-semibold text-wb-ink-3 transition-colors hover:text-wb-ink sm:block"
          >
            {t.nav.byAtumx}
          </a>
        </div>

        <nav aria-label="Primary" className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-[15px] font-medium text-wb-ink-2 transition-colors hover:bg-wb-bench hover:text-wb-ink"
            >
              {l.label}
              {l.dot && <span aria-label={t.nav.newBadge} className="h-1.5 w-1.5 rounded-full bg-wb-orange" />}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-3">
          <LanguageMenu />
          {loading ? null : user ? (
            <Link to="/dashboard" className="wb-btn wb-btn-primary h-11 whitespace-nowrap px-5 text-[15px]">
              {t.nav.myRobots}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="whitespace-nowrap rounded-full px-2.5 py-2 text-[15px] font-semibold text-wb-ink-2 transition-colors hover:text-wb-ink sm:px-4"
              >
                {t.nav.login}
              </Link>
              <Link
                to="/signup"
                onClick={() => ctrack("cta_click", undefined, { where: "nav" })}
                className="wb-btn wb-btn-primary h-11 whitespace-nowrap px-3.5 text-[14px] sm:px-5 sm:text-[15px]"
              >
                {t.nav.start}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Globe + current language code; opens the full list of languages the page is translated into. */
function LanguageMenu() {
  const [open, setOpen] = useState(false);
  const { lang, setLang, t } = useI18n();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.nav.language}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2.5 text-[14px] font-semibold text-wb-ink-2 transition-colors hover:bg-wb-bench hover:text-wb-ink sm:px-3"
      >
        <Globe aria-hidden className="h-[18px] w-[18px]" />
        <span className="hidden uppercase sm:inline">{lang}</span>
        <ChevronDown aria-hidden className={`hidden h-3.5 w-3.5 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t.nav.language}
          className="wb-pop fixed inset-x-4 top-[72px] z-50 max-h-[min(420px,70vh)] overflow-y-auto rounded-[14px] border border-wb-line bg-white p-1.5 shadow-[0_18px_40px_-18px_rgba(28,36,33,0.35)] sm:absolute sm:inset-x-auto sm:end-0 sm:top-[calc(100%+8px)] sm:w-[230px]"
        >
          {LANGUAGES.map((l) => {
            const on = l.code === lang;
            return (
              <li key={l.code} role="option" aria-selected={on}>
                <button
                  type="button"
                  lang={l.code}
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className={[
                    "flex w-full items-center gap-2 rounded-[9px] px-3 py-2 text-start text-[14px] text-wb-ink hover:bg-wb-bench",
                    on ? "font-bold" : "font-medium",
                  ].join(" ")}
                >
                  <span className="min-w-0 flex-1 truncate">{l.label}</span>
                  {on && <Check aria-hidden className="h-4 w-4 shrink-0 text-wb-orange" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
