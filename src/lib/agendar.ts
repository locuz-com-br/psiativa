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
  let digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) digits = "55" + digits;
  return /^55[1-9][0-9]9?[0-9]{8}$/.test(digits) ? digits : null;
}

export const validName = (raw: string) => String(raw || "").trim().length >= 2;
export const validEmail = (raw: string) => !raw.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());

/** Every refusal WF-H can send (`Fechar recusa`), each with its own text in `agendar.st.*`. */
const REFUSALS = new Set([
  "slot_taken", "ja_agendado", "ja_agendado_ip", "whatsapp_invalido", "zapi_indisponivel",
  "limite", "invalido", "link_invalido", "link_vencido", "desligado", "indisponivel",
]);
/** States that end the flow and offer WhatsApp instead of a retry. */
export const WHATSAPP_STATES = new Set([
  "vazio", "indisponivel", "ja_agendado_ip", "limite", "link_invalido", "link_vencido", "desligado",
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
