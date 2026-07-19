import { useEffect, useState } from "react";
import logo from "@/assets/constructa-logo.jpeg";

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
        "fixed top-0 left-0 right-0 z-50 h-[100px] transition-all duration-300 ease-out-soft",
        scrolled
          ? "backdrop-blur-md bg-background/85 border-b-[3px] border-ink"
          : "bg-transparent border-b-[3px] border-transparent",
      ].join(" ")}
    >
      <div className="mx-auto max-w-[1200px] h-full px-6 sm:px-8 flex items-center justify-between">
        <a
          href="#top"
          className="group flex items-center gap-3 leading-none"
          aria-label="Constructa — home"
        >
          <img
            src={logo}
            alt="Constructa"
            className="h-[68px] sm:h-[80px] w-auto object-contain -rotate-3 transition-transform duration-200 ease-out-soft group-hover:rotate-0 group-hover:scale-105"
          />
          <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-text-tertiary">
            by AtumX
          </span>
        </a>
        <div className="flex items-center gap-6">
          <a
            href="#why"
            className="hidden sm:inline-block text-[15px] font-semibold text-text-secondary hover:text-primary transition-colors duration-200 ease-out-soft"
          >
            Why
          </a>
          <a
            href="#cta"
            className="comic-btn inline-flex items-center justify-center bg-primary text-white text-[14px] font-bold px-5 py-2.5"
          >
            Get your key 🔑
          </a>
        </div>
      </div>
    </header>
  );
}
