import { useEffect, useState } from "react";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 h-[72px] transition-all duration-300 ease-out-soft",
        scrolled
          ? "backdrop-blur-md bg-background/70 border-b border-border"
          : "bg-transparent border-b border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-[1200px] h-full px-6 sm:px-8 flex items-center justify-between">
        <a
          href="#top"
          className="text-foreground font-medium tracking-tight text-[20px] leading-none"
        >
          AtumX
        </a>
        <div className="flex items-center gap-6">
          <a
            href="#why"
            className="hidden sm:inline-block text-[14px] font-medium text-text-secondary hover:text-foreground transition-colors duration-200 ease-out-soft"
          >
            Why
          </a>
          <a
            href="#cta"
            className="inline-flex items-center justify-center rounded-md bg-[#FF6B35] text-[#0A0A0A] text-[14px] font-medium px-4 py-2 hover:brightness-110 transition-all duration-200 ease-out-soft"
          >
            Get early access
          </a>
        </div>
      </div>
    </header>
  );
}
