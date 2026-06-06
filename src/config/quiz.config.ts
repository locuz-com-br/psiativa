// ─────────────────────────────────────────────────────────────
// Quiz de Diagnóstico — configuração PÚBLICA (camada indexável + island)
// ─────────────────────────────────────────────────────────────
// Plano: plans/quiz-diagnostico/plan.md
//
// REGRA DE FERRO: nada aqui (nem no quiz.json, nem no bundle) é oferta da
// PsiAtiva (preço/garantia/prazo/condição). O quiz nomeia a dor + entrega a
// isca + roteia um lead quente. A oferta só aparece numa conversa governada
// por oferta-travada.md (§0 regra 1 do plano).

import quizData from "../data/quiz.json";
import type { QuizContent } from "../lib/quiz";

// Conteúdo tipado (perguntas/pesos/resultados editáveis no JSON, sem tocar
// no componente). O `_comment` do JSON é ignorado pela interface.
export const QUIZ = quizData as unknown as QuizContent;

// ── Captura → pipeline de lead ────────────────────────────────
// O POST vai para o MESMO webhook n8n da calculadora (DEDICADO da LP),
// nunca o Web3Forms do formulário de contato. O `source` distingue os dois.
// Ver plans/quiz-capture-contract.md.
export const CAPTURE = {
  /** lido via import.meta.env na island — ver .env.example */
  webhookEnvKey: "PUBLIC_N8N_CAPTURE_WEBHOOK" as const,
  /** distingue do roi_calculator no leads_master */
  source: "quiz_diagnostico" as const,
  page: "quiz" as const,
};

// Parâmetro de URL que a sequência de stories usa pra marcar qual dor o link
// atacou (?c=previsibilidade). Vira `campaign` no envelope (§5 do plano).
export const CAMPAIGN_PARAM = "c" as const;

// Slugs válidos de campanha = os slugs de resultado do quiz.json. Usado pra
// sanitizar o ?c= antes de mandar pro pipeline (não confiar em querystring crua).
export const CAMPAIGN_SLUGS = QUIZ.results.map((r) => r.slug);
