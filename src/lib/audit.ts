// ─────────────────────────────────────────────────────────────
// Raio-X do Site — tipos do contrato + validação de entrada (puro)
// ─────────────────────────────────────────────────────────────
// Sprint 17a, Fase 5 (plans/sprint-17-presence-diagnostic-mini-tools.md).
// Contrato: plans/audit-site-capture-contract.md.
//
// ⛔ REGRA DE FERRO — este módulo NÃO calcula o R$.
// A perda mensal é recomputada NO SERVIDOR (audit/impact.py) e chega
// pronta na resposta do `/raio-x/reveal`. As taxas de escape por dor
// são HIPÓTESE, não medição, e ficam server-side justamente pra que
// não possam ser lidas do bundle nem ajustadas por intuição numa call.
// O cliente aqui só valida entrada e desenha o que o servidor devolveu.
//
// ⛔ `impacto: null` é resultado VÁLIDO, não erro (contrato §5): a dor
// dominante passou, ou a perda ficou abaixo do piso de relevância.
// A island cai no handoff sem número. Leak-proof por padrão.

// ── As 5 dores da rubrica (audit/rubric.py) ───────────────────
// Chaves monolíngues: são lógica e viajam no payload. Os rótulos
// bilíngues ficam em config/audit-site.config.ts.
export type DorDominante =
  | "clareza"
  | "contato"
  | "percepcao"
  | "prova"
  | "direcao_comercial";

export const DORES: DorDominante[] = [
  "clareza",
  "contato",
  "percepcao",
  "prova",
  "direcao_comercial",
];

// ── Entradas do visitante (contrato §3) ───────────────────────
export interface AuditInputs {
  /** R$ por sessão. */
  ticket: number;
  /** Sessões por SEMANA (o servidor multiplica por 4, não por 4,33). */
  sessoesSemana: number;
}

export const INPUT_BOUNDS = {
  ticket: { min: 50, max: 1000, step: 10, default: 200 },
  sessoesSemana: { min: 1, max: 60, step: 1, default: 10 },
} as const;

export const DEFAULT_INPUTS: AuditInputs = {
  ticket: INPUT_BOUNDS.ticket.default,
  sessoesSemana: INPUT_BOUNDS.sessoesSemana.default,
};

// ── Contrato §3 — resposta do /raio-x/scan (sem lead, SEM R$) ──
export interface AuditCheck {
  key: DorDominante;
  passou: boolean;
  /** Evidência citada pelo modelo. O modelo julga; o Python conta. */
  evidencia?: string;
}

export interface ScanResponse {
  ok: true;
  /** Opaco, ≤15 min. Não carrega o número, só aponta pra ele. */
  scanToken: string;
  /** Derivado em Python: 20 × (5 − falhas). Nunca pedido ao modelo. */
  score: number;
  falhas: number;
  classificacao: string;
  dorDominante: DorDominante;
  dorDominanteLabel: string;
  dorDominanteJustificativa: string;
  checks: AuditCheck[];
  /** Viajam sempre: julgamento varia entre modelos, aritmética não. */
  provider: string;
  model: string;
}

// ── Contrato §4 — resposta do /raio-x/reveal ──────────────────
export interface Impacto {
  perdaMes: number;
  base: "dor_dominante";
  dorDominante: DorDominante;
  taxaEscape: number;
  faturamentoMesBase: number;
  sessoesMesEquivalentes: number;
  /** Frase montada no servidor. A island RENDERIZA, não reescreve. */
  frase: string;
}

export interface RevealPayload {
  ok: true;
  /** null = handoff sem número. Ver contrato §5. */
  impacto: Impacto | null;
}

// ── Recusas esperadas do motor (Fase 4) ───────────────────────
// 503 sozinho NÃO distingue as duas causas: o Switch manda kill_switch
// e teto_diario pela mesma porta. Quem separa é o `motivo` no corpo.
export interface HandoffRecusa {
  ok: false;
  handoff: true;
  motivo: "teto_diario" | "kill_switch" | string;
}

export function isHandoff(body: unknown): body is HandoffRecusa {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { handoff?: unknown }).handoff === true
  );
}

// ── Validação da URL ──────────────────────────────────────────
// Cada domínio não-cacheado custa 1 Browser Rendering + 1 chamada LLM.
// Barrar lixo aqui é a alavanca de custo mais barata que existe: ela
// roda antes do captcha e antes do POST.

export type UrlError = "vazia" | "malformada" | "sem_ponto" | "nao_publica";

export interface UrlCheck {
  ok: boolean;
  /** Normalizada (https:// aplicado, espaços fora). Só quando ok. */
  url?: string;
  /** Hostname puro, pra exibir e pra bater com o cache por domínio. */
  host?: string;
  erro?: UrlError;
}

/** Hosts que nunca valem uma chamada paga. */
function isNaoPublica(host: string): boolean {
  if (host === "localhost" || host.endsWith(".localhost")) return true;
  if (host.endsWith(".local") || host.endsWith(".internal")) return true;
  // IPv4 literal, e qualquer coisa entre colchetes (IPv6).
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  if (host.startsWith("[")) return true;
  return false;
}

/**
 * Normaliza o que a visitante digitou. Ela digita `psiativa.com.br`,
 * não `https://psiativa.com.br/` — exigir o esquema seria cobrar dela
 * um conhecimento que não é o ponto da ferramenta.
 */
export function checkUrl(raw: string): UrlCheck {
  const limpo = (raw || "").trim();
  if (!limpo) return { ok: false, erro: "vazia" };

  const comEsquema = /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;

  let parsed: URL;
  try {
    parsed = new URL(comEsquema);
  } catch {
    return { ok: false, erro: "malformada" };
  }

  const host = parsed.hostname.toLowerCase();
  if (!host) return { ok: false, erro: "malformada" };
  // Um host sem ponto é `exemplo`, não um domínio — e o fetch gastaria
  // a chamada pra descobrir isso.
  if (!host.includes(".")) return { ok: false, erro: "sem_ponto" };
  if (isNaoPublica(host)) return { ok: false, erro: "nao_publica" };

  return { ok: true, url: parsed.toString(), host };
}

// ── Validação dos números ─────────────────────────────────────
export type InputsError = "ticket" | "sessoesSemana";

export function checkInputs(inputs: AuditInputs): InputsError[] {
  const erros: InputsError[] = [];
  const { ticket, sessoesSemana } = INPUT_BOUNDS;

  if (
    !Number.isFinite(inputs.ticket) ||
    inputs.ticket < ticket.min ||
    inputs.ticket > ticket.max
  ) {
    erros.push("ticket");
  }
  if (
    !Number.isFinite(inputs.sessoesSemana) ||
    inputs.sessoesSemana < sessoesSemana.min ||
    inputs.sessoesSemana > sessoesSemana.max
  ) {
    erros.push("sessoesSemana");
  }
  return erros;
}

// ── Formatação ────────────────────────────────────────────────
const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** R$ inteiro, sem centavos. O servidor já arredondou pra baixo. */
export function formatBRL(v: number): string {
  return brl.format(Math.round(v));
}
