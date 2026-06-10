/**
 * i18n Engine
 * Swaps text content of elements with [data-i18n] attributes.
 * Swaps innerHTML of elements with [data-i18n-html] (rich runs: inline
 *   <strong>/<a> that textContent would flatten — authored static strings
 *   only, never user input).
 * Swaps placeholder of elements with [data-i18n-placeholder] attributes.
 * Auto-detects locale from navigator.language, persists via localStorage.
 *
 * React islands can't be reached by these DOM queries (they hydrate after
 * this runs and re-render from their own state), so every apply also fires
 * a `site-lang-change` CustomEvent that islands subscribe to via the
 * useSiteLang() hook. Keep the event name in sync with src/lib/useSiteLang.ts.
 */

// @ts-nocheck
import translations from '../data/translations.json';

type Lang = 'pt' | 'en';

function getNestedValue(obj: any, path: string): string | undefined {
  return path.split('.').reduce((acc, key) => acc?.[key], obj);
}

function applyTranslations(lang: Lang) {
  // Text content
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n')!;
    const entry = getNestedValue(translations, key);
    if (entry && typeof entry === 'object' && lang in entry) {
      el.textContent = (entry as Record<string, string>)[lang];
    }
  });

  // Rich content (preserves inline <strong>/<a> — authored strings only)
  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const key = el.getAttribute('data-i18n-html')!;
    const entry = getNestedValue(translations, key);
    if (entry && typeof entry === 'object' && lang in entry) {
      el.innerHTML = (entry as Record<string, string>)[lang];
    }
  });

  // Placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    const key = el.getAttribute('data-i18n-placeholder')!;
    const entry = getNestedValue(translations, key);
    if (entry && typeof entry === 'object' && lang in entry) {
      (el as HTMLInputElement | HTMLTextAreaElement).placeholder = (entry as Record<string, string>)[lang];
    }
  });

  // Content attributes (e.g. <title>, <meta name="description" data-i18n-content="...">)
  document.querySelectorAll('[data-i18n-content]').forEach((el) => {
    const key = el.getAttribute('data-i18n-content')!;
    const entry = getNestedValue(translations, key);
    if (entry && typeof entry === 'object' && lang in entry) {
      el.setAttribute('content', (entry as Record<string, string>)[lang]);
    }
  });

  // Update html lang attribute
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

  // Update toggle labels
  document.querySelectorAll('.lang-toggle-flag').forEach((el) => {
    (el as HTMLImageElement).src = lang === 'pt' ? 'https://flagcdn.com/w20/br.png' : 'https://flagcdn.com/w20/us.png';
  });

  // Notify React islands (they manage their own copy — see useSiteLang.ts).
  window.dispatchEvent(new CustomEvent('site-lang-change', { detail: lang }));
}

function detectDefaultLang(): Lang {
  const saved = localStorage.getItem('site-lang');
  if (saved === 'pt' || saved === 'en') return saved;

  // Detect from browser
  const browserLang = navigator.language || (navigator as any).userLanguage || '';
  return browserLang.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

function toggleLang() {
  const current = (localStorage.getItem('site-lang') as Lang) || detectDefaultLang();
  const next: Lang = current === 'pt' ? 'en' : 'pt';
  localStorage.setItem('site-lang', next);
  applyTranslations(next);
}

// Initialize
const initialLang = detectDefaultLang();
localStorage.setItem('site-lang', initialLang);

// Apply after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => applyTranslations(initialLang));
} else {
  applyTranslations(initialLang);
}

// Bind toggle buttons
document.getElementById('lang-toggle')?.addEventListener('click', toggleLang);
document.getElementById('lang-toggle-mobile')?.addEventListener('click', toggleLang);

// Export for external use
(window as any).__siteI18n = { applyTranslations, toggleLang, detectDefaultLang };
