// ─────────────────────────────────────────────────────────────
// Raio-X do Site — configuração PÚBLICA (camada indexável + island)
// ─────────────────────────────────────────────────────────────
// Sprint 17a, Fase 5 (plans/sprint-17-presence-diagnostic-mini-tools.md).
// Contrato: plans/audit-site-capture-contract.md.
//
// REGRA DE FERRO: nada aqui é número da PsiAtiva (preço/fee/garantia/mídia).
// O R$ da revelação vem do servidor, já montado em `impacto.frase`.
//
// ICP: **entrada ICP-neutra, resultado single-ICP** (o padrão do /quiz, que é
// a exceção carved-out da regra "nunca misture as duas ICPs"). A URL não sabe
// se quem digitou tem recepção ou atende sozinha, então a camada que ranqueia
// fala com "você" e com "seu site". Quem escolhe a ICP é o resultado, a partir
// do que o scan leu. ⛔ Não reintroduza sinais de clínica (equipe, recepção)
// nesta camada: é ela que evita canibalizar a home (clínica) e a /calculadora
// (solo). Decisão de 2026-08-24, fecha a pendência da linha 86 do plano.

import type { AuditInputs, DorDominante } from "../lib/audit";
import type { L10n } from "../lib/useSiteLang";

import { INPUT_BOUNDS } from "../lib/audit";

// ── Campos de entrada ─────────────────────────────────────────
// ⚠️ O workflow valida ticket e sessoesSemana como um PAR: "mande os dois ou
// nenhum". A island sempre manda os dois (têm default), então o par fecha.
export interface FieldDef {
  key: keyof AuditInputs;
  label: L10n;
  helper?: L10n;
  prefix?: string;
  suffix?: L10n;
  min: number;
  max: number;
  step: number;
}

export const FIELDS: FieldDef[] = [
  {
    key: "ticket",
    label: { pt: "Valor da sessão", en: "Session price" },
    helper: {
      pt: "Quanto você cobra por sessão hoje.",
      en: "What you charge per session today.",
    },
    prefix: "R$",
    min: INPUT_BOUNDS.ticket.min,
    max: INPUT_BOUNDS.ticket.max,
    step: INPUT_BOUNDS.ticket.step,
  },
  {
    key: "sessoesSemana",
    label: { pt: "Sessões por semana", en: "Sessions per week" },
    helper: {
      pt: "Quantas sessões acontecem numa semana normal.",
      en: "How many sessions happen in a normal week.",
    },
    suffix: { pt: "/semana", en: "/week" },
    min: INPUT_BOUNDS.sessoesSemana.min,
    max: INPUT_BOUNDS.sessoesSemana.max,
    step: INPUT_BOUNDS.sessoesSemana.step,
  },
];

// ── As 5 dores da rubrica ─────────────────────────────────────
// ⛔ A chave `direcao_comercial` é NOME INTERNO do motor. O rótulo público
// nunca diz "comercial": palavra proibida em copy externa.
export const DOR_LABELS: Record<DorDominante, L10n> = {
  clareza: { pt: "Clareza", en: "Clarity" },
  contato: { pt: "Contato", en: "Contact" },
  percepcao: { pt: "Cuidado", en: "Care" },
  prova: { pt: "Confiança", en: "Trust" },
  direcao_comercial: { pt: "Próximo passo", en: "Next step" },
};

/** O que cada check pergunta, em uma frase. Camada indexável e island. */
export const DOR_PERGUNTAS: Record<DorDominante, L10n> = {
  clareza: {
    pt: "Em poucos segundos dá pra entender quem você atende e com o quê?",
    en: "Within seconds, is it clear who you see and for what?",
  },
  contato: {
    pt: "Existe um caminho clicável pra te chamar, sem procurar?",
    en: "Is there a clickable way to reach you, without hunting for it?",
  },
  percepcao: {
    pt: "O site parece cuidado e atualizado, ou parece abandonado?",
    en: "Does the site look cared for and current, or abandoned?",
  },
  prova: {
    pt: "Aparecem sinais verificáveis de quem você é: CRP, formação, abordagem?",
    en: "Are there verifiable signals of who you are: license, training, approach?",
  },
  direcao_comercial: {
    pt: "Depois de ler, fica claro qual é o próximo passo?",
    en: "After reading, is the next step clear?",
  },
};

// ⛔ DIVERGÊNCIA CFP DELIBERADA (audit/rubric.py, README "A divergência CFP"):
// depoimento de paciente NUNCA conta como prova aqui e NUNCA é recomendado
// como conserto. A CFP 06/2019 proíbe, e esta ferramenta aconselha a
// psicóloga. ⛔ Não "conserte" isso de volta pra skill diagnostico-2min.
export const PROVA_NOTA: L10n = {
  pt: "Sinal verificável é CRP, formação e abordagem. Depoimento de paciente não entra, e a gente nunca vai sugerir que entre.",
  en: "A verifiable signal is your license, training and approach. Patient testimonials do not count, and we will never suggest they should.",
};

// ── Selo e disclaimer ─────────────────────────────────────────
// ⚠️ As taxas de escape são HIPÓTESE, não medição (contrato §5). Por isso o
// número só pode aparecer como "a partir de", e o selo diz isso na cara.
export const SELO_ESTIMATIVA: L10n = {
  pt: "A estimativa parte dos seus próprios números e de uma leitura conservadora do que escapa. Trate o resultado como um piso.",
  en: "The estimate starts from your own numbers and a conservative read of what escapes. Treat the result as a floor.",
};

export const DISCLAIMER: L10n = {
  pt: "A leitura é automática e olha só o que está público no seu site. Não substitui uma conversa, e não representa promessa de faturamento.",
  en: "The read is automatic and only looks at what is public on your site. It does not replace a conversation, and it is not a promise of revenue.",
};

// ⚠️ O POV/IAT do briefing NÃO mora aqui: ele é camada indexável, então vive
// em translations.json (`raioX.pov`) e é renderizado estático pela página.
// Duplicar aqui criaria a mesma deriva de copy que o CLAUDE.md documenta.

// ── Captura ───────────────────────────────────────────────────
// ⛔ NÃO é o PUBLIC_N8N_CAPTURE_WEBHOOK do quiz/calculadora. Dois endpoints
// dedicados, porque o fluxo tem dois round-trips. Ver .env.example.
export const CAPTURE = {
  scanEnvKey: "PUBLIC_N8N_RAIOX_SCAN_WEBHOOK" as const,
  revealEnvKey: "PUBLIC_N8N_RAIOX_REVEAL_WEBHOOK" as const,
  source: "audit_site" as const,
  page: "raio-x-site" as const,
};
