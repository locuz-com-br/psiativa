// ─────────────────────────────────────────────────────────────
// useSiteLang — language bridge for React islands
// ─────────────────────────────────────────────────────────────
// The DOM-swap engine (src/scripts/i18n.ts) localizes static [data-i18n]
// markup, but it can't reach React islands: they hydrate after it runs and
// re-render from their own state. So islands keep their copy as { pt, en }
// pairs and resolve it with `pick()` against the language this hook tracks.
//
// The hook reads the same `site-lang` localStorage key the engine writes,
// then subscribes to the `site-lang-change` CustomEvent the engine fires on
// every apply/toggle. Keep the key + event name in sync with i18n.ts.

import { useEffect, useState } from "react";

export type Lang = "pt" | "en";

/** A string (or any value) that exists in both site languages. */
export type L10n<T = string> = { pt: T; en: T };

/** Resolve a bilingual value for the active language. */
export function pick<T>(value: L10n<T>, lang: Lang): T {
  return value[lang];
}

// Mirrors detectDefaultLang() in src/scripts/i18n.ts so an island that
// mounts before the engine writes localStorage still picks the same lang.
function readLang(): Lang {
  if (typeof window === "undefined") return "pt";
  try {
    const saved = localStorage.getItem("site-lang");
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* localStorage blocked — fall through to navigator detection */
  }
  const browser = (navigator.language || (navigator as any).userLanguage || "").toLowerCase();
  return browser.startsWith("pt") ? "pt" : "en";
}

/**
 * Current site language, reactive to the toggle. Starts at "pt" on the
 * server and the first client render (so SSR and hydration agree — PT is
 * the default/canonical), then resolves the real language in an effect.
 */
export function useSiteLang(): Lang {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    setLang(readLang());
    const onChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === "pt" || detail === "en") setLang(detail);
    };
    window.addEventListener("site-lang-change", onChange);
    return () => window.removeEventListener("site-lang-change", onChange);
  }, []);

  return lang;
}
