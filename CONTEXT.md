# CONTEXT.md — File Map & Routing

Where things live, so you load lean. Behavior rules + gotchas are in [`CLAUDE.md`](CLAUDE.md).

## Home page copy: section component ↔ translation key ↔ DOM id

Home (`src/pages/index.astro`) render order and mapping. **Names are mismatched —
the file name, the `translations.json` key, and the DOM id often differ. Use this table.**

| Component (`src/components/sections/`) | `translations.json` key | DOM id | Notes |
|---|---|---|---|
| `Hero.astro` | `hero.*` | `#inicio` | typewriter words in `site.config.ts` |
| `LogoBar.astro` | `partners.*` | — | **DISABLED** (`sections.partners=false`) |
| `WhyUs.astro` | `about.*` | `#sobre` | "About" two-column + checklist |
| `Services.astro` | `features.*` | `#funcionalidades` | 3 problem/solution cards |
| `CalcCTA.astro` | `calcCta.*` | `#calculadora-cta` | teaser → `/calculadora` (after Services) |
| `Process.astro` | `func.*` | `#funcionalidades-detail` | the GAP, 5 numbered steps |
| `Results.astro` | `cases.*` | `#resultados` | 4 stat numbers |
| `QuizCTA.astro` | `quizCta.*` | `#quiz-cta` | teaser → `/quiz` (after Results) |
| `Testimonials.astro` | `testimonials.*` | `#depoimentos` | + reads `data/testimonials.json` |
| `FAQ.astro` | `faq.*` | `#faq` | + reads `data/faq.json`; PT fallback via `getTranslation()` |
| `CTA.astro` | `cta.*` | `#cta` | |
| `Contact.astro` | `contact.*` | `#contato` | renders `ContactForm.tsx` (React island) |
| `Navbar.astro` | `nav.*` | — | prop-driven: `items`/`cta`/`logoHref` (home set = default) |
| `Footer.astro` | `footer.*` | — | |
| `Integrations.astro` | `integrations.*` | — | **DISABLED** (`sections.integrations=false`) |
| `WhatsAppFab.astro` | — | — | floating WhatsApp button |

Section on/off toggles: `src/config/site.config.ts` → `sections`.

## Config & engine

- `src/config/site.config.ts` — brand name, contact, colors, fonts, section toggles,
  hero typewriter words, SEO/og, and `WHATSAPP_LINK` (derived; carries the prefilled
  diagnostic message).
- `src/constants/links.ts` — all hrefs, derived from `site.config.ts`.
- `src/scripts/i18n.ts` — the i18n engine. Swaps `data-i18n` (textContent), `data-i18n-placeholder`
  (input placeholders), and `data-i18n-content` (an element's `content` attr — used to localize
  `<title>`/meta) by browser/localStorage lang. Loaded globally in `BaseLayout`, so it runs on every page.
- `src/data/translations.json` — **all home-page copy, PT + EN** (source of truth).
- `src/layouts/BaseLayout.astro` — `<head>`/meta/SEO wrapper (renders `SEOHead`, `Navbar`, `Footer`).
  Optional `titleKey`/`descriptionKey` props localize `<title>`+description client-side (SSR stays PT);
  optional `navbar={{items,cta,logoHref}}` overrides the nav per page. `src/components/seo/SEOHead.astro`
  owns the title/canonical/OG/Twitter/JSON-LD tags.
- `src/lib/schema.ts` — JSON-LD: `organization`, `website`, `faqPage`, `breadcrumb`,
  `article`, plus `webApplication` (calc + quiz; no `offers`/`price`) and `personAuthor`
  (CRP / E-E-A-T author signal — wire up only once a real CRP exists, never fabricate).
- `src/styles/` — global CSS + design tokens (teal/sage palette, New York + Lora fonts).

## Pages (`src/pages/`)

- `index.astro` — home (the main deliverable; uses `translations.json`).
- `indicacao.astro` + `components/sections/indicacao/*` — **separate referral funnel**
  (NR-1 angle), forks both ICPs as two cards. i18n-driven via the `indicacao.*` keys in
  `translations.json` (PT + EN, `data-i18n` with PT fallbacks). Page `<title>`/meta localize
  via `indicacao.meta.*` (`titleKey`/`descriptionKey` props); navbar is page-specific (`navbar` prop).
- `calculadora.astro` + `components/calculadora/` + `lib/calculadora.ts` + `config/calculadora.config.ts`
  — **Calculadora de Custo da Inação** (solo-ICP SEO + lead magnet; cohort projection + gated reveal).
  Front-end done; **NOT live yet** (offer-guardian sign-off + shared n8n webhook + real CRP pending — see
  the calc **pre-deploy gates** in `CLAUDE.md` and `plans/calculadora-capture-contract.md`). Home links via
  `CalcCTA.astro` (`source='roi_calculator'`). Locked numbers live server-side in the webhook, never in the bundle.
- `quiz.astro` + `components/quiz/` + `lib/quiz.ts` + `data/quiz.json` — Diagnóstico de 2 Minutos
  (self-diagnosis quiz; the only deliverable that serves BOTH ICPs — questions profile, result is single-ICP;
  isca funnel, no offer). Shares the n8n capture webhook with the calc (`source='quiz_diagnostico'`).
  Front-end done; **NOT live yet** (n8n flow + isca PDFs + copy agent passes pending — see the quiz
  **pre-deploy gates** in `CLAUDE.md`).
- `blog/index.astro`, `blog/[slug].astro` — blog over content collection `src/content/blog/`.
- `[slug].astro` — generic pages over `src/content/pages/` (termos, privacidade, cookies, example).
- `404.astro`, `sitemap.xml.ts`.

## Brand factory (read-only context — do not edit to fit this page)

- `skills/humanizer/SKILL.md` — PsiAtiva two-layer humanizer (voice, forbidden words,
  hemorrhage framing, 3-register).
- `sources/knowledge/skills/humanizer/SKILL.md` — parent humanizer (29 generic AI patterns).
- `sources/workspace/psiativa/_config/` — `voice.md`, `marca-identidade-visual.md`
  (vocabulary map), `positioning.md` (GAP, problem frame), `comercial-playbook.md`,
  `icp-clinica.md` (target ICP), `icp-consultorio-solo.md` (the OTHER ICP — keep separate).
- `sources/CLAUDE.md`, `sources/workspace/psiativa/CLAUDE.md` — ICM workspace identity.

## Other top-level dirs

- `plans/` — project plans. `seo/` — SEO working files. `dist/` — build output (generated).
