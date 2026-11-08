// Fix 6.1 (Juan, /agendar review): shared input rules for the site's forms. What the user can type is
// filtered as they type (sanitize*), and what can be sent is checked before submit (valid*).

/** Brazilian area codes (DDD) in use. Anything else is not a real number. */
const DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43, 44, 45, 46,
  47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77, 79, 81, 82, 83, 84, 85,
  86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

/** Local digits only (DDD + number, max 11); a pasted +55 / 55 prefix or leading 0 is dropped. */
export function phoneDigits(raw: string): string {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  return d.slice(0, 11);
}

/** As-you-type mask: "(21) 97717-4067" (mobile) or "(21) 3456-7890" (landline). */
export function maskPhone(raw: string): string {
  const d = phoneDigits(raw);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  const cut = d.length === 11 ? 5 : 4;
  return rest.length <= cut ? `(${ddd}) ${rest}` : `(${ddd}) ${rest.slice(0, cut)}-${rest.slice(cut)}`;
}

/**
 * A number WhatsApp can have: a real DDD, then a mobile (9 + 8 digits) or a landline (8 digits starting 2–5,
 * WhatsApp Business). Returns E.164 digits "55…" or null. Whether the number really has WhatsApp is checked
 * server-side (Z-API) after submit.
 */
export function validWhatsapp(raw: string): string | null {
  const d = phoneDigits(raw);
  if (!DDD.has(Number(d.slice(0, 2)))) return null;
  const n = d.slice(2);
  if (/^9[0-9]{8}$/.test(n) || /^[2-5][0-9]{7}$/.test(n)) return "55" + d;
  return null;
}

/** E-mail as typed: no spaces, only characters an address can hold, one "@", max 160. */
export function sanitizeEmail(raw: string): string {
  const clean = String(raw || "").replace(/[^A-Za-z0-9._%+\-@]/g, "");
  const at = clean.indexOf("@");
  const one = at < 0 ? clean : clean.slice(0, at + 1) + clean.slice(at + 1).replace(/@/g, "");
  return one.slice(0, 160);
}

/** A deliverable-looking address: local@domain.tld, no leading/trailing/double dots, tld of 2+ letters. */
export function validEmailStrict(raw: string): boolean {
  const v = String(raw || "").trim();
  if (v.length > 160 || /\.\./.test(v)) return false;
  return /^[A-Za-z0-9_%+\-]+(\.[A-Za-z0-9_%+\-]+)*@[A-Za-z0-9]([A-Za-z0-9\-]*[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9\-]*[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/.test(v);
}

/**
 * Run `show` once any press in progress is released. A blur fires on pointerdown; an error tooltip that
 * appears right then shifts the layout before pointerup, so the click the user aimed lands on nothing.
 */
let pressed = false;
if (typeof document !== "undefined") {
  document.addEventListener("pointerdown", () => (pressed = true), true);
  document.addEventListener("pointerup", () => setTimeout(() => (pressed = false)), true);
  document.addEventListener("pointercancel", () => (pressed = false), true);
}
export function afterPress(show: () => void): void {
  if (!pressed) return show();
  const run = () => setTimeout(show);
  document.addEventListener("pointerup", run, { once: true, capture: true });
}
