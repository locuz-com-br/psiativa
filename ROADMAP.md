# PsiAtiva Landing Page v2 — Responsive Roadmap

> **Plan of record for sequencing and scope.** Executable checkboxes live in [`TASKS.md`](TASKS.md). This roadmap was created on 2026-07-29 and should be re-cut after every release.

## Outcome and fixed frame

**Outcome:** before PsiAtiva pays for landing-page traffic, the team can trust where visitors came from, what they did, which page/variant they saw, whether a real outcome occurred, and what evidence-backed action should happen next. Once that foundation is proven, PsiAtiva can test copy, headlines, images, and CTAs without SEO damage or attribution ambiguity.

**Fixed deadline:** Releases 1 and 2 are a **pre-paid-campaign launch gate**. They must be complete before the first campaign spends money. Release 3 must be complete before any persuasive A/B test.

**Fixed capacity/budget:** implementation happens in the existing PsiAtiva build box (normally 60–90 minutes after 17:30, plus the Friday build window) and reuses GA4, Search Console, Clarity, n8n, and the current data stack. No paid CRO/BI platform is assumed.

**Open scope:** later features, integrations, and polish flex to fit that capacity. The deadline/gate and capacity do not expand to protect optional scope.

## Operating principles

1. **Measurement before optimization.** A new variant cannot repair unknown attribution.
2. **Outcomes over clicks.** Pageviews and CTA clicks diagnose the path; a confirmed lead or downstream qualified outcome measures success.
3. **Baseline before target.** No conversion, CTR, ranking, or CWV target is invented before representative data exists.
4. **Rules before AI.** Deterministic checks identify anomalies; AI may summarize grounded evidence but cannot manufacture certainty.
5. **Human approval before mutation.** The system creates action items, not autonomous site changes, ad-budget changes, or winners.
6. **Privacy by construction.** Analytics and replay never receive PII, survey answers, messages, or health-related data.
7. **Stable, complete variants.** Paid variants render as full static pages at stable URLs; no post-hydration hero swap or visible flicker.
8. **One hypothesis, one primary metric.** Multi-element concept tests are labeled as such and cannot claim which individual element caused the result.
9. **SEO and ICP boundaries stay intact.** Experimental pages are noindexed/canonicalized, and clinic/solo audiences remain separated.

## Measurement system: HEART × AARRR

The first baseline does not exist yet. Goals remain deliberately unset until the corresponding baseline window is captured.

| HEART dimension | One actionable signal | AARRR stage | Baseline | Indicator and decision | Goal |
|---|---|---|---|---|---|
| Happiness | Rage/dead-click rate on the primary task area | Activation | Baseline absent; instrument and observe | If friction clusters on one element/variant, inspect UI clarity and behavior | Set after representative baseline |
| Engagement | Engaged-session rate by landing page/source/variant | Activation | Baseline absent; verify GA4 first | Tests whether message match earns meaningful attention | Set after representative baseline |
| Adoption | Primary CTA or form-start rate per eligible landing session | Activation | Baseline absent; standardize events first | Decides whether to test the proposition/CTA or repair acquisition targeting | Set after representative baseline |
| Retention | Anonymous 7-day return rate for non-converting visitors | Retention | Baseline absent; confirm consent-safe feasibility | Decides whether follow-up content/remarketing deserves attention | Set after representative baseline |
| Task Success | Server-confirmed primary outcomes per eligible landing session | Revenue | Baseline absent; define the outcome first | Selects winners and exposes CTA-to-backend leakage | Set after representative baseline |

**Vanity guardrail:** raw pageviews, total impressions, total clicks, and average position are context, not success metrics. They only survive in a report when paired with a decision, segment, and downstream outcome.

### Initial OKR

**Objective:** enter paid acquisition with a trustworthy learning system instead of buying ambiguous traffic.

The business-performance KRs are intentionally deferred until the baseline exists. The readiness KRs for the pre-campaign gate are:

1. Every declared QA journey produces one reconciled event chain with source, landing page, campaign, and experiment context, with no PII.
2. Seven consecutive scheduled daily ingestions complete with freshness/completeness checks, followed by one evidence-backed weekly action report.
3. An A/A test passes its predeclared allocation, attribution, and event-parity checks before any persuasive A/B test starts.

## Ordered releases

| Release | Benefit shipped | Core scope | Riskiest assumption retired | Exit gate |
|---|---|---|---|---|
| **1. Trusted measurement** | Paid traffic can be traced to a real outcome safely | Measurement contract, event/CTA/page IDs, attribution persistence, consent/privacy QA, GA4/GSC setup | Existing client + backend paths can produce one reconcilable funnel | All Phase 1 gates in `TASKS.md` pass |
| **2. Automated SEO operating loop** | A weekly artifact converts source data into owned, evidence-backed actions | Scheduled GSC/GA4/CWV capture, durable store, freshness checks, deterministic rules, grounded summary | The sources can be joined consistently enough to support decisions | 7 consecutive healthy runs + first reviewed report |
| **3. Experiment foundation + A/A** | Variants can be delivered and measured without flicker, leakage, or SEO duplication | Typed registry, shared content slots, stable paid URLs, variant propagation, kill switch, A/A | Delivery and attribution do not bias a result before persuasion changes | A/A and SEO/privacy/performance gates pass |
| **4. First A/B decision** | One real page decision is made from observed behavior | One page, one hypothesis, one primary metric, predeclared stop rule, recorded decision | Available traffic can support a useful comparison | Adopt/reject/iterate/inconclusive decision recorded |
| **5. Learning loop at scale** | SEO observations create testable hypotheses and experiment results improve future recommendations | Action-to-experiment linkage, ledger, threshold calibration, selective slot expansion | Repeated learning produces more value than the operating cost | Retrospective demonstrates useful decisions, then scope is re-cut |

## Detailed next increment — Release 1

Release 1 is the only increment planned in implementation detail. Its checklist is [`TASKS.md` Phase 0–1](TASKS.md#phase-0--fix-the-measurement-frame).

### It ships

- A versioned measurement contract.
- Stable page, CTA, campaign, and attribution context.
- Server-confirmed conversion semantics and deduplication.
- Search Console and GA4 production verification.
- Consent and no-PII evidence across all live capture surfaces.
- A runbook that another session can use to diagnose missing or duplicate data.

### It does not ship

- A dashboard redesign.
- AI-generated recommendations.
- A/B routing.
- A paid data warehouse or experimentation vendor.
- A performance or copy optimization made without a baseline.

### Release 1 acceptance

1. Direct, organic, paid-tagged, WhatsApp, success, failure, mobile, and consent-denied journeys have saved QA evidence.
2. One real server-confirmed outcome reconciles with the client event and lead record.
3. Attribution survives from landing through the handoff without PII in analytics.
4. Duplicate conversion paths are eliminated or explicitly documented.
5. The exact metrics needed by Release 2 have owners and source definitions.

## Experiment policy

- **MVP assignment:** use the ad platform to split traffic across stable variant URLs. This matches the static Astro deployment and avoids client-side flicker.
- **Variant representation:** keep layout and behavior shared; variants override typed content slots such as headline, supporting copy, hero image, and CTA.
- **SEO:** paid experiment routes stay out of the sitemap and receive the intended canonical plus `noindex`.
- **Attribution:** `experiment_id` and `variant_id` travel with every event and the server-side outcome.
- **Pre-registration:** hypothesis, primary metric, guardrails, allocation, minimum sample rule, stop rule, and owner are fixed before launch.
- **Validity:** run A/A first; flag sample-ratio mismatch, missing tags, bot/internal traffic, and broken variants.
- **Decision:** every test ends as adopt, reject, iterate, or inconclusive. “No result” is a valid result.
- **Promotion:** a winner becomes canonical only after human review; the losing variant is archived with its learning.

## Triangulation: what, why, and how

| Signal | Analytics answers “what?” | Research answers “why?” | Test answers “how?” |
|---|---|---|---|
| Low organic CTR | Query/page impressions and CTR fell below its own baseline | Search intent and snippet review show a mismatch | Test title/meta on an eligible page |
| Low CTA/form start | Attention exists but intent action is weak | Clarity and message review locate hesitation or confusion | Test one proposition, headline, or CTA hypothesis |
| High start, low confirmed outcome | The leak is after intent | Form QA, error logs, and handoff review locate friction/failure | Repair the task first; test persuasion only afterward |
| Variant outcome gap | One stable variant outperformed on the declared metric | Qualitative review explains likely message/image response | Replicate or isolate the suspected mechanism in a later test |
| CWV/device gap | Performance and outcomes move together on a segment | Trace/waterfall identifies the bottleneck | Ship the performance fix and compare against baseline |

No single source authorizes a change by itself.

## Review and re-plan cadence

- **Daily, automated:** ingestion, freshness, completeness, schema, and anomaly checks.
- **Weekly, human-reviewed:** one action report; accept, reject, or defer each recommendation and assign an owner.
- **After every release:** retrospective on benefit shipped, data quality, operating cost, and the riskiest remaining assumption. Re-cut the next release.
- **Per experiment:** pre-registration → launch QA → integrity-only monitoring → final analysis → archived decision.
- **Monthly once traffic exists:** recalibrate thresholds and remove rules that create noise.

Later releases stay coarse until the prior retrospective supplies real evidence.

## Deferred / v2+ scope

| # | Item | Why deferred |
|---|---|---|
| R1 | Edge/server-side random assignment | Stable ad-platform variant URLs are cheaper and less risky for the static MVP |
| R2 | Multivariate testing | Requires much more traffic and makes causal interpretation harder |
| R3 | Automated traffic allocation/bandits | Optimizes during the test but complicates inference and governance |
| R4 | Personalization by audience/profile | Raises privacy, maintenance, and sample-fragmentation costs |
| R5 | Dedicated warehouse + BI suite | Add only when the small auditable store becomes a measured bottleneck |
| R6 | Paid CRO platform | The MVP must first prove recurring experiment volume and operating value |
| R7 | Server-side/enhanced ad conversions | Requires a separate consent, identity, and legal review |
| R8 | Automatic GitHub/task creation | Begin with a reviewed weekly artifact; automate external writes only after precision is proven |
| R9 | Autonomous copy publishing or budget changes | Remains human-controlled even if recommendation quality improves |
| R10 | Cross-device/person identity stitching | Not needed for the initial page-level decisions and carries privacy cost |

## Out of scope

- Patient-facing clinical analytics or storing sensitive health information.
- Replacing the sales/lead source of truth with GA4.
- Testing multiple ICPs inside one page or result.
- Rewriting the locked offer, guarantee, or price through an experiment.
- Treating SEO position, traffic, or click volume alone as proof of business impact.
- Building optional tooling during protected commercial hours.
