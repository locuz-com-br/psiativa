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

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  helper?: string;
}

export interface FieldDef {
  key: keyof CalcInputs;
  label: string;
  helper?: string;
  prefix?: string;
  suffix?: string;
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
  { value: "autonomo", label: "Atendo sozinho(a)", helper: "Consultório solo, sem recepção." },
  { value: "clinica", label: "Tenho equipe / recepção", helper: "Clínica com mais profissionais." },
];

// P3K fica de fora: a garantia dele é de processo, não de faturamento
// (§1 do plano). Nomes comerciais — nunca o nome técnico.
export const PRODUTO_OPTIONS: SelectOption<Produto>[] = [
  {
    value: "p7k",
    label: "Processo previsível",
    helper: "Estrutura para encher a agenda com constância.",
  },
  {
    value: "p10k",
    label: "Autoridade + processo",
    helper: "Estrutura completa para virar referência na sua especialidade.",
  },
];

// ── Campos de entrada (Bloco A — público) ─────────────────────
export const FIELDS: FieldDef[] = [
  {
    key: "ticket",
    label: "Valor da sessão",
    helper: "Quanto você cobra por sessão hoje.",
    prefix: "R$",
    min: 50,
    max: 1000,
    step: 10,
  },
  {
    key: "sessoesMes",
    label: "Sessões por mês",
    helper: "Quantas sessões um paciente ativo costuma fazer por mês.",
    suffix: "/mês",
    min: 1,
    max: 12,
    step: 1,
  },
  {
    key: "entradasAtuais",
    label: "Pacientes novos por mês, hoje",
    helper: "Quantos pacientes novos entram hoje, normalmente por indicação.",
    suffix: "/mês",
    min: 0,
    max: 50,
    step: 1,
  },
  {
    key: "entradasMetodo",
    label: "Pacientes novos por mês, com um processo",
    helper: "Um cenário com captação ativa. Ajuste para o que seria realista pra você.",
    suffix: "/mês",
    min: 0,
    max: 50,
    step: 1,
  },
  {
    key: "retencaoMeses",
    label: "Tempo médio de acompanhamento",
    helper: "Por quantos meses, em média, um paciente continua com você.",
    suffix: "meses",
    min: 1,
    max: 24,
    step: 1,
  },
];

// ── Selo travado do Bloco A (§3) — understated por design ──────
export const SELO_PROJECAO =
  "Projeção baseada nos seus números e numa retenção que você ajusta. Não é garantia. A meta é definida junto, na primeira conversa.";

// Letra miúda, presente mas não destacada (estilo "imagem meramente
// ilustrativa"). A honestidade é estrutural, não vem do aviso.
export const DISCLAIMER =
  "Os valores são uma projeção a partir dos números que você informa, num modelo de coorte. Não representam promessa de faturamento.";

// ── POV / IAT (briefing §3) ───────────────────────────────────
export const POV = "A conta é sua, não nossa.";

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
