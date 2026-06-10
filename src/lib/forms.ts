// ─────────────────────────────────────────────────────────────
// Native Forms — schema + motor puro (sem DOM)
// ─────────────────────────────────────────────────────────────
// Plano: plans/native-forms/plan.md (§3, §4).
//
// Generaliza o motor do /quiz (src/lib/quiz.ts) para um engine de formulário
// reutilizável: um JSON por pesquisa, um conjunto de tipos de campo, captura
// e POST pro mesmo webhook n8n (distinção por `source`). Adicionar uma nova
// pesquisa nativa = 1 JSON + 1 página + 1 branch no n8n; SEM mexer no motor.
//
// REGRA DE VOZ/COMERCIAL: o conteúdo (JSON) é client-facing PT. Nada de preço,
// garantia, prazo ou condição. Sem travessão/meia-risca. Ver CLAUDE.md.

// ── Tipos de campo (decisão #1: core diagnostic set) ──────────
export type FieldType =
  | "single_select" // radio — avança sozinho
  | "multi_select" // checkboxes — botão Continuar, min/max
  | "open_text" // input curto
  | "long_text" // textarea
  | "rating" // escala 1–N (número/estrela) ou 0–10 (estilo NPS)
  | "statement" // só copy + Continuar (Formbricks "Statement/CTA")
  | "consent"; // checkbox obrigatório (Formbricks "Consent")

export interface FormOption {
  id: string;
  label: string;
  /** valor armazenado distinto do id (opcional; default = id) */
  value?: string;
}

export interface FormQuestion {
  id: string;
  type: FieldType;
  prompt: string;
  helper?: string;
  /** default: true para inputs; statement é sempre opcional */
  required?: boolean;
  // select:
  options?: FormOption[];
  minSelections?: number; // multi_select
  maxSelections?: number; // multi_select
  // text:
  placeholder?: string;
  maxLength?: number;
  // rating:
  scale?: {
    min: number;
    max: number;
    style?: "number" | "star";
    minLabel?: string;
    maxLabel?: string;
  };
  // statement:
  cta?: string; // rótulo do botão de continuar
  // ── ponto de extensão (NÃO usado enquanto linear — decisão #3) ──
  // showIf?: { questionId: string; equals: string | string[] };
}

export interface ContactStepConfig {
  enabled: boolean;
  eyebrow?: string;
  title?: string;
  micro?: string;
  collectName?: boolean; // default true
  collectEmail?: boolean; // default false
  collectPhone?: boolean; // default true
  requireCaptcha?: boolean; // default true → SITE_CONFIG.analytics.hcaptchaSiteKey
  nameLabel?: string;
  namePlaceholder?: string;
  emailLabel?: string;
  emailPlaceholder?: string;
  phoneLabel?: string;
  phonePlaceholder?: string;
  submit?: string;
  sending?: string;
  phoneRequired?: string;
  captchaRequired?: string;
  error?: string;
}

export interface FormUi {
  progress: string; // "{n} de {total}"
  back: string;
  next: string;
  required: string;
  selectAtLeast?: string; // template "{n}"
  selectAtMost?: string; // template "{n}"
  disclaimer?: string;
}

export interface FormContent {
  meta: { slug: string }; // == a chave no registro de forms.config.ts
  intro?: {
    tag?: string;
    title: string;
    subtitle?: string;
    note?: string;
    start: string;
  };
  questions: FormQuestion[];
  contact?: ContactStepConfig;
  thankYou: { title: string; body: string };
  ui: FormUi;
}

// ── Respostas + envelope ──────────────────────────────────────
export type AnswerValue = string | string[] | number | boolean;

export interface FormAnswer {
  questionId: string;
  type: FieldType;
  value: AnswerValue;
  /** rótulo verbatim escolhido (palavras dela) — vai no envelope */
  label?: string | string[];
}

/** envelope `survey` jsonb gravado em leads_master (espelha a convenção quiz/enrichment_v2) */
export interface FormEnvelope {
  slug: string;
  answers: FormAnswer[];
  campaign: string | null;
  completed_at: string;
}

/** contrato comum de todo renderer em components/forms/fields/* */
export interface FieldProps {
  question: FormQuestion;
  answer: FormAnswer | undefined;
  onChange: (value: AnswerValue, label?: string | string[]) => void;
}

// ── Validação (pura) ──────────────────────────────────────────
export type FieldError = "required" | "min" | "max" | "tooLong" | null;

export function validateAnswer(
  q: FormQuestion,
  answer: FormAnswer | undefined,
): FieldError {
  if (q.type === "statement") return null;
  const required = q.required ?? true;
  const v = answer?.value;
  const isEmpty =
    v === undefined ||
    v === null ||
    v === "" ||
    (Array.isArray(v) && v.length === 0);

  if (q.type === "consent") return v === true ? null : required ? "required" : null;
  if (required && isEmpty) return "required";

  if (q.type === "multi_select" && Array.isArray(v)) {
    if (q.minSelections != null && v.length < q.minSelections) return "min";
    if (q.maxSelections != null && v.length > q.maxSelections) return "max";
  }
  if ((q.type === "open_text" || q.type === "long_text") && typeof v === "string") {
    if (q.maxLength != null && v.length > q.maxLength) return "tooLong";
  }
  return null;
}

export function messageForError(err: FieldError, q: FormQuestion, ui: FormUi): string {
  if (err === "min")
    return (ui.selectAtLeast ?? ui.required).replace("{n}", String(q.minSelections ?? 1));
  if (err === "max")
    return (ui.selectAtMost ?? ui.required).replace("{n}", String(q.maxSelections ?? 1));
  return ui.required;
}

export function isComplete(
  content: FormContent,
  answers: Record<string, FormAnswer>,
): boolean {
  return content.questions.every((q) => validateAnswer(q, answers[q.id]) === null);
}

/** array de respostas na ordem do JSON (statement não vira resposta) */
export function buildAnswers(
  content: FormContent,
  answers: Record<string, FormAnswer>,
  extra?: FormAnswer,
): FormAnswer[] {
  const map = extra ? { ...answers, [extra.questionId]: extra } : answers;
  return content.questions
    .filter((q) => q.type !== "statement")
    .map((q) => map[q.id])
    .filter(Boolean) as FormAnswer[];
}

export function buildEnvelope(
  content: FormContent,
  answersArray: FormAnswer[],
  campaign: string | null,
): FormEnvelope {
  return {
    slug: content.meta.slug,
    answers: answersArray,
    campaign,
    completed_at: new Date().toISOString(),
  };
}

// ── Atribuição (?lead= / ?c=) ─────────────────────────────────
// Não confiar em querystring crua — só slug curto [a-z0-9-].
export function readCampaign(param: string): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get(param);
  if (!raw) return null;
  const slug = raw.toLowerCase().slice(0, 40);
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

// ── Visitor id (dedup cross-tool; mesma chave do antigo link survey) ──
const VISITOR_KEY = "psiativa-visitor-id";
export function getOrCreateVisitorId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = localStorage.getItem(VISITOR_KEY);
    if (existing) return existing;
    const id = `anon-${crypto.randomUUID()}`;
    localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return "";
  }
}
