// ─────────────────────────────────────────────────────────────
// Calculadora — configuração PÚBLICA (camada indexável + island)
// ─────────────────────────────────────────────────────────────
// Sprint 6 (plans/sprint-6-roi-calculator-cost-of-inaction.md).
//
// REGRA DE FERRO: nada aqui é número da PsiAtiva (preço/fee/mídia).
// Só defaults do ICP, rótulos e copy. O investimento da revelação
// gated vem do webhook n8n (plans/calculadora-capture-contract.md).
//
// ICP-alvo da camada indexável: Perfil B — consultório solo
// (ver plans/seo-briefing-roi-calculator.md). A island mantém os
// dois seletores; o texto que ranqueia fala com a solo.

import type { CalcInputs, Perfil, Produto } from "../lib/calculadora";
import type { L10n } from "../lib/useSiteLang";

// BILÍNGUE: rótulos/copy são { pt, en } (L10n), resolvidos na island com
// pick()/useSiteLang. Números (min/max/step/defaults) e `value`/`key` são
// invariantes. `prefix` ("R$") é símbolo de moeda, neutro de idioma.

export interface SelectOption<T extends string> {
  value: T;
  label: L10n;
  helper?: L10n;
}

export interface FieldDef {
  key: keyof CalcInputs;
  label: L10n;
  helper?: L10n;
  prefix?: string;
  suffix?: L10n;
  min: number;
  max: number;
  step: number;
}

// ── Defaults (§4 do plano) ────────────────────────────────────
export const DEFAULT_INPUTS: CalcInputs = {
  ticket: 250,
  sessoesMes: 4, // → R$ 1.000/mês por paciente ativo
  entradasAtuais: 2, // realidade comum: poucas entradas, dependentes de indicação
  entradasMetodo: 5, // cenário com captação ativa (editável, rotulado "cenário")
  retencaoMeses: 6,
  horizonteMeses: 6, // ciclo travado
};

// ── Seletores (§1 do plano) ───────────────────────────────────
// Dois toggles obrigatórios — sem eles nenhum número gated é honesto.
// Nunca misturar ICP num mesmo cálculo (regra dura do CLAUDE.md).
export const PERFIL_OPTIONS: SelectOption<Perfil>[] = [
  {
    value: "autonomo",
    label: { pt: "Atendo sozinho(a)", en: "I practice on my own" },
    helper: { pt: "Consultório solo, sem recepção.", en: "Solo practice, no front desk." },
  },
  {
    value: "clinica",
    label: { pt: "Tenho equipe / recepção", en: "I have a team / front desk" },
    helper: { pt: "Clínica com mais profissionais.", en: "Clinic with more professionals." },
  },
];

// P3K fica de fora: a garantia dele é de processo, não de faturamento
// (§1 do plano). Nomes comerciais — nunca o nome técnico.
export const PRODUTO_OPTIONS: SelectOption<Produto>[] = [
  {
    value: "p7k",
    label: { pt: "Processo previsível", en: "Predictable process" },
    helper: {
      pt: "Estrutura para encher a agenda com constância.",
      en: "Structure to fill the schedule steadily.",
    },
  },
  {
    value: "p10k",
    label: { pt: "Autoridade + processo", en: "Authority + process" },
    helper: {
      pt: "Estrutura completa para virar referência na sua especialidade.",
      en: "Complete structure to become a reference in your specialty.",
    },
  },
];

// ── Campos de entrada (Bloco A — público) ─────────────────────
export const FIELDS: FieldDef[] = [
  {
    key: "ticket",
    label: { pt: "Valor da sessão", en: "Session price" },
    helper: { pt: "Quanto você cobra por sessão hoje.", en: "What you charge per session today." },
    prefix: "R$",
    min: 50,
    max: 1000,
    step: 10,
  },
  {
    key: "sessoesMes",
    label: { pt: "Sessões por mês", en: "Sessions per month" },
    helper: {
      pt: "Quantas sessões um paciente ativo costuma fazer por mês.",
      en: "How many sessions an active patient usually has per month.",
    },
    suffix: { pt: "/mês", en: "/mo" },
    min: 1,
    max: 12,
    step: 1,
  },
  {
    key: "entradasAtuais",
    label: { pt: "Pacientes novos por mês, hoje", en: "New patients per month, today" },
    helper: {
      pt: "Quantos pacientes novos entram hoje, normalmente por indicação.",
      en: "How many new patients come in today, usually by referral.",
    },
    suffix: { pt: "/mês", en: "/mo" },
    min: 0,
    max: 50,
    step: 1,
  },
  {
    key: "entradasMetodo",
    label: { pt: "Pacientes novos por mês, com um processo", en: "New patients per month, with a process" },
    helper: {
      pt: "Um cenário com captação ativa. Ajuste para o que seria realista pra você.",
      en: "A scenario with active acquisition. Adjust it to what would be realistic for you.",
    },
    suffix: { pt: "/mês", en: "/mo" },
    min: 0,
    max: 50,
    step: 1,
  },
  {
    key: "retencaoMeses",
    label: { pt: "Tempo médio de acompanhamento", en: "Average length of care" },
    helper: {
      pt: "Por quantos meses, em média, um paciente continua com você.",
      en: "For how many months, on average, a patient stays with you.",
    },
    suffix: { pt: "meses", en: "months" },
    min: 1,
    max: 24,
    step: 1,
  },
];

// ── Selo travado do Bloco A (§3) — understated por design ──────
export const SELO_PROJECAO: L10n = {
  pt: "Projeção baseada nos seus números e numa retenção que você ajusta. Não é garantia. A meta é definida junto, na primeira conversa.",
  en: "A projection based on your numbers and a retention you adjust. It is not a guarantee. The target is set together, in the first conversation.",
};

// Letra miúda, presente mas não destacada (estilo "imagem meramente
// ilustrativa"). A honestidade é estrutural, não vem do aviso.
export const DISCLAIMER: L10n = {
  pt: "Os valores são uma projeção a partir dos números que você informa, num modelo de coorte. Não representam promessa de faturamento.",
  en: "The figures are a projection from the numbers you enter, in a cohort model. They are not a promise of revenue.",
};

// ── POV / IAT (briefing §3) ───────────────────────────────────
export const POV: L10n = { pt: "A conta é sua, não nossa.", en: "The math is yours, not ours." };

// ── Captura → pipeline (gated) ────────────────────────────────
// O POST vai para um webhook DEDICADO da LP (n8n), nunca Web3Forms.
// Compartilhado com o quiz, com `source` distinto.
export const CAPTURE = {
  /** lido via import.meta.env — ver .env.example */
  webhookEnvKey: "PUBLIC_N8N_CAPTURE_WEBHOOK" as const,
  source: "roi_calculator" as const,
};

// Ciclo exibido (meses) — espelha horizonteMeses.
export const CICLO_MESES = DEFAULT_INPUTS.horizonteMeses;
