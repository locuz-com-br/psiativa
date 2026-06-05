# Relatório SEO — landing-page-v2 (psiativa.com.br)

> Gerado: 2026-06-03 | Agente: `psiativa-seo-auditor` | Alvo: `workspace/psiativa/projects/landing-page-v2` (Astro 6, SSG)
> Tipo: **Astro local** (sem node_modules → sem build/Lighthouse) | ICP da home: **Perfil A — Clínica**
> Saída: `landing-page-v2/seo/reports/audit-landing-page-v2-2026-06-03.md`
> **SEO Score: ~40/100** (normalizado sobre as 9 categorias medíveis; **CWV não medido** — rodar PSI no deploy) · **GEO: ~25/100**

---

## Resumo executivo

A LP é um **template de marketing pré-lançamento sem fiação de SEO**. A base de HTML/semântica é boa (1 `<h1>`, `lang`, `<main>`, copy real no SSG), mas **falta toda a camada de indexação** (sem `site:`, sem sitemap, sem robots, sem canonical) e **toda a camada de dados estruturados** (zero JSON-LD). Por isso o site **não aparece indexado**. A boa notícia: os P0 são **wires rápidos** (skill `astro-seo`), de alta alavancagem, e **destravam também o briefing da calculadora** ([`seo-briefing-roi-calculator.md`](../../../n8n_workflows/plans/seo-briefing-roi-calculator.md)) — sem eles, nenhuma página nova ranqueia.

**Top 5 críticos (P0 — antes/no lançamento):**
1. `astro.config.mjs` **sem `site:`** → `Astro.url` não resolve absolutos, sitemap quebra.
2. **Sem sitemap** (`@astrojs/sitemap` ausente).
3. **Sem `robots.txt`** em `public/`.
4. **Sem `<link rel="canonical">`** no `BaseLayout`.
5. **`<title>` da home = a `description` inteira** (~165 ch) — não-otimizado, longo demais.

**Top 5 quick wins:**
1. Adicionar `site:` + `@astrojs/sitemap` (2 linhas) → sitemap automático.
2. `public/robots.txt` estático com `Sitemap:` + liberar crawlers de IA.
3. Title da home ≤60 ch, frame Clínica: *"Captação ética para clínica de psicologia | PsiAtiva"* (~52).
4. `og:image` + `twitter:image` (criar `og-default.png` 1200×630) — o card já promete imagem que não existe.
5. **Tornar a FAQ visível sem JS** (texto no SSG) → habilita `FAQPage` (maior ativo citável por IA).

---

## Score por categoria

| # | Categoria | Peso | Nota | Status | Evidência |
|---|---|---|---|---|---|
| 1 | Indexabilidade | 12 | 2/12 | ❌ | Sem `site:`, sem sitemap, sem robots.txt, sem canonical. HTTPS ✓, SSG ✓. Não indexado. |
| 2 | Core Web Vitals | 15 | **n/d** | ⏸️ | Sem node_modules → sem Lighthouse. Riscos: Google Fonts render-blocking, fontes `.otf/.ttf` (não woff2), islands React. Rodar PSI no deploy. |
| 3 | Schema (JSON-LD) | 10 | 0/10 | ❌ | **Zero** structured data. Sem `Organization`/`WebSite`, sem `FAQPage` (há FAQ), sem `Review`/`AggregateRating` (há depoimentos + stats). |
| 4 | Meta | 10 | 4/10 | ⚠️ | `description` ✓; **title da home = description** (P1); OG sem `image`/`url`/`site_name`; `twitter:card=summary_large_image` **sem** `twitter:image`. |
| 5 | Semântica HTML | 10 | 8/10 | ✅ | `<html lang="pt-BR">`, `<main>`, 1 `<h1>`/página, landmarks via componentes. |
| 6 | Links internos | 8 | 5/8 | ⚠️ | Single-page (âncoras `#`) + legais. Sem cluster/contextuais ainda (esperado pré-blog). |
| 7 | Imagens | 8 | 3/8 | ⚠️ | Tudo `<img>` cru (sem `astro:assets`) → sem width/height (CLS) nem webp/avif. `alt=""` nas fotos de depoimento. |
| 8 | Conteúdo | 12 | 7/12 | ⚠️ | Copy real no SSG (hero/about/features ✓). **FAQ renderiza vazia sem JS** (P1). i18n single-URL → só PT indexável. |
| 9 | GEO / busca por IA | 10 | 2/10 | ❌ | Sem `llms.txt`; crawlers de IA **não rodam JS** → FAQ e futuras islands invisíveis; sem TL;DR/bloco citável; sem `FAQPage`/`Person`. |
| 10 | Acessibilidade | 5 | 3/5 | ⚠️ | `aria-expanded` na FAQ ✓; `alt=""` em foto de autor (perde E-E-A-T/SR); contraste do sage `#7EAE89` a verificar. |

> Normalização: 34 pts ganhos ÷ 85 medíveis ≈ **40/100**. CWV (15) excluído por não medido — **não penaliza** (rodar PSI/Lighthouse no deploy com `PAGESPEED_API_KEY`).

---

## GEO / busca por IA

- **Acesso de crawlers** (GPTBot · OAI-SearchBot · ClaudeBot · PerplexityBot · Google-Extended): sem `robots.txt` → **liberado por omissão** (ok), mas sem controle explícito. Adicionar robots com `Allow` para os de busca.
- **SSR / JS:** crawlers de IA **não executam JS**. A home renderiza copy real no SSG (hero/about/features **são** citáveis ✓), **mas a FAQ é injetada client-side** (`<span data-i18n=...></span>` vazio) → o ativo mais citável (Q&A) é **invisível** para IA. ⚠️ Mesma armadilha vale para as **islands futuras (calculadora/quiz)**: precisam ser *static-first*.
- **Sem `llms.txt`**, sem TL;DR/bloco citável de 134–167 palavras, sem `FAQPage`/`Person` schema.

---

## Local / GBP

PsiAtiva é **consultoria B2B remota**, não clínica de atendimento — então **`Organization`/`ProfessionalService`** é o schema certo, **não** `LocalBusiness`/`MedicalOrganization`, e **GBP é baixa prioridade** aqui. ⚠️ Não confundir com os **sites dos clientes psicólogos**, onde GBP + `LocalBusiness` + **CRP credential** são críticos (ver skill `google-list-pro` + `seo-framework-playbook`). A regra "CRP credential obrigatório" **não se aplica** a esta página corporativa (PsiAtiva não é registrada no CRP) — aplica-se às páginas de profissionais.

---

## Canibalização & saúde de cluster

- Hoje é **single-page** (home) + legais → sem canibalização interna.
- **Consistente com o briefing da calculadora:** a home é **Perfil A — Clínica** (marca/conversão); a calculadora será **Perfil B — Solo** (informacional/topo). Frames separados → **sem disputa de termo**. Manter essa divisão quando calculadora/quiz entrarem (satélites → home como pilar de conversão, com canonical próprio).
- Antes de publicar páginas novas: os P0 de indexabilidade são **pré-requisito** — caso contrário nada (home, calculadora, quiz) ranqueia.

---

## Plano de ação priorizado

### P0 — bloqueia indexação (fazer antes/no lançamento) · fonte: skill `astro-seo`
- **`site: 'https://psiativa.com.br'`** em `astro.config.mjs` — esforço: baixo — sem isso sitemap/absolutos quebram (Consciência impossível).
- **`@astrojs/sitemap`** (`npx astro add sitemap`) — baixo — gera `sitemap-index.xml`.
- **`public/robots.txt`** estático (`Allow: /`, `Sitemap:`, liberar GPTBot/ClaudeBot/PerplexityBot) — baixo.
- **`<link rel="canonical">`** no `<head>` via `new URL(Astro.url.pathname, site)` — baixo — evita duplicação e prepara páginas novas.
- **Title da home ≤60 ch** (parar de usar `description` como title): *"Captação ética para clínica de psicologia | PsiAtiva"* — baixo.
- ▶️ **Recomendado:** extrair um componente **`SEOHead.astro`** (padrão `astro-seo`) centralizando title/canonical/OG/Twitter/JSON-LD — hoje está inline e incompleto no `BaseLayout`.

### P1 — impacto de ranqueamento / citação
- **FAQ visível sem JS:** inline do texto PT como fallback dentro dos `data-i18n` (como o Hero já faz) **ou** resolver tradução em build → depois adicionar **`FAQPage` JSON-LD**. Ganho duplo: visível à IA + rich result.
- **Dados estruturados:** `Organization` + `WebSite` (SearchAction) sitewide; `FAQPage` na home; `BreadcrumbList` nas legais. (PsiAtiva = `Organization`, **não** MedicalOrganization.)
- **OG/Twitter image:** criar `public/og-default.png` (1200×630) + `og:image`/`twitter:image`/`og:url`/`og:site_name`.
- **Imagens → `astro:assets <Image>`:** width/height (CLS) + webp/avif; corrigir `alt=""` das fotos de depoimento (usar o nome — E-E-A-T).
- **Disciplina de island (GEO):** garantir que calculadora/quiz entreguem conteúdo **static-first/SSR** (a FAQ é o canário) + um **TL;DR citável** na home.

### P2 — otimização (backlog)
- Páginas legais herdam a `description` default → dar `description` única a cada uma.
- **i18n:** swap por `navigator.language` em URL única → só PT indexável, EN sem URL/hreflang. Se EN importa: rotas por locale + `hreflang`. Se não importa: simplificar (lang estável, sem swap).
- **`llms.txt`** na raiz (peso baixo) quando o conteúdo estabilizar.
- **Perf:** self-host Source Serif 4 (tirar Google Fonts render-blocking), servir woff2, hospedar bandeiras localmente; medir CWV via PSI pós-deploy.
- **Medição:** GA/Clarity vazios → ligar Search Console primeiro; amarrar métricas ao estágio GAP.

---

## Guardrails (passe do auditor)
- **Nenhuma recomendação publica preço/garantia.** A FAQ q7 ("Qual o investimento") permanece **gated** ✓ — não recomendo adicionar preço.
- ⚠️ **Stats da home (-52% faltas · +3x · 93% renovam) + depoimentos:** são claims B2B da PsiAtiva (não clínicos de paciente). Encaminhar a `cfp-compliance` (passe **light**: sem promessa de resultado/sensacionalismo) e **verificar substanciação** (honestidade publicitária CDC). Se algum virar promessa/garantia → `offer-guardian`.
- **Um ICP:** recomendações de copy mantêm o frame **Clínica** da home.

## Próximos passos
- Lacunas de conteúdo (cluster Perfil B, blog) → `psiativa-seo-briefer`.
- Stats/depoimentos → `cfp-compliance` (light) + substanciação.
- Implementar os P0 → tarefa de build (não é deste relatório; o auditor é report-only). Reauditar pós-fix + rodar Lighthouse/PSI no deploy.

```
TARGET: landing-page-v2 (psiativa.com.br)  ·  TYPE: Astro local  ·  ICP: A (clínica)
SEO SCORE: ~40/100 (CWV n/d — pendente PSI)   GEO: ~25/100
TOP P0: 1) sem site: 2) sem sitemap 3) sem robots.txt 4) sem canonical 5) title=description
QUICK WINS: 1) site:+sitemap 2) robots.txt 3) title ≤60 4) og/twitter image 5) FAQ no SSG → FAQPage
SAVED: landing-page-v2/seo/reports/audit-landing-page-v2-2026-06-03.md
NEXT: P0 são pré-requisito p/ a calculadora/quiz ranquearem; reauditar pós-fix + PSI no deploy
```
