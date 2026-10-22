import { createContext, Fragment, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { LANGUAGES } from "@/lib/languages";
import { en, type Messages } from "./en";

export type { Messages } from "./en";
export type LangCode = (typeof LANGUAGES)[number]["code"];

const STORAGE_KEY = "constructa-lang";

// Every language file except English, loaded only when someone picks it.
const loaders = import.meta.glob<Record<string, Messages>>(["./*.ts", "!./en.ts"]);

async function load(code: LangCode): Promise<Messages> {
  if (code === "en") return en;
  const mod = await loaders[`./${code}.ts`]?.();
  return mod?.[code] ?? en;
}

const isLang = (v: string | null): v is LangCode => !!v && LANGUAGES.some((l) => l.code === v);

type Ctx = { lang: LangCode; t: Messages; setLang: (code: LangCode) => void };
const I18nContext = createContext<Ctx>({ lang: "en", t: en, setLang: () => {} });

/**
 * The page always server-renders in English (so markup matches on hydration), then switches to the
 * visitor's saved choice, or a `?lang=xx` link, right after mount.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("en");
  const [t, setT] = useState<Messages>(en);

  const setLang = useCallback((code: LangCode) => {
    void load(code).then((msgs) => {
      setT(msgs);
      setLangState(code);
      // Layout stays left-to-right (the 3D stages and scroll scenes are built for it); Arabic text still
      // reads and aligns right-to-left per paragraph via the :lang(ar) rule in styles.css.
      document.documentElement.lang = code;
      try {
        localStorage.setItem(STORAGE_KEY, code);
      } catch {
        /* private mode: the choice just won't persist */
      }
    });
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = new URLSearchParams(window.location.search).get("lang") ?? localStorage.getItem(STORAGE_KEY);
    } catch {
      /* storage blocked */
    }
    if (isLang(saved) && saved !== "en") setLang(saved);
  }, [setLang]);

  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);
export const useT = () => useContext(I18nContext).t;

/** Renders "\n" in a translated headline as a line break. */
export function Lines({ text }: { text: string }) {
  const parts = text.split("\n");
  return (
    <>
      {parts.map((p, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {p}
        </Fragment>
      ))}
    </>
  );
}
