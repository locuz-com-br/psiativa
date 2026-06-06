// ─────────────────────────────────────────────────────────────
// Quiz de Diagnóstico — motor de pontuação (puro)
// ─────────────────────────────────────────────────────────────
// Plano: plans/quiz-diagnostico/plan.md
//
// IMPORTANTE — REGRA DE FERRO (§0 do plano): este módulo, a página e o
// quiz.json NUNCA contêm preço, garantia, prazo ou condição da PsiAtiva.
// O quiz só nomeia a dor + entrega a isca (de graça) + roteia um lead
// quente e qualificado para uma conversa, onde a oferta-travada governa.
//
// O quiz é UM só e serve os DOIS ICPs (decisão 2026-06-03): as perguntas
// perfilam o ICP (autônoma vs. clínica) pelas respostas; cada RESULTADO
// fala com exatamente um ICP (§0 regra 2 — nunca misturar os dois numa
// mesma tela). A pureza acontece no resultado; a segmentação, no fluxo.
//
// Conteúdo (perguntas/pesos/resultados) vive em src/data/quiz.json — este
// motor só lê. Editar copy/pesos sem tocar no componente.

export type Icp = "clinica" | "autonoma";

// Temperatura do lead (intensivo — três tipos de lead). Define a cadência
// da Renata, não aparece para a pessoa. Vai no envelope do payload.
export type Temperature = "desesperado" | "curioso" | "acomodado";

// Chaves de dor — taggeadas por ICP. MVP: top 3 por ICP (decisão de build).
// Expandir para as 5 de cada (§4 do plano) é só editar o quiz.json (P3).
export type PainKey =
  | "clinica_previsibilidade"
  | "clinica_correria"
  | "clinica_dependencia"
  | "solo_perda_silenciosa"
  | "solo_oscilante"
  | "solo_vps";

export type QuestionKind = "profiling" | "diagnostic" | "temperature";

export interface QuizOption {
  id: string;
  label: string;
  /** profiling: soma na contagem de ICP */
  icp?: Partial<Record<Icp, number>>;
  /** diagnostic: soma na contagem de dor */
  pains?: Partial<Record<PainKey, number>>;
  /** temperature: define a temperatura do lead diretamente */
  temperature?: Temperature;
}

export interface QuizQuestion {
  id: string;
  kind: QuestionKind;
  prompt: string;
  helper?: string;
  options: QuizOption[];
}

// Tela de resultado — single-ICP (§0 regra 2). SEM preço, SEM garantia,
// SEM menu de produto, SEM link de download (a isca vai pela Renata no
// WhatsApp; o telefone é a porta de verdade).
export interface QuizResultContent {
  key: PainKey;
  icp: Icp;
  /** slug da dor → source_detail / campaign (§5 do plano) */
  slug: string;
  /** nome da dor (rótulo curto) */
  painName: string;
  /** a dor devolvida nas palavras dela (a lead verbaliza o próprio problema) */
  echo: string;
  /** a implicação: o custo escondido que a tela faz a lead sentir (§4) */
  hemorrhage: string;
  /** frame aspiracional SUAVE — "o que muda quando isso para de vazar".
   *  NUNCA uma promessa quantificada (§0 regra 1). */
  aspiration: string;
  /** nome da isca (material grátis) — exibido, mas SEM link de download */
  iscaTitle: string;
  /** microcopy do passo de captura ("pra receber o [isca]...") */
  iscaPromise: string;
}

export interface QuizContent {
  intro: {
    tag: string;
    title: string;
    subtitle: string;
    note: string;
    start: string;
  };
  questions: QuizQuestion[];
  results: QuizResultContent[];
  capture: {
    eyebrow: string;
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    phoneLabel: string;
    phonePlaceholder: string;
    submit: string;
    sending: string;
    micro: string;
    phoneRequired: string;
    captchaRequired: string;
    error: string;
  };
  handoff: {
    title: string;
    body: string;
  };
  ui: {
    progress: string;
    back: string;
    resultEyebrow: string;
    restart: string;
    disclaimer: string;
  };
}

export interface Answer {
  questionId: string;
  optionId: string;
  /** rótulo verbatim que ela escolheu — vai no envelope (palavras dela) */
  label: string;
}

export interface QuizOutcome {
  icp: Icp;
  dominant: QuizResultContent;
  /** demais dores do ICP inferido com pontuação > 0, ranqueadas */
  secondary: QuizResultContent[];
  temperature: Temperature;
  /** placar por chave de dor (debug / envelope) */
  painScores: Partial<Record<PainKey, number>>;
}

// Envelope `quiz` jsonb gravado em leads_master (§5 do plano). Espelha a
// convenção enrichment_v2/reactivation: sem DDL largo, tudo num jsonb.
export interface QuizEnvelope {
  icp: Icp;
  answers: Answer[];
  dominant_pain: PainKey;
  dominant_pain_slug: string;
  secondary_pains: PainKey[];
  temperature: Temperature;
  isca: string;
  /** a Renata vira pra true depois do send-document */
  isca_delivered: boolean;
  campaign: string | null;
  completed_at: string;
}

// ── Helpers ───────────────────────────────────────────────────

function optionFor(content: QuizContent, answer: Answer): QuizOption | undefined {
  const q = content.questions.find((x) => x.id === answer.questionId);
  return q?.options.find((o) => o.id === answer.optionId);
}

/**
 * Infere o ICP somando os pesos `icp` das opções escolhidas (perguntas de
 * perfil). Empate ou zero → "clinica" (ICP primário do negócio).
 */
export function inferIcp(content: QuizContent, answers: Answer[]): Icp {
  let clinica = 0;
  let autonoma = 0;
  for (const a of answers) {
    const opt = optionFor(content, a);
    if (!opt?.icp) continue;
    clinica += opt.icp.clinica ?? 0;
    autonoma += opt.icp.autonoma ?? 0;
  }
  return autonoma > clinica ? "autonoma" : "clinica";
}

/**
 * Soma os pesos de dor de todas as opções escolhidas (perguntas de
 * diagnóstico). Uma mesma resposta pode pontuar a dor equivalente em cada
 * ICP — no resultado só contam as dores do ICP inferido.
 */
export function tallyPains(content: QuizContent, answers: Answer[]): Partial<Record<PainKey, number>> {
  const scores: Partial<Record<PainKey, number>> = {};
  for (const a of answers) {
    const opt = optionFor(content, a);
    if (!opt?.pains) continue;
    for (const [k, v] of Object.entries(opt.pains)) {
      const key = k as PainKey;
      scores[key] = (scores[key] ?? 0) + (v ?? 0);
    }
  }
  return scores;
}

/**
 * Temperatura vem da pergunta de intensidade/timing (a opção que carrega
 * `temperature`). Default "curioso" (cadência de nutrição antes de R1).
 */
export function deriveTemperature(content: QuizContent, answers: Answer[]): Temperature {
  for (const a of answers) {
    const opt = optionFor(content, a);
    if (opt?.temperature) return opt.temperature;
  }
  return "curioso";
}

/**
 * Resultado completo: ICP inferido → dores do ICP ranqueadas → dominante
 * (+ secundárias para o envelope) → temperatura. Se nenhuma dor do ICP
 * pontuou, cai na dor-assinatura (primeiro resultado daquele ICP).
 */
export function computeOutcome(content: QuizContent, answers: Answer[]): QuizOutcome {
  const icp = inferIcp(content, answers);
  const painScores = tallyPains(content, answers);
  const temperature = deriveTemperature(content, answers);

  const icpResults = content.results.filter((r) => r.icp === icp);
  const ranked = [...icpResults].sort(
    (a, b) => (painScores[b.key] ?? 0) - (painScores[a.key] ?? 0),
  );

  // Fallback: tudo zerado → dor-assinatura do ICP (primeira na ordem do JSON).
  const anyScored = ranked.some((r) => (painScores[r.key] ?? 0) > 0);
  const ordered = anyScored ? ranked : icpResults;

  const dominant = ordered[0];
  const secondary = ordered.slice(1).filter((r) => (painScores[r.key] ?? 0) > 0);

  return { icp, dominant, secondary, temperature, painScores };
}

/**
 * Monta o envelope `quiz` jsonb (§5). `campaign` vem do ?c= da URL (a
 * sequência de stories ataca uma dor e marca o link); null se orgânico.
 */
export function buildEnvelope(
  outcome: QuizOutcome,
  answers: Answer[],
  campaign: string | null,
): QuizEnvelope {
  return {
    icp: outcome.icp,
    answers,
    dominant_pain: outcome.dominant.key,
    dominant_pain_slug: outcome.dominant.slug,
    secondary_pains: outcome.secondary.map((r) => r.key),
    temperature: outcome.temperature,
    isca: outcome.dominant.iscaTitle,
    isca_delivered: false,
    campaign,
    completed_at: new Date().toISOString(),
  };
}
