// ─────────────────────────────────────────────────────────────
// Calculadora de Custo da Inação — modelo de coorte (puro)
// ─────────────────────────────────────────────────────────────
// Sprint 6 (plans/sprint-6-roi-calculator-cost-of-inaction.md).
//
// IMPORTANTE — REGRA DE FERRO: este módulo NÃO contém nenhum número
// da PsiAtiva (preço/fee/mídia/garantia). A camada pública usa só os
// números do próprio ICP. A revelação gated recebe o investimento de
// FORA — via resposta do webhook de captura n8n (que lê a oferta
// travada no servidor). Os valores travados NUNCA entram no bundle
// público. Ver plans/calculadora-capture-contract.md.

export type Perfil = "autonomo" | "clinica";
export type Produto = "p7k" | "p10k";

export interface CalcInputs {
  ticket: number; // R$ por sessão
  sessoesMes: number; // sessões/mês por paciente ativo
  entradasAtuais: number; // pacientes novos/mês HOJE (curva "sem método")
  entradasMetodo: number; // pacientes novos/mês no cenário "com método"
  retencaoMeses: number; // retenção média (meses) que o ICP ajusta
  horizonteMeses: number; // ciclo (default 6)
}

export interface Projection {
  mensalPorPaciente: number; // ticket × sessões/mês
  curvaSem: number[]; // faturamento acumulado mês a mês (sem método)
  curvaCom: number[]; // faturamento acumulado mês a mês (com método)
  curvaGap: number[]; // (com − sem) acumulado mês a mês
  projecaoSem: number; // acumulado no horizonte (sem método)
  projecaoCom: number; // acumulado no horizonte (com método)
  gap: number; // dinheiro deixado na mesa no ciclo (com − sem)
  piso: number; // banda honesta: retenção = 1 mês (não-recorrente)
  teto: number; // banda honesta: sem churn (retenção ≥ horizonte)
  autoQualified: boolean; // true ⇒ a conta dele já é boa; não precisa de processo
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatBRL(value: number): string {
  return brl.format(Math.round(Number.isFinite(value) ? value : 0));
}

const last = (arr: number[]): number => (arr.length ? arr[arr.length - 1] : 0);

/**
 * Faturamento ACUMULADO mês a mês para uma taxa de entrada `e`
 * (pacientes novos/mês), retenção `R` meses, horizonte `H` meses e
 * valor mensal por paciente ativo `mv`.
 *
 * Modelo de coorte (não multiplicação plana): no mês t, o número de
 * pacientes ainda ativos é `e × min(t, R)` — cada coorte que entrou
 * acumula enquanto não passa da retenção. Faturamento do mês t =
 * ativos × mv. A curva é a soma corrente.
 *
 * Conferência (defaults: e=5, mv=1000, H=6):
 *   piso  (R=1): Σ min(t,1)=6   → 5·1000·6  = R$ 30.000
 *   teto  (R≥6): Σ min(t,6)=21  → 5·1000·21 = R$ 105.000
 */
export function cumulativeRevenue(e: number, R: number, H: number, mv: number): number[] {
  const out: number[] = [];
  const ei = Math.max(0, e);
  const Ri = Math.max(0, R);
  const Hi = Math.max(1, Math.round(H));
  const mvi = Math.max(0, mv);
  let cum = 0;
  for (let t = 1; t <= Hi; t++) {
    const ativos = ei * Math.min(t, Ri);
    cum += ativos * mvi;
    out.push(cum);
  }
  return out;
}

export interface ProjectionOptions {
  /** gap/projeçãoCom abaixo deste ratio ⇒ auto-qualifica (default 0.10) */
  autoQualifyRatio?: number;
}

export function computeProjection(input: CalcInputs, opts: ProjectionOptions = {}): Projection {
  const { ticket, sessoesMes, entradasAtuais, entradasMetodo, retencaoMeses, horizonteMeses } = input;
  const H = Math.max(1, Math.round(horizonteMeses));
  const R = Math.max(0, retencaoMeses);
  const mv = Math.max(0, ticket) * Math.max(0, sessoesMes);

  const curvaSem = cumulativeRevenue(entradasAtuais, R, H, mv);
  const curvaCom = cumulativeRevenue(entradasMetodo, R, H, mv);
  const curvaGap = curvaCom.map((v, i) => Math.max(0, v - curvaSem[i]));

  const projecaoSem = last(curvaSem);
  const projecaoCom = last(curvaCom);
  const gap = Math.max(0, projecaoCom - projecaoSem);

  // Banda honesta sobre o cenário "com método".
  const piso = last(cumulativeRevenue(entradasMetodo, 1, H, mv));
  const teto = last(cumulativeRevenue(entradasMetodo, H, H, mv));

  // Honestidade estrutural (§4 do plano): se a conta dele já é boa,
  // a ferramenta diz isso — ele se auto-desqualifica.
  const ratio = opts.autoQualifyRatio ?? 0.1;
  const autoQualified =
    entradasMetodo <= entradasAtuais || projecaoCom <= 0 || gap / projecaoCom < ratio;

  return {
    mensalPorPaciente: mv,
    curvaSem,
    curvaCom,
    curvaGap,
    projecaoSem,
    projecaoCom,
    gap,
    piso,
    teto,
    autoQualified,
  };
}

// ── Revelação gated ───────────────────────────────────────────
// O investimento e a verba de mídia vêm SEMPRE de fora (webhook).
// Estas funções nunca embutem valor travado.

export interface RevealInput {
  /** VT "a partir de" (valor de TABELA). NUNCA o piso Pix. */
  investimento: number;
  /** verba de mídia mínima/mês (vai pro Google/Meta, não-reembolsável) */
  midiaMes: number;
}

export interface Reveal {
  /** ROI sobre o investimento PsiAtiva = gap ÷ investimento */
  roi: number;
  /** meses até o gap acumulado cobrir o investimento (null = não cobre no horizonte estendido) */
  paybackMeses: number | null;
  /** mídia no ciclo = midiaMes × horizonte */
  midiaCiclo: number;
  /** desembolso total transparente = investimento + mídia no ciclo */
  desembolsoTotal: number;
}

/**
 * Formato exato do JSON que o webhook de captura devolve à island
 * após gravar o lead (ver plans/calculadora-capture-contract.md).
 * Todos os números aqui são travados/derivados NO SERVIDOR.
 */
export interface RevealPayload {
  ok: boolean;
  /** VT "a partir de" (tabela) — a única âncora de preço que a página mostra */
  investimentoAPartirDe: number;
  midiaMes: number;
  midiaCiclo: number;
  desembolsoTotal: number;
  roi: number;
  paybackMeses: number | null;
  /** frase de garantia travada (segurança do downside), opcional */
  garantia?: string;
}

/**
 * Cálculo da revelação (ROI/payback/desembolso) DADO o investimento
 * travado. Usado pelo mock de DEV e espelhado pelo servidor n8n.
 * `paybackHorizonte` estende a curva do gap além do ciclo para achar
 * o ponto de retorno em regime estável.
 */
export function computeReveal(
  input: CalcInputs,
  proj: Pick<Projection, "gap" | "mensalPorPaciente">,
  reveal: RevealInput,
  paybackHorizonte = 24,
): Reveal {
  const investimento = Math.max(0, reveal.investimento);
  const H = Math.max(1, Math.round(input.horizonteMeses));
  const roi = investimento > 0 ? proj.gap / investimento : 0;
  const midiaCiclo = Math.max(0, reveal.midiaMes) * H;
  const desembolsoTotal = investimento + midiaCiclo;

  // A curva do gap = entradas incrementais (método − atuais) sob a
  // mesma retenção e valor mensal do próprio ICP.
  const eGap = Math.max(0, input.entradasMetodo - input.entradasAtuais);
  const curvaGapEstendida = cumulativeRevenue(eGap, input.retencaoMeses, paybackHorizonte, proj.mensalPorPaciente);
  let paybackMeses: number | null = null;
  for (let t = 0; t < curvaGapEstendida.length; t++) {
    if (curvaGapEstendida[t] >= investimento && investimento > 0) {
      paybackMeses = t + 1;
      break;
    }
  }

  return { roi, paybackMeses, midiaCiclo, desembolsoTotal };
}
