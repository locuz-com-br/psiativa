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
