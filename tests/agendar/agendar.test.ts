// /agendar pure logic. Run: node --experimental-strip-types --test tests/agendar/agendar.test.ts
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  WHATSAPP_STATES, dayLabel, fill, hourLabel, normalizePhone, parseToken, refusalKey, slotLabel, validEmail, validName,
} from "../../src/lib/agendar.ts";

const tok = "ab".repeat(32);

test("permit: a private token is read from the fragment; a public visit has none", () => {
  assert.deepEqual(parseToken(`#t=${tok}`), { token: tok, malformed: false });
  assert.deepEqual(parseToken(`#t=${tok.toUpperCase()}`), { token: tok, malformed: false });
  assert.deepEqual(parseToken(""), { token: null, malformed: false });
  assert.deepEqual(parseToken("#topo"), { token: null, malformed: false });
});
test("permit: public form input shapes into what WF-H accepts", () => {
  assert.equal(normalizePhone("(21) 97717-4067"), "5521977174067");
  assert.equal(normalizePhone("+55 11 98581-7989"), "5511985817989");
  assert.equal(normalizePhone("21 3333-4444"), "552133334444");
  assert.ok(validName("Ana"));
  assert.ok(validEmail(""));
  assert.ok(validEmail("ana@clinica.com.br"));
});
test("permit: labels are in Brasília time, both languages", () => {
  const iso = "2026-11-10T14:30:00.000-03:00";
  assert.equal(hourLabel(iso, "pt"), "14h30");
  assert.equal(hourLabel("2026-11-10T10:00:00-03:00", "pt"), "10h");
  assert.equal(hourLabel(iso, "en"), "14:30");
  assert.equal(dayLabel("2026-11-10", "pt"), "terça, 10/11");
  assert.equal(dayLabel("2026-11-10", "en"), "Tue, 11/10");
  assert.equal(slotLabel(iso, "pt"), "terça, 10/11 às 14h30");
  assert.equal(slotLabel("2026-11-10T17:30:00Z", "pt"), "terça, 10/11 às 14h30");
  assert.equal(fill("Pronto: {label}.", { label: "x" }), "Pronto: x.");
});
test("refusal: a malformed token never reaches the network", () => {
  assert.deepEqual(parseToken("#t=123"), { token: null, malformed: true });
  assert.deepEqual(parseToken(`#t=${tok}z`), { token: null, malformed: true });
});
test("refusal: bad input is caught before sending", () => {
  assert.equal(normalizePhone("123"), null);
  assert.equal(normalizePhone("5521077174067"), null);
  assert.ok(!validName(" A "));
  assert.ok(!validEmail("ana@"));
});
test("refusal: every facade reason maps to its own text; unknowns are unavailable", () => {
  for (const r of ["slot_taken", "ja_agendado", "ja_agendado_ip", "whatsapp_invalido", "zapi_indisponivel",
    "limite", "invalido", "link_invalido", "link_vencido", "desligado", "indisponivel"])
    assert.equal(refusalKey({ ok: false, resultado: r }), r);
  assert.equal(refusalKey({ resultado: "ip_ausente" }), "invalido");
  assert.equal(refusalKey({ resultado: "calendar_error" }), "indisponivel");
  assert.equal(refusalKey(null), "indisponivel");
  for (const s of ["desligado", "link_vencido", "vazio"]) assert.ok(WHATSAPP_STATES.has(s));
  assert.ok(!WHATSAPP_STATES.has("slot_taken"));
});
test("every state the page can show has PT and EN text", async () => {
  const { readFileSync } = await import("node:fs");
  const a = JSON.parse(readFileSync(new URL("../../src/data/translations.json", import.meta.url), "utf8")).agendar;
  for (const s of ["carregando", "vazio", "slot_taken", "ja_agendado", "ja_agendado_ip", "whatsapp_invalido",
    "zapi_indisponivel", "limite", "invalido", "link_invalido", "link_vencido", "desligado", "indisponivel"])
    assert.ok(a.st[s]?.pt && a.st[s]?.en, s);
});

test("fix 6.1: phone and e-mail input rules", async () => {
  const { maskPhone, phoneDigits, sanitizeEmail, validEmailStrict, validWhatsapp } = await import("../../src/lib/fields.ts");
  // typing is filtered
  assert.equal(maskPhone("21abc977174067999"), "(21) 97717-4067");
  assert.equal(maskPhone("2133334444"), "(21) 3333-4444");
  assert.equal(maskPhone("219"), "(21) 9");
  assert.equal(phoneDigits("+55 (21) 97717-4067"), "21977174067");
  assert.equal(sanitizeEmail(" ana maria@cli@nica.com.br<>"), "anamaria@clinica.com.br");
  // only real WhatsApp-shaped numbers
  assert.equal(validWhatsapp("(21) 97717-4067"), "5521977174067");
  assert.equal(validWhatsapp("(21) 3333-4444"), "552133334444");
  assert.equal(validWhatsapp("(20) 97717-4067"), null); // DDD 20 does not exist
  assert.equal(validWhatsapp("(21) 87717-4067"), null); // 11 digits must be a 9xxxx mobile
  assert.equal(validWhatsapp("(21) 9771-4067"), null); // 10 digits starting 9: neither shape
  assert.equal(validWhatsapp("(21) 1234-5678"), null);
  // only real-looking addresses
  for (const ok of ["ana@clinica.com.br", "a.b+c@x-y.io"]) assert.ok(validEmailStrict(ok), ok);
  for (const bad of ["ana@clinica", "ana@@x.com", "ana..b@x.com", ".ana@x.com", "ana@-x.com", "ana@x.c", "ana @x.com"])
    assert.ok(!validEmailStrict(bad), bad);
});


test("waHref: each stop state pre-fills its own text; the booked time when known", async () => {
  const { waHref } = await import("../../src/lib/agendar.ts");
  const base = "https://wa.me/5521966442965?text=Ol%C3%A1%21%20Vim%20pelo%20site";
  const text = (k: string, s = "") => new URL(waHref(base, k, s)).searchParams.get("text") || "";
  assert.equal(new URL(waHref(base, "vazio")).pathname, "/5521966442965");
  assert.match(text("ja_agendado", "terça, 10/11 às 14h"), /Já agendei um bate-papo para terça, 10\/11 às 14h/);
  assert.match(text("ja_agendado"), /Já tenho um bate-papo agendado/);
  assert.match(text("ja_agendado_ip", "x"), /Já tenho um bate-papo agendado/);
  assert.match(text("link_vencido"), /venceu/);
  assert.match(text("desligado"), /não consegui/);
  for (const k of ["ja_agendado", "ja_agendado_ip", "vazio", "link_vencido", "link_invalido", "whatsapp_invalido", "limite", "desligado", "indisponivel"]) {
    const t = text(k, k === "ja_agendado" ? "terça às 14h" : "");
    assert.ok(!/[–—]|reuni|Vim pelo site/i.test(t), `${k}: ${t}`);
  }
  assert.equal(waHref("not a url", "vazio"), "not a url");
});
