# Briefing SEO — `/podcast/` · contenção de audiência e anticanibalização (retroativo)

> Gerado: 2026-08-24 | Agente: `psiativa-seo-briefer` | **ICP: Perfil B — Autônomo (consultório solo)**
> Cluster: **Previsibilidade & captação para psicóloga solo** (B2B) · o `/podcast/` entra como **seção contida, fora do cluster** (nem pilar, nem satélite)
> Estágio GAP (interno): a seção está **fora do funil GAP** por decisão; os remédios deste briefing tocam **Consciência** (resolução da marca) e **Aquisição** (equity para as páginas de conversão)
> Fonte: [audit `/podcast/` 2026-08-24](../reports/audit-podcast-cannibalizacao-2026-08-24.md) + [brief-cluster Perfil B](brief-cluster-perfil-b-solo.md) (documento regente) + [`projects/podcast/MEMORY.md`](../../../podcast/MEMORY.md)
> Saída: `workspace/psiativa/projects/landing-page-v2/seo/briefings/brief-podcast-anticanibalizacao.md`
> **Natureza: gate retroativo.** A seção subiu em 2026-08-24 sem passar por este agente. Este briefing não autoriza o que já está no ar: ele **delimita** o que já está no ar e trava a regra para o próximo episódio.

---

## 0. Leia primeiro: o que este briefing é, e o que ele não é

Este é o único briefing do site cujo alvo **não vende para ninguém**. O `/podcast/` fala com **pacientes e público geral** — uma terceira audiência que não é Perfil A nem Perfil B. Ela recebe um nome próprio aqui para poder ser citada em briefings futuros sem virar discussão:

> **Audiência C — paciente / público geral.** Não-ICP. Não compra, não é qualificada, não entra no funil. Existe no domínio por um acordo de promoção mútua com a psicóloga Loivani Venturin Körner (CRP 12/19699), dona do programa.

O ICP **deste briefing** é **Perfil B**, porque o ativo em risco é o cluster Perfil B: 4 satélites publicados, sem pilar, competindo por atenção de rastreio no mesmo domínio que agora hospeda um corpus quase 3× maior voltado à Audiência C. **A regra de nunca misturar ICPs continua valendo, e é justamente por isso que este documento existe:** ele não adota a audiência do podcast, ele a cerca.

**Três fatos de registro que este briefing corrige ou fixa:**

1. **`MEMORY.md` está errado sobre o volume.** A memória diz *"o real é 8.833 (~2 posts de blog)"*. Re-medição da fonte em 2026-08-24: **podcast 9.513 palavras** (9.019 desconsiderando os dois `hubOnly`) contra **3.299 do blog inteiro** — ou seja **2,7× a 2,9× todo o blog comercial**, não dois posts. ⚠️ Três instrumentos mediram isso e **não são intercambiáveis**: o campo `words` do frontmatter soma 8.837 (por episódio, fonte), a auditoria mediu 9.567 renderizadas (HTML ao vivo, descontado o chrome) contra 2.730 do blog, e a re-medição da fonte deu 9.513/3.299. Os três discordam no dígito e **concordam na direção e na ordem de grandeza**: o podcast é a maioria do corpus. Nenhum deles sustenta "~2 posts de blog". Corrigir a linha no `MEMORY.md`.
2. **`MEMORY.md` está parcialmente errado sobre os links.** *"Sem CTA comercial nas páginas de episódio e zero links para o funil (verificado no DOM)"* era verdade **do corpo do artigo** e falso **da página**: o chrome sitewide levava um FAB de WhatsApp com a mensagem *"gostaria de agendar o diagnóstico gratuito da minha clínica"* — mensagem **Perfil A** exibida à Audiência C, o que quebrava a regra de nunca misturar ICPs em todas as 9 URLs. **Já corrigido** (`hideWhatsAppFab`). A distinção importa: a asserção sobre o DOM precisa dizer *qual* DOM foi verificado.
3. **A renomeação da série está permanentemente fora da mesa.** A auditoria §7.1 recomendou renomear `PODCAST.name`. **Rejeitado por decisão de negócio:** "PsiAtiva" é o nome registrado do programa na Apple e no Spotify, e renomear no schema quebraria o pareamento de entidade com o feed RSS. A desambiguação veio por `@id` + `sameAs` + contexto de exibição, que é a rota já executada. ⛔ **Não reabrir.**

---

## 1. Alvo & intenção

- **Páginas:** existentes, ao vivo desde 2026-08-24 — `https://psiativa.com.br/podcast/` (hub) + **8 páginas de episódio** indexáveis. `ep00` e `ep06` são `hubOnly` (404 verificado, fora do sitemap) e **permanecem assim**.
- **Pergunta-alvo (linguagem natural), Audiência C:** *"o que é autoestima e como construir a minha"*, *"por que eu procrastino"*, *"o que é autossabotagem"*, *"como desenvolver inteligência emocional"*.
- **Intenção:** **informacional** — 100% dela. Nenhuma URL do podcast tem intenção comercial ou transacional, e nenhuma deve adquirir uma.
- **Uma intenção disputada, e só uma:** a query de marca nua **"PsiAtiva"** é **navegacional**, e antes das correções o domínio afirmava duas definições concorrentes do mesmo token (`Organization` em 9 URLs, `PodcastSeries` em 9 URLs). Esse era o risco real. Dono da query: **a home**.
- **Formato que o buscador premia:** para as queries da Audiência C, guia/FAQ + resultado rico de áudio/podcast; para a query de marca, painel/sitelinks resolvidos a partir da entidade `Organization`.
- **Estágio GAP:** **nenhum.** A seção não é topo de funil comercial: quem ouve não é quem compra. Tratar o podcast como "Consciência" seria o primeiro passo para justificar um CTA lá dentro. ⛔ Não fazer.

⚠️ **Sobre ranking no Google:** este briefing **não afirma nenhuma posição de SERP**. O `WebSearch` disponível é de locale US e não honra `site:`; o `site:` que respondeu foi o do **Bing** e trouxe 5 URLs, todas comerciais, **zero do podcast**. Não há dano medido — há exposição corrigida antes do dano. O único instrumento que fecha essa lacuna é o **Search Console** (§5).

---

## 2. Termos-alvo & anticanibalização ⚠️ (extensão do §2 do documento regente)

### 2.1 Veredito herdado, não re-litigado

- **Canibalização de query: NENHUMA — medida, não presumida.** Os dois corpora são **lexicalmente disjuntos**: o podcast tem **0** ocorrências de `captação`, `agenda previsível`, `agenda vazia`, `consultório`, `sessão`, `WhatsApp`, `Google`, `previsibilidade`; o blog tem **0** de `autoestima`, `autoconhecimento`, `inteligência emocional`, `autossabotagem`. Não existe par query→URL em disputa. ⛔ **Não inventar sobreposição que a medição descartou.**
- **Diluição de entidade: CONFIRMADA e endereçada.** Era o risco real, e não dependia de volume de busca.

### 2.2 Termos do podcast (o que a seção legitimamente cobre)

Núcleo: autoestima · autoconhecimento · autossabotagem · procrastinação · inteligência emocional · saúde mental no cotidiano · recomeço · celebrar conquistas.
Suporte: emoções, relacionamentos, comportamento, autocobrança, gentileza consigo.
Autoridade: **CRP 12/19699** (Art. 2º, Res. CFP 06/2019 — nome e registro em comunicação profissional) · CFP.
⛔ **NR-1 não entra aqui.** É gancho de demanda corporativa, ou seja, vocabulário comercial de Perfil B. Um episódio que o cite muda de audiência.

### 2.3 O grafo estendido

Linhas herdadas do documento regente, mais as que faltavam. **O `/podcast/` não aparecia em lugar nenhum do grafo original — este é o conserto.**

| Eixo de query | Dona | Não invadir |
|---|---|---|
| "agenda previsível / pacientes sem indicação" (how-to, hub) | **Pilar** (a briefar) | — |
| "agenda vazia: por quê + o que fazer" (causas, qualitativo) | **S1** | não quantificar (é da calculadora) |
| "quanto a agenda vazia custa" (quantificar, ferramenta) | **`/calculadora/`** ★ | S1 linka, não calcula |
| "qual a minha maior dor" (diagnóstico) | **`/quiz/`** ★ | artigos linkam, não diagnosticam |
| "responder WhatsApp / perder paciente" | **S2** | — |
| "aparecer no Google / perfil / Maps" | **S3** | (produto GBP) |
| **"análise / diagnóstico do meu site de psicólogo"** *(linha nova — a página subiu depois do grafo original)* | **`/analise-de-site-para-psicologo/`** | S3 fala de presença, não pontua site |
| marca nua **"PsiAtiva"** (navegacional) / clínica / conversão | **home**, via `Organization @id /#organization` | ⛔ **o podcast nunca é a definição do token de marca** |
| **"podcast PsiAtiva" / "PsiAtiva podcast"** *(linha nova)* | **`/podcast/`**, via `PodcastSeries @id …/podcast/#series` + `sameAs` → Apple e Spotify | ⛔ não reivindicar a marca nua; o nome só resolve para o programa quando vem acompanhado de "podcast" |
| **psicologia para o público geral: autoestima · autoconhecimento · autossabotagem · procrastinação · inteligência emocional · saúde mental cotidiana** *(linha nova)* | **`/podcast/` + 8 episódios** (Audiência C) | ⛔ **lista fechada em 2.4** |

### 2.4 Eixos que o `/podcast/` NUNCA pode reivindicar (lista fechada)

Nenhuma URL sob `/podcast/` pode, em título, H1/H2, description, transcrição editada, FAQ ou schema, disputar:

1. agenda (previsível, vazia, oscilante, buraco na agenda)
2. captação, captação por intenção, presença profissional, visibilidade profissional
3. consultório, clínica, recepção, secretária, equipe
4. precificação, VPS, "quanto cobrar"
5. WhatsApp como canal de atendimento profissional, primeira resposta, no-show
6. Google Meu Negócio / Perfil de Empresa / SEO local para psicólogo
7. análise ou diagnóstico de site profissional
8. NR-1, demanda corporativa, psicologia organizacional
9. a marca nua "PsiAtiva" como assunto da página

**Regra de detecção, em uma linha:** se a frase faz sentido dita **para** uma psicóloga sobre o negócio dela, ela pertence ao cluster Perfil B e não pode subir sob `/podcast/`.

### 2.5 Um termo em observação (não é canibalização, é posicionamento)

**"processo"** é termo assinado da PsiAtiva ("assessoria de processo"). Ele aparece **21×** no podcast no sentido terapêutico ("processo de autoconhecimento") contra **9×** no blog no sentido comercial. Isso não move ranking de query e não ativa nenhum remédio. **A correção é aritmética e vem do lado comercial:** publicar o pilar Perfil B e o lote 2 do cluster inverte a proporção sem tocar em uma linha do podcast. Revisar a razão quando o pilar subir.

### 2.6 Veredito

**DIFERENCIAR.** Sem consolidação, sem canonical cruzado, sem de-indexação (§5). Cada URL do podcast mantém canonical próprio e autorreferente. A separação é **por audiência e por entidade**, não por query — porque no eixo de query nunca houve disputa.

---

## 3. Concorrência & ganho de informação

- **Concorrência real das queries da Audiência C:** portais de saúde mental de alto volume e conteúdo de terapeuta em vídeo. **A PsiAtiva não disputa esse SERP e não deve tentar.** Nenhuma decisão deste briefing tem por objetivo fazer o `/podcast/` ranquear melhor; o objetivo é que ele **não custe nada** ao cluster comercial e continue entregando a contrapartida do acordo.
- **Corroboração externa que já existe e trabalha a favor:** `podcasts.apple.com/.../psiativa/id1679960852` está no ar (HTTP 200), categoria Science → Social Sciences. Depois do `sameAs`, essa entidade externa passa a **confirmar** a série em vez de competir com a organização pelo mesmo nome.

**Ângulo proprietário / POV (IAT — obrigatório):**

> **"Presença, não publicidade — inclusive quando a presença não vende nada."** A PsiAtiva hospeda o programa de uma psicóloga parceira sem transformar a audiência dela em contato comercial. É a mesma tese do posicionamento aplicada onde ela custa dinheiro: quem defende *processo, não pressão* não coloca um botão de captação numa página que fala de autoestima com quem está sofrendo. A seção é a **prova pública** de que a marca sustenta a própria posição quando ela não é conveniente.

Esse é o único ângulo que justifica a existência da seção num domínio B2B. Ele é interno e argumentativo: **não vira copy publicada** em nenhuma página do podcast.

---

## 4. A regra permanente: como uma seção paciente-facing convive com um domínio B2B

Derivada do §0 do documento regente (*"os tópicos aqui são sobre o consultório como negócio, nunca sobre terapia-para-paciente"*). Aquela regra proibia o cluster de virar conteúdo para paciente. Ela **não previa** o caso inverso: uma seção inteira para paciente hospedada ao lado do cluster. Esta é a regra que faltava.

### 4.1 As seis condições de convivência (todas simultâneas)

Uma seção voltada à Audiência C pode existir em `psiativa.com.br` **se, e somente se**:

| # | Condição | Estado hoje |
|---|---|---|
| 1 | **Confinada a um prefixo de path próprio e nomeado** (`/podcast/`), nunca em raiz, nunca dentro de `/blog/`, nunca misturada ao índice comercial. | ✅ atendido |
| 2 | **Entidade separadamente resolvível:** `@id` próprio + `sameAs` para corroboração externa. O token de marca pertence à `Organization`; a seção só o herda acompanhado de um qualificador ("Podcast PsiAtiva"). | ✅ atendido (`…/podcast/#series` + Apple/Spotify) |
| 3 | **Zero sinal de ICP comercial na página inteira, chrome incluído.** Nenhum CTA de captação, nenhuma mensagem pré-preenchida de venda, nenhum vocabulário de negócio. A verificação é sobre o **DOM renderizado**, não sobre o corpo do artigo. | ✅ atendido após remover o FAB |
| 4 | **Disjunção léxica com o corpus comercial**, verificável por contagem (§2.1). É o que torna a condição 3 auditável em vez de opinativa. | ✅ medido |
| 5 | **Autoria verdadeira.** Parceiro externo = `Person` + CRP + `sameAs`, **sem `worksFor`**. Afirmar vínculo empregatício de um CRP com a PsiAtiva faz o domínio ser lido como prática clínica, não como assessoria — e contradiz o §5 do documento regente ("não fabricar credencial"). | ✅ atendido (`worksForPsiAtiva` agora é opt-in e está desligado) |
| 6 | **Não recebe privilégio de link interno sobre as páginas de conversão** e não devolve link para o funil. Assimetria em qualquer direção é defeito. | ⚠️ **aberto** — 18 inbound contra 3 de cada ferramenta (§6.3) |

**Se qualquer uma das seis falhar, a seção deixa de ser inofensiva.** As condições 3 e 5 já falharam uma vez cada, em produção, sem ninguém notar: o FAB comercial e o `worksFor` falso. Ambas eram invisíveis para quem lia só o markdown do episódio.

### 4.2 O que atravessa a linha: gatilhos por episódio futuro

Todo episódio novo passa por esta triagem **antes** de virar página. Qualquer "sim" reprova a publicação sob `/podcast/`:

| # | Gatilho | Por que reprova |
|---|---|---|
| G1 | O episódio fala com a **psicóloga sobre o negócio dela** (agenda, pacientes novos, precificação, divulgação, "como montar consultório", "psicologia e empreendedorismo"). | Quebra a disjunção léxica (cond. 4) e cria disputa real com o cluster Perfil B. Este é o gatilho mais provável de todos. |
| G2 | O episódio menciona **NR-1, saúde mental corporativa ou demanda de empresas**. | Território comercial de Perfil B; o gancho existe justamente para vender posicionamento a psicólogo. |
| G3 | O episódio trata de **método, produto ou cliente da PsiAtiva**, ou tem participação da PsiAtiva como marca. | Colapsa a separação de entidade (cond. 2): a série volta a ser a definição do token. |
| G4 | O episódio dá **orientação clínica individualizada, diagnóstico, ou promete resultado terapêutico** ("a terapia vai fazer você parar de..."). | Risco CFP direto. É exatamente o que a nota editorial do ep03 já teve que conter. |
| G5 | O episódio precisaria de **CTA para converter** para justificar o esforço. | Se a resposta para "por que publicar?" for comercial, o lugar não é `/podcast/`. |
| G6 | O episódio republica **texto de terceiro** com autoria incerta. | É o critério que já mandou o ep06 para `hubOnly`. Precedente, não novidade. |

**Rota de exceção:** um tema que reprova em G1 pode ser legítimo — só não como episódio. Ele vira **pauta do cluster Perfil B**, com briefing próprio deste agente, publicado em `/blog/`, com voz B2B, assinado pela PsiAtiva. Um mesmo assunto nunca existe nas duas seções.

### 4.3 A regra, em uma frase (para colar no `MEMORY.md`)

> Um episódio só sobe no domínio da PsiAtiva enquanto o público continuar sendo **paciente** e o vocabulário continuar **disjunto** do vocabulário comercial. No instante em que um episódio fala com a psicóloga sobre o negócio dela, ele deixa de ser podcast e vira conteúdo do cluster Perfil B: ou tem briefing próprio e vai para o `/blog/`, ou não sobe.

---

## 5. Decisão de de-indexação: registrada com o gatilho

**Decisão hoje: NÃO de-indexar.** Reafirmada, não reaberta. Fundamento (auditoria §7.3): a canibalização de query é zero, `noindex` não desfaz colisão de entidade (a página segue rastreada e o JSON-LD segue lido), destrói 9.513 palavras originais auditadas em CFP com autoria CRP verificável, e quebra a contrapartida do acordo de promoção mútua. Subdomínio também rejeitado: cria uma segunda entidade para manter, para resolver o que o `@id` já resolveu.

**Isto é um plano B condicionado, e a condição está escrita abaixo para que a decisão não seja re-argumentada do zero.**

### 5.1 Instrumento, janela e condição

- **Instrumento:** Google Search Console, relatório de Desempenho. ⚠️ Nenhum outro instrumento disponível hoje responde isto: `WebSearch` é locale US e ignora `site:`, e o `site:` do Bing lê outro índice. **Sem GSC, o gatilho não pode ser avaliado — e "não consegui medir" nunca conta como "não disparou".**
- **Janela:** duas leituras, **+30 dias** (2026-09-23) e **+90 dias** (2026-11-22) a partir de 2026-08-24.
- **Recorte:** filtro por página contendo `/podcast/`, cruzado com consulta.

**O plano B ativa se, em qualquer das duas leituras, QUALQUER uma das três disparar:**

- **T1 — captura da marca.** Para a consulta `psiativa` (e variantes de marca nua), uma URL sob `/podcast/` tem **posição média melhor** que `https://psiativa.com.br/`.
- **T2 — vazamento comercial.** Qualquer URL sob `/podcast/` recebe impressões em consulta contendo qualquer um dos termos-cabeça medidos como disjuntos: `captação`, `agenda previsível`, `agenda vazia`, `consultório`, `psicólogo`+`paciente novo`, `quanto cobrar`, `NR-1`.
- **T3 — deslocamento interno.** Uma URL sob `/podcast/` supera um post do cluster Perfil B na consulta que aquele post é dono segundo o grafo §2.3.

### 5.2 Resposta se disparar (escalonada, nesta ordem — nunca `noindex` em bloco de saída)

1. **Reverificar os sinais de entidade** antes de qualquer coisa: `@id` presentes e distintos, `sameAs` resolvendo, H1 do hub qualificado, `worksFor` ausente. Um dos quatro ter regredido num deploy é a hipótese mais barata e a mais provável.
2. **`noindex, follow` apenas nas 8 páginas de episódio**, mantendo o hub indexável. Preserva a entidade da série, o `sameAs` e o valor da contrapartida; remove a superfície que capturou a query. ⚠️ Não desfaz colisão de entidade — só faz sentido **depois** do passo 1.
3. **Subdomínio** — só se a colisão persistir após 1 e 2, e com dado do GSC na mão. Rejeitado hoje.

⛔ **Fora da mesa em qualquer cenário:** renomear a série (§0.3), `nofollow` em link interno (descarta equity, não redistribui — auditoria §7.2), e consolidar episódios (quebra a paridade 1 episódio ↔ 1 URL de que dependem `PodcastEpisode`, `AudioObject` e a contagem de reprodução do endpoint `anchor.fm/.../play/`).

### 5.3 Condição de encerramento

Se **nenhum** gatilho disparar até a leitura de +90 dias, a questão é **encerrada**: `/podcast/` passa a monitoramento de rotina junto com o resto do site e o assunto não volta como discussão de arquitetura. Registrar o resultado das duas leituras no `MEMORY.md` do podcast, disparando ou não — **uma leitura não registrada equivale a não ter medido.**

---

## 6. Spec por página: hub + 8 episódios

### 6.0 Regras que valem para as 9 URLs

- ⛔ **Nenhuma string proposta aqui usa travessão ou meia-risca** (regra dura do humanizer). Ponto, vírgula ou dois-pontos.
- ⛔ **Vocabulário proibido** (`voice.md`): marketing, anúncio, publicidade, vendas, leads, escalar, explodir a agenda, virar referência. **Exceção documental:** "publicidade profissional" é termo da própria Res. CFP 06/2019 e só aparece em comentário de código ou nota interna, **nunca em copy visível**.
- ⛔ **Nenhum sinal de vida de clínica** (agenda oscilante, no-show, recepção) e nenhum enquadramento de hemorragia. São camadas de venda para psicólogo; aqui elas seriam ruído para o leitor e sinal misto para o parser.
- ✅ **CRP 12/19699 continua renderizando em todas as 9 páginas.** Não remover.
- ✅ **Canonical próprio, absoluto e autorreferente** em 9/9. Já correto.

### 6.1 Meta — padrão e orçamento de caracteres

⚠️ **Mecânica do layout:** `SEOHead.astro` só concatena `| PsiAtiva` quando o título **não contém** "PsiAtiva". Os títulos do podcast já contêm, então **nada é anexado** e o valor autorado é o valor final. Contar sobre o valor autorado.

**Hub** — hoje `Podcast PsiAtiva: Psicologia sem complicações` (45 caracteres, abaixo da faixa de 50 a 60).

- Proposta: **`Podcast PsiAtiva: psicologia do dia a dia, sem complicações`** (59). Mantém "Podcast" na primeira posição, que é o que desambigua o token de marca no SERP.
- Description (130 a 150): a atual é a `PODCAST.description`, herdada do feed e sem uma palavra que ancore o programa ao domínio hospedeiro. Reescrever para incluir **quem apresenta + CRP + que a PsiAtiva hospeda**, sem prometer resultado terapêutico. ⚠️ Alterar `PODCAST.description` muda também a `PodcastSeries.description` do schema, que é justamente o objetivo.

**Episódios** — padrão `{seoTitle} | Podcast PsiAtiva`. O sufixo custa **19 caracteres**, então o `seoTitle` tem orçamento de **31 a 41**.

Adicionar um campo **`seoTitle`** ao frontmatter, usado **apenas** no `<title>`. O `title` (H1) permanece o título real do episódio. ✅ Seguro: o pareamento com o feed é feito por `guid` e `audioUrl`, nunca por título, e a página já exibe um título diferente do `episodeTitle` do RSS.

| # | `title` (H1, não mudar) | `seoTitle` proposto | Título final | Hoje |
|---|---|---|---|---|
| 01 | Autoconhecimento é uma jornada | Autoconhecimento: por onde começar | 53 | 48 |
| 02 | Seja gentil com a sua mente | Saúde mental: seja gentil com a sua mente | 59 | 46 |
| 03 | Autossabotagem | Autossabotagem: o que é e como parar | 54 | **33** |
| 04 | Procrastinação | Procrastinação: por que adiamos tudo | 54 | **33** |
| 05 | Autoestima | Autoestima: o que é e como construir | 55 | **29** |
| 07 | Você celebra suas pequenas conquistas? | *(manter)* | 57 | 57 ✅ |
| 08 | Como desenvolver a Inteligência Emocional? | Como desenvolver a inteligência emocional | 60 | 61 |
| 09 | Recomeçar também é voltar para si | *(manter)* | 51 | 51 ✅ |

**Meta descriptions dos episódios:** as atuais são as descrições do feed, de 130 a **300+** caracteres (ep01, ep07 e ep09 são truncadas pelo buscador). Adicionar **`metaDescription`** (130 a 150) ao frontmatter, mantendo a `description` atual como texto de página. Padrão: *pergunta ou definição + o que o episódio entrega + quem apresenta*. ⛔ Sem promessa de resultado ("vai te ajudar a parar de", "resolve"). Exemplo trabalhado (ep05, 141): *"Autoestima é o valor e a opinião que você tem sobre si mesmo. Neste episódio, a psicóloga Loivani Körner explica como ela se constrói no dia a dia."*

**Outros itens de meta já mapeados e fora do escopo de conteúdo:** `og:image` aponta para CloudFront de terceiro em 8 URLs (trocar por ativo próprio) e a capa do hub tem a mesma origem. Itens de build, não de briefing.

### 6.2 Estrutura de headings e blocos GEO

**O problema medido:** cada episódio tem **1 heading** (`## Transcrição`) e **27 parágrafos** corridos de 33 a 103 palavras. Zero bloco citável, zero abertura definition-first, zero `FAQPage` em 9/9 URLs.

⚠️ **Restrição que define a solução:** a transcrição é a **fala literal** da psicóloga, auditada em CFP 06/2019 com zero violação bloqueante. **Reescrever as frases reabre a auditoria inteira.** Por isso a estrutura entra **por cima** do texto, sem tocar nas palavras.

**Hub — estrutura alvo:**

```
H1  Podcast PsiAtiva                                   ✅ já corrigido (era "PsiAtiva")
H2  Apresentado por Loivani Venturin Körner            (hoje só o nome; qualificar)
H2  Episódio mais recente
H2  Todos os episódios
H3  <título de cada episódio>
```

- ⚠️ `H2 Loivani Venturin Körner` nu, logo abaixo do H1, é o padrão canônico de página de consultório. **Qualificar o H2** ("Apresentado por…") tira a leitura de "esta é a clínica de Loivani" sem remover o crédito. O `<p class="pod-eyebrow">Apresentado por</p>` já existe visualmente mas **não é heading** — não conta para o parser.
- **TL;DR citável do hub (40 a 60 palavras):** o que é o programa, para quem é (pessoas comuns, não profissionais), quem apresenta com CRP, e que a PsiAtiva **hospeda**. É o bloco que ensina a máquina que "PsiAtiva" é a organização e "Podcast PsiAtiva" é o programa.

**Episódios — estrutura alvo:**

```
H1  <título do episódio>                               ✅ já existe
[nota editorial CFP em blockquote, quando houver]      ✅ manter onde existe (ep03, ep08)
[TL;DR definition-first, 40 a 60 palavras]             ← NOVO
H2  <pergunta 1>                                       ← NOVO, marcador dentro da transcrição
H2  <pergunta 2>                                       ← NOVO
H2  <pergunta 3 a 5>                                   ← NOVO
H2  Perguntas frequentes                               ← NOVO
```

1. **TL;DR definition-first (40 a 60 palavras).** ⚠️ **Regra que zera o risco CFP: extrair, não inventar.** As definições já estão ditas pela própria psicóloga no áudio. Exemplo, ep05, já presente na transcrição: *"Ela é o valor e a opinião que você tem sobre si mesmo. Ela constitui a nossa imagem e por isso precisamos saber quem somos."* O TL;DR é **condensação da fala dela**, jamais reivindicação nova.
2. **Bloco citável autossuficiente (134 a 167 palavras).** Os parágrafos têm 33 a 103 palavras: **2 a 3 consecutivos** caem naturalmente na faixa. Escolher o trecho que responde sozinho à pergunta do H2 e marcá-lo com o heading. Sem reescrita.
3. **H2 em forma de pergunta**, derivados do que o trecho já responde: *"O que é autoestima?"*, *"Por que a gente procrastina?"*, *"Como a autossabotagem funciona?"*, *"O que dá para fazer no dia a dia?"*. ⛔ Nunca *"como parar de vez"* nem qualquer formulação que prometa desfecho.
4. **FAQ, 3 a 5 por episódio, + `FAQPage`.** Regra dura: **toda resposta tem que ser respondível pelo conteúdo do próprio episódio.** Nada de pergunta nova que exija afirmação clínica nova.
   - ✅ **Uma pergunta é obrigatória em todos os 8**, e serve ao mesmo tempo de blindagem CFP e de bloco citável honesto: *"Este episódio substitui terapia?"* → **"Não."** seguido de uma frase sobre procurar profissional. Resposta curta, verdadeira, citável.
   - ⛔ Nenhuma resposta de FAQ pode conter previsão taxativa de resultado. É exatamente o que a nota editorial do ep03 já teve que conter uma vez.
5. **`llms.txt`** retorna 404 hoje. Reportado, **não ponderado** como alavanca de ranking. Item de site, não do podcast.

### 6.3 Links internos: subir as comerciais, não rebaixar o podcast

**O desequilíbrio medido:** `/podcast/` e `/blog/` recebem **18 links internos** cada (rodapé sitewide); `/calculadora/` e `/quiz/` recebem **3 cada**; `/analise-de-site-para-psicologo/` recebe 8. Uma seção que fala com quem não compra recebe **6× mais link interno** que cada ferramenta de conversão.

⛔ **A correção não é mexer no podcast.** `nofollow` interno não redistribui equity, apenas descarta. Remover links do podcast quebraria a descoberta da seção sem entregar nada às ferramentas.

**Correção, do lado comercial (não é trabalho de conteúdo do podcast):**

1. **Rodapé:** a coluna "Recursos" lista Blog · Podcast · Termos · Privacidade · Cookies, e **nenhuma das duas ferramentas**. Adicionar `/calculadora/`, `/quiz/` e `/analise-de-site-para-psicologo/` (coluna "Ferramentas", ou estender "Recursos"). Isso leva cada uma de 3 para 18+ inbound e inverte a razão **sem tocar uma linha do podcast**. `src/components/sections/Footer.astro`.
2. **Corpo dos posts do blog:** os 4 já linkam para `/analise-de-site-para-psicologo/`. Acrescentar os cruzamentos que o grafo §2.3 já prevê: S1 → `/calculadora/` ("veja quanto isso custa em R$"), satélites → `/quiz/`. Âncora descritiva, nunca "saiba mais".
3. ✅ **Barra final no rodapé já corrigida** (`/blog/` e `/podcast/`). Era um 301 por link em **todas** as páginas do site, inclusive as comerciais.

**Regras de link dentro do `/podcast/` (o que o podcast pode e não pode fazer):**

- ✅ **Pode:** episódio ↔ episódio (anterior/próximo), episódio → hub, hub → episódio, e link para as plataformas do programa (Apple, Spotify, RSS) em **dofollow** — eles corroboram a entidade da série e são parte da correção.
- ⛔ **Não pode:** link para `/calculadora/`, `/quiz/`, `/analise-de-site-para-psicologo/` ou qualquer página do funil, no corpo **ou** no chrome. A seção continua sendo um beco sem saída **por decisão**, não por descuido. Registrar como intencional para ninguém "consertar" depois.
- **Âncoras do hub:** hoje cada episódio recebe dois links do hub, o segundo com `"Ler a transcrição →"` repetido 8×. Trocar por âncora descritiva e única: *"Ler a transcrição de 'Autoestima'"*. Diluição de âncora, correção trivial.
- **Navegação (decisão P2, aberta):** as páginas de episódio carregam a navbar da home, apontando para 6 âncoras de seções **Perfil A**. Isso é da mesma família do FAB, porém mais fraco: são links de navegação sem mensagem de venda, e o link para a raiz **ajuda** a amarrar as páginas à `Organization` que as publica. **Critério proposto:** um link é vazamento quando carrega **mensagem comercial**; link nu para a raiz não é. **Recomendação:** manter o link para a raiz e avaliar uma navbar específica do podcast pelo prop `navbar` do `BaseLayout` (o mecanismo já existe e já é usado por `/indicacao`), trocando as âncoras do funil por navegação do próprio programa.
- **Links externos dofollow para perfis pessoais da apresentadora** (Instagram, LinkedIn, WhatsApp, Lattes): 4 × 9 URLs = 36 saídas num site de 25 URLs indexáveis. ⚠️ **Decisão do dono do acordo, não técnica** — são contrapartida da promoção mútua. O custo em SEO fica sinalizado; a decisão não é deste briefing.
- **NAP:** o WhatsApp da apresentadora (DDD 49) convive com o telefone da `Organization` (DDD 21) em 9 URLs indexáveis. Ruído para resolução de entidade local, sistemático e não pontual. **Roteado ao dono do acordo** junto com o item anterior.

---

## 7. Política de CTA para uma seção não comercial

**Princípio:** o menu de CTA do `voice.md` ("Agende uma conversa", "Veja como funciona", "Dê o primeiro passo") é **B2B, para as duas ICPs comerciais**. Usá-lo aqui importaria o ICP comercial para uma página de paciente — que é a falha que o FAB cometeu. ⛔ **Não aplicar `voice.md` §CTA nas páginas do podcast.**

**O que uma página do podcast PODE rotear:**

| Destino | Natureza | Regra |
|---|---|---|
| Apple Podcasts · Spotify · RSS | plataformas do programa | ✅ dofollow, corroboram a entidade da série |
| Outro episódio · hub | navegação interna da seção | ✅ âncora descritiva |
| Instagram · LinkedIn · WhatsApp · Lattes da apresentadora | contrapartida do acordo | ✅ mantido; `rel` sob decisão do dono (§6.3) |

**O que ela NÃO pode rotear, em nenhuma hipótese:**

- ⛔ Qualquer página do funil PsiAtiva (`/calculadora/`, `/quiz/`, `/analise-de-site-para-psicologo/`, seções comerciais da home).
- ⛔ Qualquer WhatsApp com mensagem comercial pré-preenchida. **Precedente:** o FAB levava *"gostaria de agendar o diagnóstico gratuito da minha clínica"*, mensagem Perfil A, à Audiência C, em 9 URLs. Já removido.
- ⛔ Qualquer captura de contato, formulário ou isca.
- ⛔ **Preço, garantia, prazo ou condição.** Regra de Ferro da [`oferta-travada.md`](../../../../_config/oferta-travada.md).

**Verbo de CTA autorizado (informacional, não comercial):** *"Ouça o episódio"*, *"Ouça no Apple ou no Spotify"*, *"Siga para saber quando sai episódio novo"*, *"Ler a transcrição de '<título>'"*. Sem exclamação, sem urgência, sem promessa.

⚠️ **Estado mais seguro é o estado atual: a seção não tem superfície de oferta nenhuma.** Manter assim. Qualquer proposta futura de "aproveitar o tráfego do podcast" volta para este briefing e para o `offer-guardian` antes de virar código.

---

## 8. Gates obrigatórios antes de publicar

Nenhum destes foi executado aqui. Cada um roda no seu agente.

- [ ] **`psiativa-voice-auditor`** — sobre a **camada editorial nova** (seoTitle, metaDescription, TL;DR, H2, FAQ, âncoras, `PODCAST.description`). ⛔ **Não auditar a transcrição literal**: é fala de terceiro, já auditada, e "corrigir" a voz dela seria adulterar o registro.
- [ ] **`cfp-compliance` — passe FULL, não light.** A audiência é paciente: é o critério que separa os dois passes. Cobrir obrigatoriamente TL;DR, H2, FAQ e `metaDescription` dos 8 episódios. Referência do que já foi decidido: [`CFP-AUDIT.md`](../../../podcast/CFP-AUDIT.md), notas editoriais do ep03 (previsão taxativa de resultado) e ep08 (erro factual). ⚠️ Se algum H2 ou FAQ **reescrever** a fala em vez de marcá-la, a auditoria da transcrição é reaberta.
- [ ] **`offer-guardian`** — varredura de confirmação. Por construção o resultado esperado é **zero linha**; o gate serve para provar isso, não para negociar exceção.
- [ ] **Triagem §4.2 (G1 a G6)** — obrigatória para **todo episódio novo**, antes de virar página. É o gate que faltou em 2026-08-24.
- ⚠️ Esta seção **nunca** publica preço, garantia, prazo ou condição.

**Handoffs que este briefing não executa:**

- **Lacuna de conteúdo (fica aberta):** o cluster Perfil B tem 4 satélites e **nenhum pilar**, e não existe cluster Perfil A no blog. É o caminho que corrige a razão de corpus e a razão de "processo" (§2.5) somando do lado comercial. → `psiativa-seo-briefer`, briefing próprio.
- **Fora do escopo do podcast, P0 do site:** o `robots.txt` ao vivo serve dois blocos contraditórios (Cloudflare Managed com `Disallow: /` para GPTBot/ClaudeBot/Google-Extended/CCBot, e depois o bloco do repositório liberando os mesmos). Comportamento real por crawler é **indeterminado** e não foi testável. → decisão de infraestrutura.
- **`MEMORY.md` do podcast:** aplicar as correções §0.1 (volume), §0.2 (links no chrome), §0.3 (rename fora da mesa), colar a regra §4.3, e registrar as duas leituras de GSC (§5.3) quando acontecerem.

---

```
TARGET: /podcast/ (hub + 8 episódios) — contenção retroativa, gate que faltou em 2026-08-24
ICP: B (consultório solo) · audiência da seção = Audiência C (paciente/público geral), não-ICP, explicitamente cercada
CLUSTER: Previsibilidade & captação solo (B2B) — o /podcast/ entra como seção CONTIDA, fora do cluster
CANNIBALIZATION: differentiate — query = ZERO (corpora lexicalmente disjuntos, medido);
  entidade = colisão confirmada e já resolvida por @id + sameAs; rename da série fora da mesa (nome real na Apple/Spotify)
DE-INDEX: rejeitado como remédio; plano B condicionado com gatilho T1/T2/T3 no GSC em +30 e +90 dias (§5)
SAVED: landing-page-v2/seo/briefings/brief-podcast-anticanibalizacao.md
NEXT: (1) camada editorial dos 9 páginas → voice-auditor + cfp-compliance FULL + offer-guardian;
  (2) subir /calculadora/ e /quiz/ no rodapé (correção é do lado comercial, não do podcast);
  (3) triagem G1-G6 obrigatória em todo episódio novo; (4) leitura de GSC em 2026-09-23 e 2026-11-22
```
