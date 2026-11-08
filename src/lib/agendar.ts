import { validEmailStrict, validWhatsapp } from "./fields.ts";
// /agendar (Sprint 11 F5) — pure logic, no DOM. Tested by tests/agendar/agendar.test.ts.
// The WF-H facade owns every rule; this only shapes input and maps its answers to copy keys.

export type Lang = "pt" | "en";

/** The private token rides in the URL fragment (`#t=<64 hex>`), never in the path or query. */
export function parseToken(hash: string): { token: string | null; malformed: boolean } {
  const match = /(?:^#|&)t=([^&]*)/.exec(hash || "");
  if (!match) return { token: null, malformed: false };
  const token = match[1].toLowerCase();
  return /^[0-9a-f]{64}$/.test(token) ? { token, malformed: false } : { token: null, malformed: true };
}

/** Brazilian mobile/landline with DDD → `55` + digits, or null. WF-H re-checks it with Z-API. */
export function normalizePhone(raw: string): string | null {
  return validWhatsapp(raw);
}

export const validName = (raw: string) => String(raw || "").trim().length >= 2;
/** Optional on /agendar: empty is fine, anything typed must be a real address. */
export const validEmail = (raw: string) => !raw.trim() || validEmailStrict(raw);

/** Every refusal WF-H can send (`Fechar recusa`), each with its own text in `agendar.st.*`. */
const REFUSALS = new Set([
  "slot_taken", "ja_agendado", "ja_agendado_ip", "whatsapp_invalido", "zapi_indisponivel",
  "limite", "invalido", "link_invalido", "link_vencido", "desligado", "indisponivel",
]);
/** States that end the flow with WhatsApp as their one action (the button is the only way forward). */
export const WHATSAPP_STATES = new Set([
  "vazio", "indisponivel", "ja_agendado", "ja_agendado_ip", "limite", "link_invalido", "link_vencido", "desligado",
  "whatsapp_invalido",
]);

/** Map a facade answer to the `agendar.st.*` key. `ip_ausente` is shown as `invalido`. */
export function refusalKey(answer: { resultado?: unknown; reason?: unknown } | null | undefined): string {
  const raw = String(answer?.resultado ?? answer?.reason ?? "");
  if (raw === "ip_ausente") return "invalido";
  return REFUSALS.has(raw) ? raw : "indisponivel";
}

const ZONE = "America/Sao_Paulo";
const PT_DAYS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

function parts(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const get = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { timeZone: ZONE, ...options }).format(date);
  const hour = Number(get({ hour: "numeric", hourCycle: "h23" }));
  const minute = Number(get({ minute: "numeric" }));
  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get({ weekday: "short" }));
  return { hour, minute, weekday, day: get({ day: "2-digit" }), month: get({ month: "2-digit" }), date };
}

/** "10h" / "10h30" (PT) or "10:00" / "10:30" (EN), in Brasília time. */
export function hourLabel(iso: string, lang: Lang): string {
  const p = parts(iso);
  if (!p) return "";
  const mm = String(p.minute).padStart(2, "0");
  return lang === "pt" ? `${p.hour}h${p.minute ? mm : ""}` : `${p.hour}:${mm}`;
}

/** Day button: "terça, 10/11" (PT) or "Tue, 11/10" (EN). `dia` is the grid's YYYY-MM-DD. */
export function dayLabel(dia: string, lang: Lang): string {
  const p = parts(`${dia}T12:00:00-03:00`);
  if (!p) return dia;
  if (lang === "pt") return `${PT_DAYS[p.weekday]}, ${p.day}/${p.month}`;
  return `${new Intl.DateTimeFormat("en-US", { timeZone: ZONE, weekday: "short" }).format(p.date)}, ${p.month}/${p.day}`;
}

/** Calendar header: "novembro 2026" / "November 2026". `mes` is YYYY-MM. */
export function monthLabel(mes: string, lang: Lang): string {
  const [y, m] = mes.split("-").map(Number);
  if (!y || !m) return mes;
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", { month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(Date.UTC(y, m - 1, 15)))
    .replace(" de ", " ");
}

/** Calendar column heads, Sunday first. */
export function weekdayInitials(lang: Lang): string[] {
  return lang === "pt" ? ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
}

/** Full slot label for summaries and results: "terça, 10/11 às 10h" / "Tue, 11/10 at 10:00". */
export function slotLabel(iso: string, lang: Lang): string {
  const p = parts(iso);
  if (!p) return "";
  const dia = `${p.date.toLocaleDateString("en-CA", { timeZone: ZONE })}`;
  return `${dayLabel(dia, lang)} ${lang === "pt" ? "às" : "at"} ${hourLabel(iso, lang)}`;
}

/** `{nome}`-style placeholders. Values are plain text; the caller sets textContent, never innerHTML. */
export function fill(template: string, vars: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? "");
}

/** The text each stop state pre-fills in the WhatsApp button, so the team reads the context first.
 *  PT always: it is what the team receives (Renata answers it), not page copy. No dashes, never "reunião". */
const WA_TEXT: Record<string, string> = {
  ja_agendado: "Olá! Já tenho um bate-papo agendado pelo site e queria falar sobre ele.",
  ja_agendado_ip: "Olá! Já tenho um bate-papo agendado pelo site e queria falar sobre ele.",
  vazio: "Olá! Quis agendar um bate-papo pelo site, mas não achei horário livre. Podemos combinar por aqui?",
  link_vencido: "Olá! Recebi um link de agendamento, mas ele venceu. Pode me mandar um novo?",
  link_invalido: "Olá! Recebi um link de agendamento, mas ele não abriu. Pode me mandar um novo?",
  whatsapp_invalido: "Olá! Tentei agendar um bate-papo pelo site, mas meu número não foi aceito. Podemos combinar por aqui?",
};
const WA_FALLBACK = "Olá! Tentei agendar um bate-papo pelo site e não consegui. Podemos combinar por aqui?";

/** `base` is the site's wa.me link; only its `text` changes. `slotPt` (a PT slot label) names the booked time. */
export function waHref(base: string, key: string, slotPt = ""): string {
  let url: URL;
  try { url = new URL(base); } catch { return base; }
  const text = key === "ja_agendado" && slotPt
    ? `Olá! Já agendei um bate-papo para ${slotPt} pelo site e queria falar sobre esse horário.`
    : WA_TEXT[key] || WA_FALLBACK;
  url.searchParams.set("text", text);
  return url.toString();
}
