# PsiAtiva Landing Page v2 — Build Task Tracker

> **Open this first in every implementation session.** This file tracks the executable work. The release sequence, decision gates, measurement model, and deferred scope live in [`ROADMAP.md`](ROADMAP.md). Project behavior and file ownership live in [`CLAUDE.md`](CLAUDE.md) and [`CONTEXT.md`](CONTEXT.md).

**Scope:** make `psiativa.com.br` measurable before paid acquisition begins, then add a safe structure for testing landing-page copy, headlines, images, and CTAs. The system must capture data, turn it into evidence-backed action items, and preserve experiment attribution through the lead handoff.

**Two levels of done — do not conflate them:**

- **Measurement-ready — NOT complete.** GA4/Clarity wiring and several events already exist, but there is no verified end-to-end attribution contract, scheduled SEO dataset, data-quality monitor, or automated action-item loop.
- **Experiment-ready — NOT shipped.** There is no experiment registry, stable variant delivery, A/A validation, or experiment-aware reporting yet.

**Governing constraints:**

- Releases 1 and 2 in [`ROADMAP.md`](ROADMAP.md) are a hard gate before the first paid campaign spends money.
- Build work stays inside the PsiAtiva **build box** from `_config/rotina-comercial.md`; it does not replace the commercial routine.
- Reuse the current stack first: GA4, Google Search Console, Clarity, n8n, and the existing PsiAtiva data store. Do not buy a CRO or BI platform before the MVP proves a real need.
- Never send names, phones, emails, messages, survey answers, or health-related data to analytics or session-replay tools.
- The action engine may recommend work, but it must not publish copy, change budgets, or declare an experiment winner automatically.
- n8n changes are cross-repo work. Before editing a workflow, use the `psiativa-n8n-editor` operating spec and confirm the n8n editor tab is closed.

---

## ✅ Baseline already present

- [x] **Static, indexable Astro output** with an explicit production `site` URL.
- [x] **Central SEO head** with canonical, robots, Open Graph, Twitter, and JSON-LD support.
- [x] **Robots and sitemap foundations** at `public/robots.txt` and `src/pages/sitemap.xml.ts`.
- [x] **Consent-aware analytics loader** for GA4 and Clarity. Analytics storage defaults to denied.
- [x] **PII parameter blocklist** in `src/components/analytics/Analytics.astro`.
- [x] **Typed analytics helper** in `src/lib/analytics.ts`.
- [x] **Initial events** for CTA/WhatsApp clicks, lead generation, form errors, and survey start/completion.
- [x] **Partial campaign capture** through `?c=` in the quiz and native forms.
- [x] **Environment hooks** for GA4 and Clarity IDs in `.env.example`.
- [x] **Historical SEO audit** at `seo/reports/audit-landing-page-v2-2026-06-03.md`. It predates several current fixes and is not a production baseline.

## ▶ Next session — start here

1. Start with Phase 0. Do not build the experiment router first.
2. Confirm which page and server-confirmed outcome represent the primary conversion for the first paid campaign.
3. Inventory access to GA4, Search Console, Clarity, the ad account, n8n, and the destination data store. Record identifiers, never secrets.
4. Capture a versioned baseline of the current production site and run the event journey in GA4 DebugView.
5. Write the measurement contract before adding more events.

---

## Phase 0 — Fix the measurement frame

- [ ] **0.1 Define the decision.** State what the first campaign must teach us and which business action each KPI can change.
- [ ] **0.2 Map page → ICP → offer → primary outcome.** Keep the clinic home, solo calculator, shared quiz, and any paid-only page separated in reporting.
- [ ] **0.3 Choose one primary conversion per campaign.** Prefer a server-confirmed outcome; a button click is a diagnostic event, not a lead.
- [ ] **0.4 Name owners.** Assign one owner for data quality, one for weekly recommendations, and one for approving site changes.
- [ ] **0.5 Inventory production properties.** GA4 property/data stream, Search Console property, Clarity project, ad account, n8n workflow, storage, and notification destination.
- [ ] **0.6 Freeze the pre-campaign baseline.** Record deploy/commit, indexed pages, current query/page performance, CWV, event coverage, and known gaps.
- [ ] **0.7 Lock data governance.** Define allowed parameters, retention, consent behavior, access, deletion, and a written prohibition on PII/survey answers in analytics.

## Phase 1 — Trusted measurement foundation

> **Benefit shipped:** paid traffic can be traced from source to a real outcome without leaking sensitive data.

- [ ] **1.1 Create `docs/measurement-plan.md`.** Include event name, trigger, required parameters, owner, destination, decision informed, and QA evidence.
- [ ] **1.2 Standardize page identity.** Add stable `page_id`, `page_type`, `icp`, and `language` values; do not rely only on raw URLs.
- [ ] **1.3 Standardize CTA identity.** Add stable `cta_id`, `cta_location`, and `destination`; prevent one click from emitting accidental duplicate conversions.
- [ ] **1.4 Build a first-party attribution utility.** Parse, sanitize, and persist `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, `gclid`, `wbraid`, `gbraid`, referrer, and landing page.
- [ ] **1.5 Preserve first-touch and current-touch attribution** through navigation and into the server-side lead envelope. Do not overwrite a known first touch on every page.
- [ ] **1.6 Unify `?c=` with the attribution contract.** Keep backwards compatibility for current quiz/forms links while removing one-off parsing from individual islands.
- [ ] **1.7 Complete the funnel event contract.** At minimum: landing view, primary CTA click, form/survey start, successful server-confirmed lead, error, WhatsApp handoff, and qualified/disqualified outcome where the backend can provide it.
- [ ] **1.8 Instrument all live entry paths.** Home contact, WhatsApp, calculator, quiz, native forms, referral page, and paid-only pages must use the same contract.
- [ ] **1.9 Separate client intent from server success.** Never mark `generate_lead` before the webhook/API confirms acceptance.
- [ ] **1.10 Configure GA4 key events and Google Ads imports.** Document attribution windows and deduplication identifiers before launch.
- [ ] **1.11 Verify Search Console ownership and submit the sitemap.** Record indexed/excluded pages and any canonical mismatch.
- [ ] **1.12 Validate consent behavior.** No vendor request before consent; revocation clears cookies; denied users still get a functional page.
- [ ] **1.13 Validate privacy.** Inspect network payloads and Clarity masking across every form, quiz, and calculator state.
- [ ] **1.14 Add analytics contract checks.** Type-check event names/parameters, reject blocked keys, and add a production-build smoke check.
- [ ] **1.15 Run a controlled QA cohort.** Test direct, organic, paid-tagged, WhatsApp, form success, form failure, mobile, and consent-denied journeys.
- [ ] **1.16 Publish the measurement runbook.** Include DebugView steps, expected event order, common failure modes, and rollback.

### Phase 1 exit gate

- [ ] Every required QA journey produces exactly one expected event chain.
- [ ] Source, landing page, campaign, and page identity survive through the confirmed outcome.
- [ ] No PII or survey answers appear in GA4, Clarity, logs, URLs, or experiment parameters.
- [ ] Search Console and sitemap are verified against the production domain.
- [ ] Known data delays and attribution limitations are documented.

## Phase 2 — Automated SEO intelligence and action loop

> **Benefit shipped:** a scheduled report explains what changed, why it matters, and the next owned action.

- [ ] **2.1 Define the source matrix.** Use Search Console for query/page visibility, GA4 for on-site behavior/outcomes, Clarity for qualitative friction, and PageSpeed/CrUX for performance.
- [ ] **2.2 Define the daily data grain.** At minimum: date, page, query where allowed, channel, campaign, device, country/region, experiment, variant, and metric source.
- [ ] **2.3 Choose the MVP store.** Reuse the existing PsiAtiva database if suitable; otherwise use a small auditable store. Do not make a dashboard the only copy of the data.
- [ ] **2.4 Specify idempotent source tables.** Include source timestamp, ingestion timestamp, property ID, schema version, and a deterministic upsert key.
- [ ] **2.5 Build the n8n Search Console daily ingestion.** Capture page/query clicks, impressions, CTR, and average position with pagination and backfill support.
- [ ] **2.6 Build the n8n GA4 daily ingestion.** Capture landing sessions, engaged sessions, CTA starts, confirmed outcomes, and outcome rate by source/page/campaign/variant.
- [ ] **2.7 Add CWV/performance capture.** Schedule PageSpeed/CrUX for priority landing pages and store LCP, INP, CLS, and collection status.
- [ ] **2.8 Add technical SEO checks.** Monitor sitemap availability, canonical/robots regressions, unexpected `noindex`, broken primary links, and production build health.
- [ ] **2.9 Add freshness and completeness checks.** Alert on missing days, partial API responses, schema drift, duplicate rows, or an implausible drop to zero.
- [ ] **2.10 Create derived decision metrics.** Examples: organic CTR by query/page, outcome rate by landing/source, CTA-to-outcome drop-off, and CWV status by page.
- [ ] **2.11 Implement deterministic action rules first.** Every rule must include evidence, threshold, minimum sample, owner, priority, and recommended check.
- [ ] **2.12 Add grounded AI summarization second.** The model may group and explain rule outputs, but every statement must cite the underlying metric window and source.
- [ ] **2.13 Generate a weekly action artifact.** Include: observation, evidence, likely cause, recommended action, expected metric movement, owner, due date, and status.
- [ ] **2.14 Keep a decision log.** Record accepted/rejected recommendations and the later result so the system learns which actions were useful.
- [ ] **2.15 Create a lightweight dashboard.** Show decision metrics and data health, not a wall of pageviews.
- [ ] **2.16 Run the pipeline for at least seven consecutive scheduled days** before calling it reliable.
- [ ] **2.17 Establish the first real baseline window.** Business-performance goals stay unset until enough representative data exists.

### Initial action-rule backlog

- [ ] **High impressions + low CTR:** review title/meta and query intent; propose a snippet test.
- [ ] **Average position 4–20 + relevant intent:** strengthen the page, supporting content, and internal links.
- [ ] **Traffic stable + outcome rate down:** inspect CTA/form friction and deployment changes before changing acquisition.
- [ ] **CTA starts stable + confirmed outcomes down:** inspect the form/webhook/handoff, not the headline.
- [ ] **Poor CWV + outcome-rate loss on the same device/page:** prioritize the measured performance bottleneck.
- [ ] **Paid segment underperforms while organic is stable:** inspect message match, audience, and variant integrity.
- [ ] **Insufficient sample or stale data:** create a “wait/repair measurement” action, never an optimization claim.

## Phase 3 — A/B testing foundation

> **Benefit shipped:** variants can run without flicker, attribution loss, SEO duplication, or manual code forks.

- [ ] **3.1 Create `docs/experimentation.md`.** Define hypothesis, audience, unit of assignment, primary metric, guardrails, sample rule, stop rule, owner, and decision states.
- [ ] **3.2 Create a typed experiment registry.** Each experiment needs an ID, status, page, control, variants, allocation, start/end, and declared metrics.
- [ ] **3.3 Model reusable content slots.** Start with headline, supporting copy, hero image, CTA label, and CTA destination; keep layout/code shared.
- [ ] **3.4 Render each paid variant as complete static HTML** at a stable URL. Do not swap the hero after hydration.
- [ ] **3.5 Use the ad platform split for the MVP.** Point traffic at stable variant URLs; avoid building an edge allocator until volume proves it is needed.
- [ ] **3.6 Make experimental routes SEO-safe.** Use the intended canonical and `noindex`; exclude them from the sitemap.
- [ ] **3.7 Propagate `experiment_id` and `variant_id`** into every analytics event and the server-side lead envelope.
- [ ] **3.8 Preserve variant consistency** across the full journey without creating a cross-site identity profile.
- [ ] **3.9 Add an experiment preview/QA mode** that cannot contaminate production reporting.
- [ ] **3.10 Add a kill switch and control fallback.** Stopping an experiment must not require an emergency deploy.
- [ ] **3.11 Add experiment-aware data-quality checks.** Detect allocation imbalance, missing variant tags, event loss, sample-ratio mismatch, and broken routes.
- [ ] **3.12 Run an A/A test first.** Both variants must be identical; validate delivery, attribution, and analysis before testing persuasion.

### Phase 3 exit gate

- [ ] A/A traffic allocation matches the declared split within the predeclared tolerance.
- [ ] Event and confirmed-outcome counts reconcile by variant.
- [ ] Variant pages have no visible flicker and meet accessibility/performance checks.
- [ ] Search engines receive the intended canonical/noindex behavior.
- [ ] Preview, bot, internal, and QA traffic are excluded or clearly labeled.

## Phase 4 — First controlled A/B test

> **Benefit shipped:** the team can make one landing-page decision from observed behavior instead of preference.

- [ ] **4.1 Pick one page, one campaign, and one primary metric.**
- [ ] **4.2 Write a falsifiable hypothesis.** Change one variable first: headline, supporting copy, hero image, or CTA.
- [ ] **4.3 Build control and variant through the shared slot system.**
- [ ] **4.4 Run brand, CFP, accessibility, and offer checks** before exposure.
- [ ] **4.5 Pre-register the sample/stopping rule and guardrails.** Do not choose the rule after seeing the result.
- [ ] **4.6 Launch with a saved deploy/commit and verified allocation.**
- [ ] **4.7 Monitor data integrity and severe regressions only.** Do not repeatedly peek and call an early winner.
- [ ] **4.8 Analyze the declared primary metric, guardrails, and segments.**
- [ ] **4.9 Record the decision:** adopt, reject, iterate, or inconclusive.
- [ ] **4.10 Promote the winner to the canonical page and archive the variant** only after the decision is signed off.

## Phase 5 — Close the SEO ↔ experiment learning loop

- [ ] **5.1 Add experiment results to the weekly action artifact.**
- [ ] **5.2 Link every recommended test to the SEO/behavior evidence that created it.**
- [ ] **5.3 Track recommendation → experiment → decision → post-change result.**
- [ ] **5.4 Build an experiment ledger** with hypotheses, screenshots, dates, sample, result, and reusable learning.
- [ ] **5.5 Recalibrate action thresholds** from observed false positives/negatives.
- [ ] **5.6 Expand the slot library only when a real hypothesis needs it.**

---

## Definition of done for every release

- [ ] `npm run build` passes.
- [ ] Measurement and experiment contracts are versioned with the code.
- [ ] Production QA evidence is saved without secrets or PII.
- [ ] Error, empty-data, consent-denied, bot, and rollback paths were tested.
- [ ] The release ships a usable business benefit and updates this tracker.
- [ ] A retrospective re-cuts later scope before the next release begins.

## Open decisions — resolve when they become the next blocker

- Exact first paid landing page and its server-confirmed primary outcome.
- Existing data store versus a dedicated analytics schema.
- Dashboard and weekly notification destination.
- Minimum representative baseline window after real traffic starts.
- Whether Google Ads Experiments provides the initial split or campaigns/ad groups split stable URLs.
- When traffic volume justifies server-side allocation, a warehouse, or a paid experimentation tool.
