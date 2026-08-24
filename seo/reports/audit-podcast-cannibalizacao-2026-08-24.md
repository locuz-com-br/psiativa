# Relatório SEO — `/podcast/` (psiativa.com.br) · escopo: canibalização, saúde de cluster e diluição de entidade

> Gerado: 2026-08-24 | Alvo: `https://psiativa.com.br/podcast/` (hub + 8 episódios) | Tipo: **URL externa ao vivo + fonte Astro local**
> Fonte: `workspace/psiativa/projects/landing-page-v2/` · ICP do cluster comercial: **B — consultório solo** (blog 4/4) e **A — clínica** (home)
> Saída: `workspace/psiativa/projects/landing-page-v2/seo/reports/audit-podcast-cannibalizacao-2026-08-24.md`
> **SEO Score da seção /podcast/: 56/100** (normalizado sobre 85 pts mensuráveis; **CWV não medido** — mesma convenção do relatório de 2026-06-03) · **GEO: 30/100** · Lighthouse: **não medido**
> Gate retroativo: esta seção subiu em 2026-08-24 sem passar por `psiativa-seo-briefer`.

---

## Resumo executivo

**Veredito: (c) diluição de entidade — confirmada. (b) canibalização de query — medida e descartada. (a) separação inofensiva — descartada.**

As duas bases de conteúdo são **lexicalmente disjuntas**: nenhum dos 11 termos-cabeça comerciais aparece no corpus do podcast, e nenhum dos 6 termos do podcast aparece no blog. Não existe par query→URL em disputa. O problema é outro e é mais fundo: **o site agora declara, em dados estruturados, que "PsiAtiva" é um programa de psicologia para pacientes — em exatamente o mesmo número de URLs em que declara que "PsiAtiva" é uma organização.** Empate técnico, 9 a 9, sobre o significado do próprio nome da marca.

**A boa notícia dita antes da má:** o dano ainda **não aconteceu**. O índice do Bing hoje traz 5 URLs de psiativa.com.br, todas comerciais, **zero do podcast** — a seção tem 0 dia de vida. Isto não é um resgate, é uma correção preventiva. E a causa-raiz é **um único token** no código.

**Top 5 críticos (P0):**
1. `PodcastSeries.name = "PsiAtiva"` em 9 URLs vs. `Organization "PsiAtiva"` em 9 URLs — duas definições concorrentes do mesmo nome de marca (§4.1).
2. `<h1>PsiAtiva</h1>` no hub — o sinal on-page mais forte de uma página voltada a pacientes é o nome comercial puro, seguido de `<h2>Loivani Venturin Körner</h2>` (§4.2).
3. `worksFor: Organization PsiAtiva` numa psicóloga com CRP + `publisher: PsiAtiva` num programa de saúde mental para pacientes = o grafo diz "consultório", não "assessoria" (§4.3).
4. `/podcast/` recebe **18** links internos sitewide; `/calculadora/` e `/quiz/` recebem **3 cada** (§5.1).
5. `robots.txt` ao vivo contém bloco **Cloudflare Managed** que faz `Disallow: /` para GPTBot, ClaudeBot, Google-Extended e CCBot **antes** do bloco do repositório que os libera (§6) — fora do escopo do podcast, mas é P0 do site.

**Top 5 quick wins:**
1. Renomear a série em `src/config/podcast.config.ts:11` — um token corrige H1, `<title>`, `PodcastSeries.name` e `partOfSeries` de 8 páginas de uma vez.
2. Trocar os links do rodapé `/podcast` e `/blog` por `/podcast/` e `/blog/` — hoje ambos são **301 em todas as 18 páginas** do site.
3. Adicionar `author` + `publisher` ao schema dos episódios (hoje: nenhum autor, nenhum CRP nas 8 páginas de episódio).
4. Subir `/calculadora/` e `/quiz/` para o rodapé ou para o corpo dos posts — hoje ficam abaixo do podcast em links internos.
5. `og:image` dos episódios aponta para CloudFront de terceiro (`d3t3ozftmdmh3i…`) em 8 URLs — trocar por ativo próprio.

---

## Score por categoria — seção `/podcast/`

| # | Categoria | Peso | Nota | Status | Evidência |
|---|---|---|---|---|---|
| 1 | Indexabilidade | 12 | 10/12 | ✅ | Sitemap com 25 URLs, 9 do podcast; canonicais absolutos e corretos; `index, follow`; `hubOnly` (ep00, ep06) retornam **404 verificado**. −2: links do rodapé `/podcast` e `/blog` sem barra final → **301 em todas as páginas**. |
| 2 | Core Web Vitals | 15 | **n/d** | ⏸️ | **Não medido** — Lighthouse/PSI não executados. Sinais estruturais bons: HTML estático 47–52 KB, `preload="none"` nos players, `width`/`height` em 7/7 imagens. Rodar PSI antes de afirmar qualquer número. |
| 3 | Schema | 10 | 4/10 | ❌ | Hub isolado é bom (PodcastSeries + Person + `EducationalOccupationalCredential` CRP 12/19699 + Breadcrumb). Mas: **episódios sem `author`, sem `publisher`, sem credencial**; e `PodcastSeries.name` colide com o nome da `Organization` (§4.1). |
| 4 | Meta | 10 | 7/10 | ⚠️ | `<title>`, `description`, canonical absoluto e OG presentes e corretos em 9/9. −3: `og:image` hotlinkado de CloudFront de terceiro em 8 URLs; `<title>` do hub abre com o token de marca. |
| 5 | Semântica HTML | 10 | 6/10 | ⚠️ | `lang="pt-BR"`, 1 `<h1>`/página, landmarks `main`/`nav`/`header`/`footer` ✓. −4: `<h1>` do hub é **"PsiAtiva"** — não descritivo e colidente (§4.2). |
| 6 | Links internos | 8 | 2/8 | ❌ | Seção é **beco sem saída**: 0 links para `/calculadora/`, `/quiz/` ou `/analise-de-site-para-psicologo/`. Âncora `"Ler a transcrição →"` duplica cada link do hub com texto genérico. |
| 7 | Imagens | 8 | 6/8 | ⚠️ | `alt` 7/7, `width`+`height` 7/7, `loading` correto (capa `eager` = LCP). −2: capa hospedada em CDN de terceiro, sem controle de formato/peso. |
| 8 | Conteúdo | 12 | 6/12 | ⚠️ | 8.477 palavras originais publicadas, auditadas em CFP 06/2019, autora real com CRP = E-E-A-T legítimo. Mas 100% fora do cluster comercial e **59% do corpus** do site (§4.4). Corpo dos episódios: **1 heading** (`## Transcrição`) e 27 parágrafos sem estrutura. |
| 9 | GEO | 10 | 3/10 | ❌ | SSR confirmado (conteúdo presente no HTML bruto, sem JS) ✓. `llms.txt` → **404**. `robots.txt` contraditório (§6). Zero blocos citáveis de 134–167 palavras, zero `FAQPage` em URL de podcast, sem abertura definition-first. |
| 10 | Acessibilidade | 5 | 4/5 | ✅ | `lang`, landmarks, `alt` em todas as imagens, `aria-label` no badge do Spotify. Contraste e foco **não medidos**. |

> Normalização: 48 pts ganhos ÷ 85 mensuráveis ≈ **56/100**. CWV (15) excluído por não medido — **não penaliza**, seguindo a convenção do relatório de 2026-06-03.

---

## 1. O que foi verificado ao vivo — CONFIRMADO

Tudo abaixo veio de requisição real a `psiativa.com.br` em 2026-08-24, com HTML bruto (não convertido), preservando `<head>` e JSON-LD.

| Verificação | Resultado |
|---|---|
| Hub + 8 episódios + home + blog + 3 páginas comerciais | **HTTP 200**, 19 URLs buscadas |
| `sitemap.xml` | 200 · **25 URLs** · 9 do podcast · `hubOnly` corretamente ausentes |
| `robots.txt` | 200 · **contraditório** (§6) |
| `llms.txt` | **404** |
| `/podcast/ep00-bem-vindos/`, `/podcast/ep06-o-que-tem-na-sua-xicara/` | **404** — a decisão `hubOnly` está funcionando |
| `<head>` renderizado vs. fonte | **bate** em 9/9 URLs de podcast |
| SSR | **confirmado** — 1.820 palavras visíveis no HTML bruto do ep03, sem executar JS |
| Canonicais | absolutos, autorreferentes, corretos em 9/9 |
| `PodcastSeries` name/description | `"PsiAtiva"` / `"…Emoções, relacionamentos, comportamento e saúde mental."` |
| CRP 12/19699 no HTML | hub ✓ · episódios ✓ · **home ✗ · blog ✗** |
| Apple Podcasts `id1679960852` | **200, título da página: "PsiAtiva - Podcast - Apple Podcasts"**, categoria Science → Social Sciences |
| RSS `<link>` canônico do programa | `podcasters.spotify.com/pod/show/loivani-venturin` (não psiativa.com.br) |

**Uma correção a um fato herdado.** O `MEMORY.md` registra "zero links para o funil (verificado no DOM)" nas páginas de episódio. Isso é verdade **para o corpo do artigo** e falso para a página inteira: cada página de episódio carrega **4 CTAs de WhatsApp** `wa.me/5521979907947` com a mensagem pré-preenchida da PsiAtiva (2 no header/nav mobile, 2 no rodapé). O que não existe é CTA contextual no corpo. A distinção importa para o item 4 dos remédios.

---

## 2. Canibalização de query — MEDIDA, não presumida

### 2.1 O que o instrumento conseguiu ler

`site:psiativa.com.br` no Bing (mkt pt-BR, 2026-08-24) → **"Sobre 5 resultados"**, todos comerciais:

| # | URL indexada | `<title>` indexado |
|---|---|---|
| 1 | `https://psiativa.com.br/` | Captação ética para clínicas de psicologia \| PsiAtiva |
| 2 | `https://psiativa.com.br/calculadora/` | Calculadora: quanto a agenda vazia custa ao psicólogo \| PsiAtiva |
| 3 | `https://psiativa.com.br/blog/agenda-previsivel-psicologa-autonoma/` | Agenda previsível para psicóloga autônoma \| PsiAtiva |
| 4 | `https://psiativa.com.br/quiz/` | Diagnóstico: onde a sua agenda está vazando? \| PsiAtiva |
| 5 | `https://psiativa.com.br/blog/whatsapp-consultorio-solo/` | WhatsApp para consultório solo \| PsiAtiva |

**Zero URLs de podcast indexadas.** A seção tem 0 dia. **A janela para corrigir sem custo está aberta agora.**

### 2.2 Sobreposição léxica entre os dois corpora

Contagem de ocorrências nos textos-fonte (frontmatter removido), 10 episódios vs. 4 posts:

| Termo-cabeça comercial | Podcast | Blog | | Termo do podcast | Podcast | Blog |
|---|---:|---:|---|---|---:|---:|
| captação / captar | **0** | 2 | | autoconhecimento | 24 | **0** |
| agenda previsível | **0** | 9 | | inteligência emocional | 24 | **0** |
| agenda vazia | **0** | 6 | | autoestima | 26 | **0** |
| consultório | **0** | 7 | | autossabotagem | 8 | **0** |
| sessão | **0** | 18 | | procrastinação | 8 | **0** |
| WhatsApp | **0** | 14 | | saúde mental | 10 | **0** |
| Google | **0** | 19 | | | | |
| previsibilidade | **0** | 2 | | | | |
| no-show | **0** | 0 | | | | |
| paciente | 1 | 15 | | | | |
| clínica | 1 | 6 | | | | |

**Conclusão: canibalização de query = ZERO.** Não há par query→URL em disputa porque os dois corpora não compartilham vocabulário-alvo. Um episódio sobre autoestima não pode deslocar `/blog/agenda-vazia-psicologa/` — ele não contém nenhum dos termos daquela consulta.

**Uma exceção de sobreposição semântica, não de query:** a palavra **"processo"** — termo de posicionamento assinado da PsiAtiva ("assessoria de processo") — aparece **21× no podcast** (sentido terapêutico: "processo de autoconhecimento") contra **9× no blog** (sentido comercial). O corpus do site agora define "processo" majoritariamente no sentido errado, numa proporção de 2,3:1. Isso não muda ranking de query; alimenta o §4.

### 2.3 O que NÃO foi possível verificar — dito sem inferência

- **Posição em SERP do Google no Brasil: NÃO VERIFICADA.** O `WebSearch` disponível é de índice/locale US, não honra o operador `site:`, e não retornou psiativa.com.br para nenhuma consulta — nem de marca, nem comercial, nem do podcast. Não tenho instrumento para ler o SERP brasileiro nesta sessão.
- **Consulta de marca "PsiAtiva": NÃO VERIFICADA.** A rota alternativa (Bing pt-BR) devolveu resultados não relacionados para consultas em texto livre; só o operador `site:` respondeu de forma confiável. Não reporto posição de marca como achado.
- **Índice do Google (vs. Bing): NÃO VERIFICADO.** O `site:` acima é do índice do **Bing**. O do Google exigiria Search Console.
- **Core Web Vitals / Lighthouse: NÃO MEDIDOS.**
- **Impressões, cliques e canibalização real por consulta:** só o Search Console responde. Recomendo abrir o relatório de Desempenho filtrado por `/podcast/` daqui a 30 dias.

---

## 3. Veredito sobre a pergunta central

**(a) separação inofensiva de público — DESCARTADO.** Seria verdade se os sinais de entidade estivessem separados. Eles não estão: o podcast reutiliza o nome comercial no `<h1>`, no `<title>`, no `PodcastSeries.name` e no `partOfSeries` de todas as páginas.

**(b) canibalização de query — DESCARTADO com medição** (§2.2). Corpora disjuntos, zero termos-cabeça em comum, zero URLs indexadas.

**(c) diluição de entidade — CONFIRMADO.** É este o risco real, e ele não depende de volume de consultas: depende de a qual entidade o Google resolve o token "PsiAtiva".

---

## 4. Diluição de entidade — a evidência

### 4.1 Duas definições concorrentes do mesmo nome, 9 a 9

Contagem por URL sobre as 19 páginas buscadas ao vivo:

| Afirmação em JSON-LD | URLs | Quais |
|---|---:|---|
| `Organization` chamada **"PsiAtiva"** | **9** | home, calculadora, quiz, analise, blog×4, **hub** |
| `PodcastSeries` chamada **"PsiAtiva"** | **9** | **hub**, ep01, ep02, ep03, ep04, ep05, ep07, ep08, ep09 |

Empate. E o hub afirma **as duas coisas na mesma página**. A descrição legível por máquina da `PodcastSeries` chamada "PsiAtiva" é:

> "Um espaço para falar sobre Psicologia de forma leve, humana e sem complicações. Emoções, relacionamentos, comportamento e saúde mental."

Zero menção a psicólogos, clínicas, consultório, agenda ou captação. É uma definição 100% voltada a pacientes — do token que também nomeia a assessoria.

### 4.2 A estrutura de headings do hub

```
H1  PsiAtiva
H2  Loivani Venturin Körner          (psicóloga · CRP 12/19699)
H2  Recomeçar também é voltar para si
H2  Todos os episódios
H3  Como desenvolver a Inteligência Emocional?  … (mais 8 títulos de episódio)
```

Lido por um parser, esse é o padrão canônico de **página de um consultório de psicologia de uma clínica chamada Loivani** — não de uma assessoria. `src/pages/podcast/index.astro:42` emite `<h1>{PODCAST.name}</h1>`, e `PODCAST.name` é literalmente `"PsiAtiva"`.

### 4.3 O grafo de entidade que o site publica hoje

De `src/lib/schema.ts:183` e `:218`, renderizado ao vivo:

- **PsiAtiva** (`Organization`) **emprega** (`worksFor`) **Loivani Venturin Körner**, psicóloga clínica com **CRP 12/19699** reconhecido pelo **CFP**.
- **PsiAtiva** (`Organization`) **publica** (`publisher`) um programa de **saúde mental voltado a pacientes**.
- A credencial CRP renderiza em **9 URLs de podcast e em nenhuma outra página do site** — home e blog não têm `Person` nem credencial.

Somados, esses três sinais descrevem uma **prática de psicologia**, não uma assessoria de processo de captação. É exatamente a leitura que `positioning.md` classifica como o que a PsiAtiva **não é** ("Consultoria de gestão clínica" / prática clínica).

### 4.4 Proporção de corpus — o número que corrige a decisão registrada

Palavras visíveis renderizadas ao vivo, descontado o *chrome* compartilhado (89 palavras: 14 de nav + 75 de rodapé, medido por prefixo/sufixo comum entre duas páginas distintas):

| Grupo | URLs | Palavras | Share |
|---|---:|---:|---:|
| **Podcast** (hub + 8 episódios) | 9 | **9.567** | **59,0%** |
| Comercial (home, calculadora, quiz, análise) | 4 | 3.924 | 24,2% |
| Blog (cluster Perfil B) | 5 | 2.730 | 16,8% |
| **Total indexável relevante** | 18 | 16.221 | 100% |

- Podcast = **2,44×** as páginas de conversão somadas.
- Podcast = **1,44×** todo o corpus comercial (páginas + blog).
- Por palavras de fonte: podcast publicado **8.477** vs. blog inteiro **2.566** = **3,3× o blog**.

**Isto revisa — não contradiz — a decisão registrada no `MEMORY.md` do podcast.** A memória diz: *"Estimei 40–70k palavras (~10× o corpus do site) e o real é 8.833 (~2 posts de blog)."* O numerador está certo; o denominador é que estava errado. O corpus comercial do site não tem dezenas de milhares de palavras — tem **6.654 renderizadas**. E "~2 posts de blog" subestima: o blog inteiro, os 4 posts, soma 2.566 palavras. A regra que a memória manteve ("o que importa não é o volume, é o público") continua correta; o que muda é que **o volume também virou majoritário**, e por isso o público passou a definir a maioria do corpus.

### 4.5 Corroboração externa já existente

`podcasts.apple.com/us/podcast/psiativa/id1679960852` está **no ar, HTTP 200**, com `<title>` **"PsiAtiva - Podcast - Apple Podcasts"** e categoria **Science → Social Sciences**. Ou seja: um domínio de altíssima autoridade já publica uma entidade chamada "PsiAtiva" definida como programa de ciências sociais para público leigo. Até 2026-08-24 essa definição não tinha corroboração de primeira parte. Agora tem: 9 URLs no domínio próprio confirmando-a em JSON-LD.

### 4.6 Conflito de NAP

`Organization` declara `telephone: +55 (21) 97990-7947`. As 9 URLs de podcast publicam, em link dofollow, um **segundo** número: `wa.me/5549991093426` (DDD 49, Santa Catarina). Dois números, dois estados, mesma marca, no mesmo domínio. Para resolução de entidade local isso é ruído — e é sistemático, não pontual.

---

## 5. Saúde de cluster e grafo de links internos

### 5.1 Links internos recebidos (contagem sobre as 18 páginas públicas buscadas)

| Alvo | Inbound | Papel |
|---|---:|---|
| `/podcast/` | **18** | rodapé sitewide — voltado a pacientes |
| `/blog/` | **18** | rodapé sitewide |
| `/analise-de-site-para-psicologo/` | 8 | página comercial |
| `/calculadora/` | **3** | **página de conversão** |
| `/quiz/` | **3** | **página de conversão** |
| `/indicacao/` | 0 | fora do sitemap |

O hub voltado a pacientes recebe **6× mais links internos** do que qualquer uma das duas ferramentas de conversão. Isso não é opinião de arquitetura — é o que o rodapé faz em toda página.

### 5.2 Para onde a seção devolve equity

De cada página de episódio saem links internos para: `/` (+ 6 âncoras `#` da home), `/blog`, `/podcast/`, episódios irmãos, `/termos`, `/privacidade`, `/cookies`.
**Zero links para `/calculadora/`, `/quiz/` ou `/analise-de-site-para-psicologo/`.**

Comparação justa: os posts do blog **linkam** para `/analise-de-site-para-psicologo/` (4/4). O podcast não linka para nenhuma. A seção é um beco sem saída de 9 URLs e 9.567 palavras que recebe equity sitewide e não devolve nada ao cluster comercial.

### 5.3 Um desperdício sitewide, barato de corrigir

Os links do rodapé apontam para `/podcast` e `/blog` **sem barra final**. Ambos respondem **301** para a versão com barra. Isso é um salto de redirecionamento em **cada link de rodapé de cada página do site** — inclusive nas comerciais. `src/components/sections/Footer.astro`.

### 5.4 Links externos dofollow

Por página de episódio, com `rel="noopener"` apenas (**dofollow**):

| Destino | Natureza |
|---|---|
| `instagram.com/psi.loivani` | perfil pessoal da apresentadora |
| `linkedin.com/in/loivaniventurin` | perfil pessoal |
| `wa.me/5549991093426` | WhatsApp pessoal (§4.6) |
| `lattes.cnpq.br/7200761194546008` | currículo pessoal |
| Apple Podcasts · Spotify · RSS anchor.fm | plataformas do programa |

São **4 links dofollow a propriedades pessoais de terceiro × 9 URLs = 36 saídas**, num site de 25 URLs indexáveis. Os links de plataforma (Apple/Spotify/RSS) são legítimos e devem continuar dofollow — corroboram a entidade do programa.

### 5.5 Canibalização interna dentro do próprio podcast

O hub emite **dois links para cada episódio**: um com o título (âncora descritiva ✓) e outro com `"Ler a transcrição →"` (âncora genérica, repetida 8×). Não é canibalização de página, é diluição de âncora. Correção trivial.

### 5.6 Pilares finos, duplicados ou faltando

- **Nada fino no podcast.** Os 2 itens genuinamente rasos — ep00 (75 palavras) e ep06 (320, texto de terceiro) — **já** são `hubOnly` e retornam 404 verificado. Os 8 publicados vão de 633 a 1.764 palavras (mediana ≈ 926).
- **Fino de verdade: `/blog/` (índice).** 188 palavras renderizadas e **apenas `BreadcrumbList`** de schema — sem `Organization`, sem `ItemList`/`Blog`. É a página de schema mais pobre do site e é um hub comercial.
- **Faltando vs. `brief-cluster-perfil-b-solo.md`:** o cluster Perfil B tem 4 satélites e nenhum pilar dedicado; a home é Perfil A. Lacuna de conteúdo → `psiativa-seo-briefer`.
- **Sem duplicação:** as transcrições são originais (geradas do áudio), não republicação de texto existente em outro domínio.

---

## 6. GEO / busca por IA — um achado P0 fora do escopo do podcast

**CONFIRMADO (conteúdo do arquivo):** `https://psiativa.com.br/robots.txt` serve **dois conjuntos contraditórios de regras**. Primeiro um bloco `# BEGIN Cloudflare Managed content` com:

```
User-agent: *
Content-Signal: search=yes,ai-train=no,use=reference
Allow: /

User-agent: GPTBot          → Disallow: /
User-agent: ClaudeBot       → Disallow: /
User-agent: Google-Extended → Disallow: /
User-agent: CCBot           → Disallow: /
User-agent: Amazonbot · Applebot-Extended · Bytespider · meta-externalagent → Disallow: /
```

E **depois** o bloco do repositório (`public/robots.txt`), que faz `Allow: /` para GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot e Google-Extended, e declara o `Sitemap:`.

**PLAUSÍVEL, não verificado:** pela especificação do Google, grupos com o mesmo `User-agent` são mesclados e, em empate de comprimento de path, vence a regra menos restritiva — o que faria `Allow: /` prevalecer. Mas **GPTBot e ClaudeBot não usam o parser do Google**, e não tenho como testar o comportamento real de cada um. O resultado por crawler é **indeterminado**. Não afirmo que estão bloqueados; afirmo que o arquivo é ambíguo e que ambiguidade neste ponto é risco puro, sem contrapartida.

Demais sinais GEO:
- **SSR: ✓ confirmado.** Conteúdo completo no HTML bruto sem executar JS — inclusive nas páginas com ilhas React.
- **`llms.txt`: 404.** Reportado, não ponderado como alavanca de ranking.
- **Blocos citáveis (134–167 palavras): ausentes.** Corpo dos episódios = 1 heading (`## Transcrição`) + 27 parágrafos de 33 a 103 palavras, sem sub-estrutura.
- **Abertura definition-first: ausente.** O primeiro parágrafo de cada episódio é a nota editorial CFP em blockquote — correto do ponto de vista regulatório, inútil como bloco citável.
- **`FAQPage`: ausente em 9/9 URLs de podcast** (presente em home, quiz, calculadora, análise e nos 4 posts).

---

## 7. Veredito por remédio — todos os quatro julgados

### 7.1 Diferenciar / retitular + schema → **RECOMENDAR (P0)**

**Por quê:** ataca a causa exata do único risco confirmado, e a causa é **um token**. `PODCAST.name = "PsiAtiva"` em `src/config/podcast.config.ts:11` alimenta simultaneamente o `<h1>` do hub, o `<title>` de 9 páginas, `PodcastSeries.name`, o `partOfSeries.name` de 8 episódios, o `alt` da capa e o link "← Podcast PsiAtiva". Renomear a **série** (não a marca) quebra a colisão em todos esses lugares de uma vez.

Escopo do conserto, em ordem de alavancagem:
1. `PODCAST.name` → um nome de série distinto do nome da organização.
2. `<h1>` do hub → descritivo do programa e do público, não o token de marca.
3. `PodcastSeries.description` → hoje não contém uma única palavra que ligue o programa ao domínio; deve dizer que é um programa **hospedado pela** PsiAtiva.
4. Episódios: adicionar `author` (Person + CRP) e `publisher`. Hoje as 8 páginas de episódio não têm autor nenhum — é a maior lacuna de E-E-A-T da seção, e num alvo de saúde regulada isso é prioritário.
5. Reposicionar a relação: PsiAtiva como `provider`/hospedeira do programa, não como identidade dele.

**Esforço:** baixo (1 arquivo de config + 2 funções de schema). **Estágio GAP: Consciência.** Se o token de marca resolve para "programa de psicologia para pacientes", quem procura a PsiAtiva pelo nome encontra a entidade errada, e todo o resto do funil nem começa.

### 7.2 Controles de link interno e de PageRank → **RECOMENDAR (P1), mas NÃO por `nofollow` interno**

**Por quê recomendar:** o desequilíbrio é medido — 18 links para `/podcast/` contra 3 para `/calculadora/` e 3 para `/quiz/` (§5.1).

**Por quê não por `nofollow`:** `nofollow` interno não redistribui equity — apenas a descarta. O problema não é o podcast receber links demais; é as páginas de conversão receberem de menos. A correção certa é **subir as comerciais**, não rebaixar o podcast:

1. Corrigir `/podcast` → `/podcast/` e `/blog` → `/blog/` no rodapé (§5.3) — ganho sitewide, esforço mínimo.
2. Dar a `/calculadora/` e `/quiz/` presença equivalente à do podcast na navegação — hoje o rodapé lista "Blog · Podcast · Termos · Privacidade · Cookies" e nenhuma das duas ferramentas.
3. Substituir as âncoras `"Ler a transcrição →"` por texto descritivo (§5.5).
4. **Links externos:** avaliar `rel="nofollow"` **apenas** no bloco de perfis pessoais da apresentadora (Instagram/LinkedIn/WhatsApp/Lattes), mantendo Apple/Spotify/RSS dofollow. ⚠️ **Decisão de negócio, não técnica** — esses links fazem parte do acordo de promoção mútua registrado no `MEMORY.md`. Sinalizo o custo em SEO; quem decide é o dono do acordo.
5. **Não** adicionar CTA comercial no corpo dos episódios. O público ali é paciente; um CTA de captação de psicólogo dentro de um episódio sobre autoestima é ruído para o leitor e sinal misto para o parser. Os 4 CTAs de chrome já existentes (§1) bastam.

**Esforço:** baixo a médio. **Estágio GAP: Ativação.** As ferramentas são o que transforma visita em contato; enterrá-las abaixo de conteúdo não comercial trava a etapa.

### 7.3 De-indexar / segregar episódios → **REJEITAR como remédio principal; manter como plano B condicionado**

Autorizado pelo dono, e ainda assim é a escolha errada agora. Quatro evidências:

1. **Não compra nada no eixo de query.** A canibalização de query foi medida em zero (§2.2). De-indexar remove um problema que não existe.
2. **Não resolve o problema que existe.** Uma página `noindex` continua sendo rastreada e seu JSON-LD continua sendo lido. `partOfSeries.name = "PsiAtiva"` permaneceria nas 8 páginas. De-indexação **não** desfaz a colisão de entidade — §7.1 desfaz.
3. **Destrói ativo real.** São 8.477 palavras originais, auditadas contra a Resolução CFP 06/2019 com 0 violação bloqueante, assinadas por profissional com CRP verificável. Num domínio de 25 URLs, isso é 36% da superfície indexável.
4. **Custo de negócio.** Quebra a contrapartida do acordo de promoção mútua.

**Subdomínio (`podcast.psiativa.com.br`) — também rejeitado:** cria uma segunda entidade para manter e perde o benefício de marca compartilhada, para resolver algo que a renomeação da série resolve em um token.

**Condição para reabrir:** se, 60–90 dias após §7.1, o Search Console mostrar a consulta de marca "psiativa" resolvendo para `/podcast/` acima da home, ou URLs de podcast recebendo impressões em consultas comerciais. Aí o `noindex` volta à mesa — com dado, não com receio.

### 7.4 Consolidar episódios finos → **REJEITAR**

1. **Os finos já foram tratados.** ep00 (75 palavras) e ep06 (320, texto de terceiro) são `hubOnly` e retornam **404 verificado ao vivo**. A decisão registrada no `MEMORY.md` está correta e não precisa ser refeita.
2. **Os publicados não são finos.** 633 a 1.764 palavras, mediana ≈ 926 — acima dos 4 posts do blog (572 a 821).
3. **Consolidar quebraria a paridade 1 episódio ↔ 1 URL**, de que dependem `PodcastEpisode`, `AudioObject` e a correspondência com o feed. Também quebraria a contagem de reproduções pelo endpoint `anchor.fm/.../play/` — decisão que o `MEMORY.md` registra como cara de apurar. Não refazer.

**Contraproposta (P2): estruturar em vez de consolidar.** Cada episódio hoje tem 1 heading e 27 parágrafos corridos. Adicionar sub-cabeçalhos H2 e uma abertura definition-first de 134–167 palavras eleva legibilidade, acessibilidade e citabilidade por IA — sem mexer em URL, schema ou métrica de reprodução. É o único ganho de conteúdo real disponível nesta seção.

---

## 8. Plano de ação priorizado

### P0 — risco de entidade / bloqueio de rastreio
1. **Renomear a série** em `src/config/podcast.config.ts:11` e ajustar `<h1>` do hub (`src/pages/podcast/index.astro:42`) — esforço: **baixo** — *GAP/Consciência*: o token de marca precisa resolver para a assessoria, não para o programa.
2. **Adicionar `author` (Person + CRP) e `publisher` ao schema dos episódios** (`src/lib/schema.ts:223`) — esforço: **baixo** — *GAP/Ativação*: 8 páginas de saúde sem autor atribuível é a maior lacuna de E-E-A-T do site.
3. **Resolver a contradição do `robots.txt`** — desativar o robots.txt gerenciado do Cloudflare ou alinhar os dois blocos — esforço: **baixo** (painel Cloudflare) — *GAP/Consciência*. ⚠️ Fora do escopo do podcast; afeta o site inteiro.
4. **Reescrever `PodcastSeries.description`** para ancorar o programa ao domínio hospedeiro — esforço: **baixo** — *GAP/Consciência*.

### P1 — impacto de ranqueamento / citação
5. **Rodapé: `/podcast/` e `/blog/` com barra final** (`src/components/sections/Footer.astro`) — elimina um 301 por link em todas as páginas — esforço: **baixo** — *GAP/Ativação*.
6. **Elevar `/calculadora/` e `/quiz/` no grafo interno** (hoje 3 inbound cada, contra 18 do podcast) — esforço: **baixo** — *GAP/Aquisição*: são as páginas onde o contato acontece.
7. **`og:image` próprio para as URLs de podcast** (hoje CloudFront de terceiro em 8 URLs) — esforço: **baixo** — *GAP/Ativação*.
8. **Decidir sobre `rel` dos 4 links pessoais da apresentadora** — 36 saídas dofollow num site de 25 URLs — esforço: **baixo** (técnico) / **decisão do dono do acordo** — *GAP/Ativação*.
9. **Schema do `/blog/`**: 188 palavras e só `BreadcrumbList` — adicionar `Organization` + `ItemList`/`Blog` — esforço: **baixo** — *GAP/Consciência*.

### P2 — otimização (backlog)
10. **Estruturar transcrições**: H2 por bloco + abertura definition-first de 134–167 palavras — esforço: **médio** — *GAP/Consciência* (superfícies de IA).
11. **Âncoras do hub**: substituir `"Ler a transcrição →"` (8× repetido) por texto descritivo — esforço: **baixo**.
12. **`llms.txt`** (hoje 404) — reportado, não ponderado como alavanca — esforço: **baixo**.
13. **NAP**: decidir se o WhatsApp DDD 49 permanece em 9 URLs indexáveis convivendo com o DDD 21 da `Organization` — esforço: **baixo** — *GAP/Aquisição*.
14. **Medir CWV** com PSI/Lighthouse nas URLs de podcast — nenhum número deste relatório cobre a categoria 2.
15. **Search Console em 30 e 90 dias**: filtrar `/podcast/` por consulta; é o único instrumento que fecha o que §2.3 não conseguiu ler.

---

## 9. Próximos passos e handoffs

- **Lacunas de conteúdo → `psiativa-seo-briefer`:** (i) o cluster Perfil B tem 4 satélites e **nenhum pilar**; (ii) não existe cluster Perfil A no blog — a home carrega Perfil A sozinha; (iii) qualquer novo episódio deve passar pelo gate antes de subir, que é justamente o que não aconteceu aqui.
- **Oferta:** nenhuma recomendação deste relatório coloca preço, garantia ou prazo em página pública. As páginas de conversão continuam levando à conversa, não ao valor. Qualquer superfície que venha a exibir termos comerciais → `offer-guardian` / `oferta-travada.md`.
- **CFP:** não recomendo nenhuma alteração de copy clínica. As notas editoriais de ep03 e ep08 e o CRP em toda página devem permanecer. Se a reestruturação do P2 #10 tocar o texto das transcrições → `cfp-compliance` antes de publicar.
- **`MEMORY.md` do podcast:** a pendência "nunca passou por `psiativa-seo-briefer`" foi endereçada por este relatório no eixo de canibalização/cluster/entidade. A nota "diluição topical era um risco superestimado" merece a revisão do §4.4 — o corpus comercial é menor do que a estimativa assumia.

---

## Anexo — instrumentos usados e seus limites

| Verificação | Instrumento | Confiabilidade |
|---|---|---|
| HTML, `<head>`, JSON-LD, links, contagem de palavras | `curl` direto, HTML bruto, 19 URLs | **Alta** — leitura direta |
| Sitemap, robots, llms.txt, códigos HTTP, cadeia de 301 | `curl` | **Alta** |
| Índice: `site:psiativa.com.br` | Bing pt-BR | **Média** — índice do Bing, não do Google |
| SERP de marca e de consultas comerciais | `WebSearch` (locale US) e Bing texto livre | **Inutilizável** — não reporto resultado |
| Posição no Google BR, impressões, cliques | — | **Não disponível** — requer Search Console |
| Core Web Vitals / Lighthouse | — | **Não executado** |
| Comportamento real de GPTBot/ClaudeBot no robots ambíguo | — | **Não testável** aqui |
