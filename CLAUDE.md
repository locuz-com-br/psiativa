# CLAUDE.md — PsiAtiva Landing Page (landing-page-v2)

Astro 5 + React 19 + Tailwind 4 landing page for **PsiAtiva**: a consultancy that
gives psychology **clinics** predictable schedules and a structured (non-salesy)
patient-acquisition process. Built by customizing a generic SaaS template, so
template leftovers still surface (see gotchas). Read [`CONTEXT.md`](CONTEXT.md) for
the file map and where copy/config lives.

## ⚠️ The #1 gotcha: copy lives in TWO places and drifts

The home page renders copy from **`src/data/translations.json`** (the runtime source
of truth). `src/scripts/i18n.ts` swaps each element's `textContent`/`placeholder` by
its `data-i18n` / `data-i18n-placeholder` key (PT default, EN via toggle).

But every `.astro` section **also hardcodes fallback copy** inside the tags. That
fallback is what ships in the initial HTML — what crawlers, social previews, and
no-JS / pre-hydration users see. The two **drift**: several sections still carried
the original medical-SaaS template text ("plataforma", "Triagem inteligente",
"+300 mil vidas impactadas", "Dashboard de métricas") while `translations.json` was
already on-brand.

**Rule:** when you change page copy, edit BOTH `translations.json` AND the matching
hardcoded fallback in the section component. Verify with a production build + grep of
`dist/index.html` (see Verify).

Exceptions: `FAQ.astro` and `index.astro` inject the PT value as their own fallback
(`getTranslation()`), so they never drift. `Testimonials.astro` renders empty
fallbacks (filled at runtime from `translations.json`).

## ⚠️ i18n has TWO mechanisms — static (DOM-swap) AND React islands

`src/scripts/i18n.ts` only localizes **static HTML**. It queries `[data-i18n]` (textContent),
`[data-i18n-html]` (innerHTML — for runs with inline `<strong>`/`<a>` that textContent would
flatten; authored strings only), `[data-i18n-placeholder]`, and `[data-i18n-content]`
(`<title>`/meta) and swaps them from `translations.json`. It **cannot reach React islands** —
they hydrate after it runs and re-render from their own state.

So islands localize themselves: their copy is **`{pt,en}` pairs** resolved by `useSiteLang()` +
`pick()` (`src/lib/useSiteLang.ts`), which reads the `site-lang` localStorage key and reacts to
the **`site-lang-change` CustomEvent** the engine fires on every toggle. SSR/first render = PT
(canonical), then it swaps. Island copy lives in `data/quiz.json`, `calculadora.config.ts`, and
in-island `COPY` maps (NOT `translations.json`). **Only display strings are `{pt,en}`** — logic
fields (ids, weights, `icp`/`pains`, `slug`, min/max) stay monolingual, and the envelope/payload
records the language she actually saw.

When you add a string to a localized page: static → `data-i18n` key in `translations.json` + the
hardcoded PT fallback (same dual-copy rule); island → `{pt,en}` in the island's data/config +
`pick(x, lang)`. `/quiz` + `/calculadora` are fully bilingual; **`/diagnostico` (forms island) is
still PT-only** — localizing `FormIsland` follows this same pattern.

## ⚠️ Dead data files — do not edit expecting a change

Only **`translations.json`** (3 imports), **`faq.json`** (2), and
**`testimonials.json`** (1) are imported. These are unused template leftovers — DO
NOT edit them to change the page: `capabilities.json`, `features.json`, `nav.json`,
`process.json`, `results.json`, `services.json`, `why-us.json`. (`capabilities.json` and
`features.json` were rewritten to on-brand PT copy so no off-brand template text lingers,
but they remain unused; the other five are structural stubs — prefixes/icons/labels only.)

## Brand voice (mandatory for any client-facing PT copy)

Sources (read before writing copy): `skills/humanizer/SKILL.md` (PsiAtiva two-layer
humanizer) and `sources/workspace/psiativa/_config/{voice,marca-identidade-visual,positioning,comercial-playbook,icp-clinica}.md`.

- **ICP = clínica with team + reception.** Never mix in the solo-practitioner ICP
  (`icp-consultorio-solo.md`) in the same deliverable. The whole page is clínica-framed.
- **Forbidden words** in external copy: `marketing, leads, vendas, funil, escalar/escala,
  contrato, comercial, conversão, tráfego, engajamento, agência, campanha, reunião,
  métricas, plataforma, cliente (do psicólogo)`. Approved swaps in `marca-identidade-visual.md`.
- **Hemorrhage framing**, not improvement framing ("Cada semana com buraco na agenda é
  dinheiro que não volta", not "melhore sua captação").
- **No em dashes / en dashes** in copy (hard humanizer rule). Use period/comma/colon.
  Code comments may keep them.
- **No "Não é X. É Y." negation/contrast stacks.** One deliberate contrast max; state
  affirmatively. (The brand's signature "Você não perde paciente por falta de competência.
  Perde no caminho..." is the one allowed reframe.)
- 3-register: **clínico → empático → firme.** Drop in real clinic-life signals
  (agenda oscilante, no-show, recepção, WhatsApp, mês bom/mês ruim).
- GAP = "Gerador de Agenda Previsível". Calm authority; max one "!" per page.

## Verify (after copy changes)

```bash
npm run build                          # must complete (page count grows as deliverables land)
node -e "JSON.parse(require('fs').readFileSync('src/data/translations.json','utf8'))"
grep -nE "—|–" src/data/translations.json            # expect: none in copy
grep -niE "marketing|leads|vendas|escal|comercial|plataforma|métricas" src/data/translations.json
grep -F "<new phrase>" dist/index.html               # confirm fallback shipped
```

## Scope boundaries

- **`sources/`** is the ICM knowledge factory (read-only context). Never edit
  `sources/knowledge/**` or `sources/workspace/psiativa/_config/**` to fit this page —
  they're the brand factory; override locally instead.
- **`src/pages/indicacao.astro`** + `src/components/sections/indicacao/*` = a SEPARATE
  referral funnel page (NR-1 / "why not an agency" angle). It forks BOTH ICPs as two
  separate cards (`Audience.astro`), never blended copy. **Now i18n-driven** like the home:
  copy lives under the `indicacao.*` keys in `translations.json` (PT + EN), rendered via
  `data-i18n` with humanized PT fallbacks (same dual-copy sync rule applies). The `<title>`/
  meta `description` now localize too, via the `indicacao.meta.*` keys (`titleKey`/
  `descriptionKey` props on `BaseLayout`→`SEOHead`, swapped client-side by `data-i18n-content`).
  Its navbar is page-specific (the `navbar` prop on `BaseLayout`→`Navbar`), linking its own
  sections (`#para-quem`, `#diferenca`, …) instead of the home anchors. Distinct deliverable;
  don't bundle it with home-page work.
- **`src/pages/calculadora.astro`** + `src/components/calculadora/*` + `src/lib/calculadora.ts`
  + `src/config/calculadora.config.ts` = the **Calculadora de Custo da Inação** (`/calculadora`, bilingual PT/EN,
  Sprint 6). A SEPARATE **solo-ICP (Perfil B)** SEO + lead-magnet deliverable — deliberately NOT
  clínica-framed, so it doesn't cannibalize the home (see `plans/seo-briefing-roi-calculator.md`).
  Static indexable layer (H1/TL;DR/question-H2s/cohort block/FAQ + WebApplication/FAQPage/Breadcrumb
  schema, no `offers`/`price`) + a React island (cohort projection, SVG com/sem-método chart, capture
  gate). **Locked offer numbers live SERVER-side in the n8n capture webhook** (`PUBLIC_N8N_CAPTURE_WEBHOOK`,
  `source='roi_calculator'`), NEVER in the bundle; the gated reveal renders the webhook response, with a
  DEV-only mock (`PUBLIC_CALC_DEV_MOCK`, tree-shaken from prod) for local preview. The home links to it
  via `CalcCTA.astro` (`sections.calcCta`, placed before the custo CTA). Request/response + offer-guardian
  checklist: `plans/calculadora-capture-contract.md`. **Pre-deploy gates:** offer-guardian sign-off on the
  numbers, the live webhook, and a real CRP for `personAuthorSchema`. Its copy follows the same voice rules
  (no em/en dashes, hemorrhage framing) as the home.
- **`src/pages/quiz.astro`** + `src/components/quiz/*` + `src/lib/quiz.ts` + `src/config/quiz.config.ts`
  + `src/data/quiz.json` = the **Diagnóstico de 2 Minutos** (`/quiz`, bilingual PT/EN). A self-diagnosis lead funnel: the
  prospect ranks her own dominant business pain, sees it named back with its hidden cost, and leaves her
  WhatsApp to claim a free *isca*. **The one place BOTH ICPs share a deliverable** (the carved-out exception
  to the never-mix rule): the *questions profile* the ICP (`autonoma` vs `clinica`); each *result is
  single-ICP*. Indexable layer (H1/TL;DR/question-H2s/FAQ + WebApplication/FAQPage/Breadcrumb schema, no
  `offers`/`price`, ICP-neutral hero) + a JSON-driven React island (GSAP step motion, scoring → single
  dominant-pain result → phone+hCaptcha capture as the LAST step). **No offer anywhere** (no price/garantia/
  prazo): the result uses a soft aspirational frame; the §4 product-path column is internal routing, never
  rendered. The isca is **gated behind the phone with NO on-screen download** — Renata sends the file on
  WhatsApp. Capture POSTs to the **shared** `PUBLIC_N8N_CAPTURE_WEBHOOK` with `source='quiz_diagnostico'`
  (distinct from the calc's `roi_calculator`); DEV-only `PUBLIC_QUIZ_DEV_MOCK` simulates the handoff (tree-
  shaken from prod). Home links to it via `QuizCTA.astro` (`sections.quizCta`, clínica-framed, after
  `Results`). Request/response + offer-guardian/CFP checklists: `plans/quiz-capture-contract.md`. **MVP slice:
  top-3 pains/ICP (6 results)** — expanding to all 5/ICP is a `quiz.json` edit. **Pre-deploy gates (front-end
  is done; `/quiz` is NOT live until all three close):**
  1. Build the **n8n Quiz Capture flow** (P2) per the contract — webhook branch by `source` → hCaptcha
     server-verify → `check_only` dedup → `leads_master` insert (now a **5th producer**; mind the schema
     fan-out across all append nodes) → isca `send-document` → Renata handoff. Best run via the
     `psiativa-n8n-editor` agent (different repo/session).
  2. Produce the **isca PDFs** (content track) + host on R2/`cdn.psiativa.com.br` + run the **FULL CFP pass**
     on each (esp. precificação + respostas-a-paciente iscas). File map in the contract §6.
  3. Run the quiz copy through **voice-auditor + CFP-light + offer-guardian** before publish (self-audited to
     the humanizer rules so far; the agents have not been run).

  Plan: `plans/quiz-diagnostico/plan.md`.
- **`src/pages/diagnostico.astro`** + `src/components/forms/*` + `src/lib/forms.ts` + `src/config/forms.config.ts`
  + `src/data/forms/<slug>.json` = the **native forms engine** (`/diagnostico`), generalized from `/quiz` to
  replace the Formbricks **link** survey. **Schema-driven and reusable:** one `FormIsland` renders any
  `data/forms/*.json`; adding a validated survey = **1 JSON + 1 page + 1 `FORM_SOURCES` entry + 1 n8n branch,
  NO engine edits**. The operating model is "Formbricks for MVP/unvalidated surveys → native once validated."
  Core Q&A types only (decision): `single_select` (auto-advances), `multi_select`, `open_text`/`long_text`,
  `rating` (number/star/NPS), `statement`, `consent`, + the name/phone `ContactStep` as the LAST step.
  **Linear** (no branching; a `showIf` hook is left in the schema, unused). **Single-ICP per form** — the
  discovery survey is clínica-framed; the both-ICP exception is ONLY `/quiz`, never blend here. **No offer
  anywhere** (no price/garantia/prazo); copy follows the same voice rules (no em/en dashes, hemorrhage framing).
  Capture POSTs to the **shared** `PUBLIC_N8N_CAPTURE_WEBHOOK` with `source='discovery_survey'` (distinct from
  `roi_calculator`/`quiz_diagnostico`); `leads_master` is now the **6th producer** — mind the schema fan-out
  across all append nodes. DEV-only `PUBLIC_FORMS_DEV_MOCK` logs the payload (tree-shaken from prod). ⚠️ **Gotcha:**
  `FormIsland` is `client:only`, so its `content` prop is **serialized into the page HTML** — keep internal
  notes / secrets / offer numbers OUT of the JSON (the `_comment` in `data/forms/*.json` is stripped in
  `forms.config.ts` for exactly this reason). `data/forms/discovery.json` is a **SCAFFOLD** (exercises every
  field type); the real content is the Formbricks transcription. **Formbricks decommission is partial:** keep
  `@formbricks/js` + `FormbricksAppSurvey` + `leonardo-lima.astro` (the **app** survey, MVP only); retire the
  **link** bits (`FormbricksLinkSurvey`, `formbricks.linkSurveyId`, `PUBLIC_FORMBRICKS_LINK_SURVEY_ID`,
  `.survey-iframe-shell`) only AFTER the native discovery survey is validated in prod. **Pre-deploy gates
  (front-end is done; `/diagnostico` is NOT live until all three close):**
  1. **Transcribe** the validated Formbricks survey questions into `src/data/forms/discovery.json` (needs
     Formbricks cloud access — the real critical path; the engine is content-blind).
  2. Build the **n8n `source='discovery_survey'` branch** on the shared webhook (hCaptcha server-verify →
     `check_only` dedup → `leads_master` insert with the `survey` jsonb → Renata handoff). Best run via the
     `psiativa-n8n-editor` agent (different repo/session).
  3. Run the discovery-survey copy through **voice-auditor + CFP-light + offer-guardian** before publish.

  Plan + capture contract: `plans/native-forms/plan.md`.
