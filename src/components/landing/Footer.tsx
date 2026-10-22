import { Link } from "@tanstack/react-router";
import { ChevronDown, Globe } from "lucide-react";
import logo from "@/assets/constructa-logo.webp";
import { LANGUAGES } from "@/lib/languages";
import { ATUMX_URL } from "@/lib/links";
import { ctrack } from "@/lib/landing-tracker";
import { useI18n, type LangCode, type Messages } from "@/i18n";

type FooterLink = { label: string; href: string; to?: never } | { label: string; to: string; href?: never };

const columns = (f: Messages["footer"]): { title: string; links: FooterLink[] }[] => [
  {
    title: f.colConstructa,
    links: [
      { label: f.how, href: "#how" },
      { label: f.features, href: "#features" },
      { label: f.constructathon, href: "#constructathon" },
      { label: f.startBuilding, to: "/signup" },
      { label: f.login, to: "/login" },
    ],
  },
  {
    title: f.colResources,
    links: [
      { label: f.simulatorPost, href: "https://www.atumx.in/blog/free-robot-simulator-with-real-physics-constructa" },
      {
        label: f.tinkercadPost,
        href: "https://www.atumx.in/blog/the-best-tinkercad-alternative-for-robotics-in-2026-that-actually-simulates-movement",
      },
      { label: f.blog, href: "https://www.atumx.in/blog" },
      { label: f.faq, href: "#faq" },
    ],
  },
  {
    title: f.colCommunity,
    links: [
      { label: f.whatsapp, href: "https://chat.whatsapp.com/Kxikh3QnPIaHW92hssMTRK?s=cl&p=a&ilr=1&amv=0" },
      { label: f.atumx, href: ATUMX_URL },
    ],
  },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/constructa.io/",
    path: "M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1.1.4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1.1.4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1.1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1.1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2Zm0 1.8c-3.1 0-3.5 0-4.7.1-1 0-1.6.2-2 .3-.5.2-.8.4-1.2.8-.4.4-.6.7-.8 1.2-.1.4-.3.9-.3 2-.1 1.2-.1 1.6-.1 4.7s0 3.5.1 4.7c0 1 .2 1.6.3 2 .2.5.4.8.8 1.2.4.4.7.6 1.2.8.4.1.9.3 2 .3 1.2.1 1.6.1 4.7.1s3.5 0 4.7-.1c1 0 1.6-.2 2-.3.5-.2.8-.4 1.2-.8.4-.4.6-.7.8-1.2.1-.4.3-.9.3-2 .1-1.2.1-1.6.1-4.7s0-3.5-.1-4.7c0-1-.2-1.6-.3-2-.2-.5-.4-.8-.8-1.2-.4-.4-.7-.6-1.2-.8-.4-.1-.9-.3-2-.3-1.2-.1-1.6-.1-4.7-.1Zm0 3.1a4.9 4.9 0 1 1 0 9.8 4.9 4.9 0 0 1 0-9.8Zm0 8a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Zm5.1-9.4a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Z",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/atumxofficial",
    path: "M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@AtumX",
    path: "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z",
  },
];

const linkCls = "text-[14.5px] text-wb-ink-2 transition-colors duration-200 hover:text-wb-ink";

export function Footer() {
  const { lang, setLang, t } = useI18n();
  const f = t.footer;

  return (
    <footer className="border-t border-wb-line bg-wb-bench font-ui text-wb-ink">
      <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-x-8 gap-y-12 px-5 py-16 sm:px-8 md:grid-cols-[1.5fr_1fr_1.3fr_1fr_1.1fr] md:gap-x-10">
        {/* About + socials */}
        <div className="col-span-2 md:col-span-1">
          <p className="max-w-[30em] text-[15px] leading-[1.65] text-wb-ink-2" style={{ textWrap: "pretty" }}>
            {f.about}
          </p>
          <p className="mt-7 text-[15px] font-semibold text-wb-ink">{f.followUs}</p>
          <ul className="mt-3 flex gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] text-wb-ink-2 transition-colors duration-200 hover:bg-white hover:text-wb-ink"
                >
                  <svg viewBox="0 0 24 24" className="h-[20px] w-[20px] fill-current" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Link columns */}
        {columns(f).map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="text-[15px] font-semibold text-wb-ink">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  {l.to ? (
                    <Link to={l.to} className={linkCls}>
                      {l.label}
                    </Link>
                  ) : l.href?.startsWith("#") ? (
                    <a href={l.href} className={linkCls}>
                      {l.label}
                    </a>
                  ) : (
                    <a
                      href={l.href}
                      onClick={() => l.href?.includes("whatsapp") && ctrack("whatsapp_click")}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={linkCls}
                    >
                      {l.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* Brand + language */}
        <div className="col-span-2 md:col-span-1">
          <img src={logo} alt="Constructa" className="h-12 w-auto object-contain" />
          <label className="relative mt-5 block w-fit">
            <span className="sr-only">{f.language}</span>
            <Globe aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-ink-3" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as LangCode)}
              className="h-10 appearance-none rounded-full border border-wb-line bg-white pe-9 ps-10 text-[14px] font-semibold text-wb-ink transition-colors hover:border-wb-ink-3 focus:border-wb-orange focus:outline-none"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} lang={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            <ChevronDown aria-hidden className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-wb-ink-3" />
          </label>
        </div>
      </div>

      <div className="border-t border-wb-line">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-2 px-5 py-5 text-[12.5px] text-wb-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>© 2026 AtumX Innovations Pvt Ltd</p>
          <p>{f.address}</p>
        </div>
      </div>
    </footer>
  );
}
