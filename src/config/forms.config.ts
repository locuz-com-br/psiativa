// ─────────────────────────────────────────────────────────────
// Native Forms — configuração pública (registro + captura)
// ─────────────────────────────────────────────────────────────
// Plano: plans/native-forms/plan.md.

import discoveryData from "../data/forms/discovery.json";
import type { FormContent } from "../lib/forms";

// Webhook COMPARTILHADO (mesmo da calculadora e do quiz). O `source` distingue.
// Lido via import.meta.env na island — ver .env.example.
export const WEBHOOK_ENV_KEY = "PUBLIC_N8N_CAPTURE_WEBHOOK" as const;

// Atribuição da URL: ?lead=<slug> (qual prospecto) ou ?c=<slug> (qual campanha).
export const CAMPAIGN_PARAMS = ["lead", "c"] as const;

export interface FormSource {
  source: string;
  page: string;
}

// Registro de formulários nativos. Adicionar um novo formulário validado =
// 1 entrada aqui + 1 src/data/forms/<slug>.json + 1 src/pages/<slug>.astro
// + 1 branch `source` no webhook n8n. SEM tocar no motor (FormIsland/lib).
export const FORM_SOURCES = {
  discovery: { source: "discovery_survey", page: "diagnostico" },
} as const satisfies Record<string, FormSource>;

// Conteúdo tipado (perguntas/copy editáveis no JSON, sem tocar no componente).
// `_comment` é nota de manutenção: a island é client:only, então os props são
// serializados no HTML. Removemos aqui para não vazar nota interna pro cliente.
const discoveryContent = { ...(discoveryData as Record<string, unknown>) };
delete discoveryContent._comment;
export const DISCOVERY_FORM = discoveryContent as unknown as FormContent;
