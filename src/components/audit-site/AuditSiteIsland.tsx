"use client";

// ─────────────────────────────────────────────────────────────
// Raio-X do Site — island (Sprint 17a, Fase 5.3)
// ─────────────────────────────────────────────────────────────
// DOIS round-trips, não um (contrato §2):
//   1. /scan   → captcha verificado ANTES da chamada cara → score + dor
//   2. /reveal → nome + telefone → grava a lead → devolve o R$
//
// ⛔ A captura é o ÚLTIMO passo. O R$ fica travado até o telefone entrar.
// ⛔ O número NUNCA é calculado aqui: chega pronto em `impacto.frase`.

import { useMemo, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { SITE_CONFIG } from "../../config/site.config";
import {
  CAPTURE,
  DISCLAIMER,
  DOR_LABELS,
  DOR_PERGUNTAS,
  FIELDS,
  PROVA_NOTA,
  SELO_ESTIMATIVA,
  type FieldDef,
} from "../../config/audit-site.config";
import {
  checkInputs,
  checkUrl,
  DEFAULT_INPUTS,
  formatBRL,
  isHandoff,
  type AuditInputs,
  type Impacto,
  type ScanResponse,
} from "../../lib/audit";
import { pick, useSiteLang, type Lang } from "../../lib/useSiteLang";

// Vite substitui estes acessos estáticos em build. Acesso dinâmico não é
// substituído, por isso a chave é referenciada literalmente.
const SCAN_URL = (import.meta.env.PUBLIC_N8N_RAIOX_SCAN_WEBHOOK as string | undefined) || "";
const REVEAL_URL = (import.meta.env.PUBLIC_N8N_RAIOX_REVEAL_WEBHOOK as string | undefined) || "";
const DEV_MOCK = import.meta.env.DEV && import.meta.env.PUBLIC_RAIOX_DEV_MOCK === "true";
// ⛔ Sitekey DEDICADA do Raio-X, não a do quiz/calculadora. O secret que a
// verifica é o mesmo (hCaptcha emite um por CONTA), mas a chave separada é o
// que permite bloquear esta ferramenta sem derrubar as outras duas.
const HCAPTCHA_KEY = SITE_CONFIG.analytics.hcaptchaSiteKeyRaiox || "";

const COPY = {
  pt: {
    urlLabel: "Endereço do seu site",
    urlPlaceholder: "psiativa.com.br",
    urlHelper: "Pode colar sem o https. A leitura olha só o que está público.",
    numerosEyebrow: "Seus números",
    numerosHelper: "Servem pra estimar o que escapa. Ficam com você.",
    scanBtn: "Fazer o raio-x",
    scanning: "Lendo seu site...",
    scanningSub: "Isso leva até um minuto. Pode deixar a aba aberta.",
    errUrlVazia: "Me diz o endereço do seu site.",
    errUrlMalformada: "Esse endereço não parece completo. Confere e tenta de novo.",
    errUrlSemPonto: "Falta o final do domínio, tipo .com.br.",
    errUrlNaoPublica: "Preciso de um site publicado, que eu consiga abrir daqui.",
    errTicket: "Confere o valor da sessão.",
    errSessoes: "Confere as sessões por semana.",
    errCaptcha: "Confirme o desafio de segurança antes de continuar.",
    errGeneric: "Algo não funcionou na leitura. Tenta de novo em instantes.",
    errCaptchaFalhou: "O desafio de segurança não passou. Tenta de novo.",
    handoffTitle: "A fila de hoje encheu.",
    handoffBody:
      "A leitura automática tem um limite por dia, e ele já bateu. Me deixa seu WhatsApp que eu faço o raio-x do seu site na mão e te mando.",
    scoreLabel: "Nota do seu site",
    scoreOf: (s: number) => `${s} de 100`,
    checksEyebrow: "Os 5 pontos que eu olhei",
    passou: "Passou",
    falhou: "Falhou",
    dorEyebrow: "O ponto que mais custa",
    lockedEyebrow: "O que isso custa por mês",
    lockedBody:
      "Com os seus números eu consigo estimar quanto atendimento deixa de acontecer por causa desse ponto. Me deixa seu WhatsApp que eu te mostro aqui e te mando o panorama completo.",
    nameLabel: "Seu nome",
    namePlaceholder: "Como te chamo?",
    phoneLabel: "Seu WhatsApp",
    phonePlaceholder: "(11) 99999-9999",
    errPhone: "Me deixa seu WhatsApp pra eu te enviar.",
    sending: "Enviando...",
    revealBtn: "Ver o que isso custa",
    captureMicro: "Seu contato fica só com a PsiAtiva. Sem disparo em massa.",
    revealEyebrow: "A estimativa",
    aPartirDe: "a partir de",
    porMes: "/mês",
    handoffOnlyStrong: "Pronto.",
    handoffOnlyBody:
      "Sua leitura está comigo. Te mando o panorama completo no seu WhatsApp, com calma, no seu momento.",
    semNumeroStrong: "Seu site passou no ponto que eu olharia primeiro.",
    semNumeroBody:
      "Nesse caso eu não tenho um número honesto pra te dar, e prefiro te dizer isso a inventar um. Te mando a leitura completa no WhatsApp.",
    refazer: "Ler outro site",
    provider: (p: string, m: string) => `Leitura feita por ${p} / ${m}.`,
  },
  en: {
    urlLabel: "Your site address",
    urlPlaceholder: "psiativa.com.br",
    urlHelper: "You can paste it without the https. The read only looks at what is public.",
    numerosEyebrow: "Your numbers",
    numerosHelper: "They are used to estimate what escapes. They stay with you.",
    scanBtn: "Run the X-ray",
    scanning: "Reading your site...",
    scanningSub: "This takes up to a minute. You can leave the tab open.",
    errUrlVazia: "Tell me your site address.",
    errUrlMalformada: "That address does not look complete. Check it and try again.",
    errUrlSemPonto: "The domain ending is missing, like .com.br.",
    errUrlNaoPublica: "I need a published site that I can open from here.",
    errTicket: "Check the session price.",
    errSessoes: "Check the sessions per week.",
    errCaptcha: "Confirm the security challenge before continuing.",
    errGeneric: "Something went wrong with the read. Try again in a moment.",
    errCaptchaFalhou: "The security challenge did not pass. Try again.",
    handoffTitle: "Today's queue is full.",
    handoffBody:
      "The automatic read has a daily limit and it has been reached. Leave me your WhatsApp and I will X-ray your site by hand and send it over.",
    scoreLabel: "Your site's score",
    scoreOf: (s: number) => `${s} of 100`,
    checksEyebrow: "The 5 points I looked at",
    passou: "Passed",
    falhou: "Failed",
    dorEyebrow: "The point that costs the most",
    lockedEyebrow: "What that costs per month",
    lockedBody:
      "With your numbers I can estimate how much care stops happening because of this point. Leave me your WhatsApp and I will show it here and send you the full overview.",
    nameLabel: "Your name",
    namePlaceholder: "What should I call you?",
    phoneLabel: "Your WhatsApp",
    phonePlaceholder: "(11) 99999-9999",
    errPhone: "Leave me your WhatsApp so I can send it to you.",
    sending: "Sending...",
    revealBtn: "See what it costs",
    captureMicro: "Your contact stays only with PsiAtiva. No mass messaging.",
    revealEyebrow: "The estimate",
    aPartirDe: "from",
    porMes: "/mo",
    handoffOnlyStrong: "Done.",
    handoffOnlyBody:
      "I have your read. I will send the full overview to your WhatsApp, calmly, in your own time.",
    semNumeroStrong: "Your site passed the point I would look at first.",
    semNumeroBody:
      "In that case I do not have an honest number to give you, and I would rather say so than invent one. I will send the full read on WhatsApp.",
    refazer: "Read another site",
    provider: (p: string, m: string) => `Read by ${p} / ${m}.`,
  },
};

type Phase = "form" | "scanning" | "scanned" | "sending" | "done" | "handoff";
type ErrKey =
  | null
  | "urlVazia"
  | "urlMalformada"
  | "urlSemPonto"
  | "urlNaoPublica"
  | "ticket"
  | "sessoes"
  | "captcha"
  | "captchaFalhou"
  | "phone"
  | "generic";

export default function AuditSiteIsland() {
  const lang = useSiteLang();
  const c = COPY[lang];

  const [url, setUrl] = useState("");
  const [inputs, setInputs] = useState<AuditInputs>(DEFAULT_INPUTS);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = useRef<HCaptcha>(null);

  const [phase, setPhase] = useState<Phase>("form");
  const [err, setErr] = useState<ErrKey>(null);
  const [scan, setScan] = useState<ScanResponse | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [impacto, setImpacto] = useState<Impacto | null>(null);
  const [semNumero, setSemNumero] = useState(false);

  const errMsg = useMemo(() => {
    switch (err) {
      case "urlVazia": return c.errUrlVazia;
      case "urlMalformada": return c.errUrlMalformada;
      case "urlSemPonto": return c.errUrlSemPonto;
      case "urlNaoPublica": return c.errUrlNaoPublica;
      case "ticket": return c.errTicket;
      case "sessoes": return c.errSessoes;
      case "captcha": return c.errCaptcha;
      case "captchaFalhou": return c.errCaptchaFalhou;
      case "phone": return c.errPhone;
      case "generic": return c.errGeneric;
      default: return null;
    }
  }, [err, c]);

  function setField(key: keyof AuditInputs, raw: string) {
    const v = Number(raw);
    setInputs((prev) => ({ ...prev, [key]: Number.isFinite(v) ? v : prev[key] }));
  }

  // ── Passo 3: /scan ──────────────────────────────────────────
  async function handleScan(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    // Validar ANTES do POST: cada domínio novo custa 1 Browser Rendering
    // + 1 chamada LLM. Barrar lixo aqui é a alavanca de custo mais barata.
    const u = checkUrl(url);
    if (!u.ok) {
      setErr(
        u.erro === "vazia" ? "urlVazia"
          : u.erro === "sem_ponto" ? "urlSemPonto"
          : u.erro === "nao_publica" ? "urlNaoPublica"
          : "urlMalformada",
      );
      return;
    }
    const bad = checkInputs(inputs);
    if (bad.length) {
      setErr(bad[0] === "ticket" ? "ticket" : "sessoes");
      return;
    }
    if (HCAPTCHA_KEY && !captchaToken) {
      setErr("captcha");
      return;
    }

    setPhase("scanning");

    if (DEV_MOCK) {
      setScan(devMockScan(u.url!));
      setPhase("scanned");
      return;
    }
    if (!SCAN_URL) {
      console.warn("[raio-x] PUBLIC_N8N_RAIOX_SCAN_WEBHOOK não configurado.");
      setErr("generic");
      setPhase("form");
      return;
    }

    try {
      const res = await fetch(SCAN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          source: CAPTURE.source,
          page: CAPTURE.page,
          url: u.url,
          captcha: captchaToken,
          inputs,
          submittedAt: new Date().toISOString(),
        }),
      });
      const data = await res.json().catch(() => null);

      // O token do hCaptcha é de uso único: gastou, reseta, dê outro.
      captchaRef.current?.resetCaptcha();
      setCaptchaToken(null);

      // 503 = teto diário OU kill switch. O status sozinho não distingue os
      // dois; quem separa é o `motivo`. Pra visitante os dois são a mesma
      // coisa: a leitura automática não vai sair agora.
      if (isHandoff(data)) {
        setPhase("handoff");
        return;
      }
      if (res.status === 403) {
        setErr("captchaFalhou");
        setPhase("form");
        return;
      }
      if (!res.ok || !data || data.ok !== true) {
        setErr("generic");
        setPhase("form");
        return;
      }
      setScan(data as ScanResponse);
      setPhase("scanned");
    } catch (e2) {
      console.error("[raio-x] erro no scan:", e2);
      setErr("generic");
      setPhase("form");
    }
  }

  // ── Passo 5: /reveal ────────────────────────────────────────
  async function handleReveal(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!phone) {
      setErr("phone");
      return;
    }
    if (!scan) return;

    setPhase("sending");

    if (DEV_MOCK) {
      setImpacto(devMockImpacto(scan, inputs));
      setPhase("done");
      return;
    }
    if (!REVEAL_URL) {
      console.warn("[raio-x] PUBLIC_N8N_RAIOX_REVEAL_WEBHOOK não configurado.");
      setErr("generic");
      setPhase("scanned");
      return;
    }

    try {
      const res = await fetch(REVEAL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ scanToken: scan.scanToken, name: name.trim(), phone }),
      });
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.ok === true) {
        // ⛔ `impacto: null` é resultado VÁLIDO, não erro: a dor dominante
        // passou, ou a perda ficou abaixo do piso. Cai no handoff sem número.
        if (data.impacto) setImpacto(data.impacto as Impacto);
        else setSemNumero(true);
        setPhase("done");
        return;
      }
      // 410 (reserva vencida) e 502 (motor fora) respondem com a lead JÁ
      // gravada. Do lado da visitante isso é um handoff, não um erro.
      if (res.ok) {
        setSemNumero(true);
        setPhase("done");
        return;
      }
      setErr("generic");
      setPhase("scanned");
    } catch (e2) {
      console.error("[raio-x] erro no reveal:", e2);
      setErr("generic");
      setPhase("scanned");
    }
  }

  function reset() {
    setUrl("");
    setScan(null);
    setImpacto(null);
    setSemNumero(false);
    setName("");
    setPhone("");
    setErr(null);
    setPhase("form");
  }

  const dor = scan?.dorDominante;

  return (
    <div className="rx">
      <style>{CSS}</style>

      {/* ── Entrada ─────────────────────────────────────────── */}
      {phase === "form" && (
        <form className="rx-card" onSubmit={handleScan} noValidate>
          <label className="rx-label" htmlFor="rx-url">{c.urlLabel}</label>
          <input
            id="rx-url"
            type="text"
            inputMode="url"
            autoComplete="url"
            className="rx-url"
            value={url}
            onChange={(ev) => setUrl(ev.target.value)}
            placeholder={c.urlPlaceholder}
          />
          <p className="rx-helper">{c.urlHelper}</p>

          <span className="rx-eyebrow">{c.numerosEyebrow}</span>
          <div className="rx-grid">
            {FIELDS.map((f) => (
              <Field
                key={f.key}
                def={f}
                value={inputs[f.key]}
                onChange={(v) => setField(f.key, v)}
                lang={lang}
              />
            ))}
          </div>
          <p className="rx-helper">{c.numerosHelper}</p>

          {HCAPTCHA_KEY && (
            <div className="rx-captcha">
              <HCaptcha
                ref={captchaRef}
                sitekey={HCAPTCHA_KEY}
                onVerify={(t) => setCaptchaToken(t)}
                onExpire={() => setCaptchaToken(null)}
              />
            </div>
          )}

          {errMsg && <p className="rx-err">{errMsg}</p>}
          <button type="submit" className="rx-btn">{c.scanBtn}</button>
          <p className="rx-seal">{pick(DISCLAIMER, lang)}</p>
        </form>
      )}

      {/* ── Progresso ───────────────────────────────────────── */}
      {phase === "scanning" && (
        <div className="rx-card rx-center">
          <div className="rx-spinner" aria-hidden="true" />
          <p className="rx-scanning">{c.scanning}</p>
          <p className="rx-helper">{c.scanningSub}</p>
        </div>
      )}

      {/* ── Teto batido / kill switch ───────────────────────── */}
      {phase === "handoff" && (
        <div className="rx-card">
          <p className="rx-strong">{c.handoffTitle}</p>
          <p className="rx-body">{c.handoffBody}</p>
        </div>
      )}

      {/* ── Resultado + captura ─────────────────────────────── */}
      {(phase === "scanned" || phase === "sending" || phase === "done") && scan && (
        <>
          <div className="rx-card">
            <span className="rx-eyebrow">{c.scoreLabel}</span>
            <p className="rx-score">{c.scoreOf(scan.score)}</p>
            <p className="rx-class">{scan.classificacao}</p>
          </div>

          <div className="rx-card">
            <span className="rx-eyebrow">{c.checksEyebrow}</span>
            <ul className="rx-checks">
              {scan.checks.map((ck) => (
                <li key={ck.key} className={ck.passou ? "rx-ok" : "rx-no"}>
                  <span className="rx-check-head">
                    <strong>{pick(DOR_LABELS[ck.key], lang)}</strong>
                    <em>{ck.passou ? c.passou : c.falhou}</em>
                  </span>
                  <span className="rx-check-q">{pick(DOR_PERGUNTAS[ck.key], lang)}</span>
                  {ck.evidencia && <span className="rx-check-ev">{ck.evidencia}</span>}
                </li>
              ))}
            </ul>
            <p className="rx-seal">{pick(PROVA_NOTA, lang)}</p>
          </div>

          {dor && (
            <div className="rx-card rx-dor">
              <span className="rx-eyebrow">{c.dorEyebrow}</span>
              <p className="rx-strong">{pick(DOR_LABELS[dor], lang)}</p>
              <p className="rx-body">{scan.dorDominanteJustificativa}</p>
            </div>
          )}

          {/* R$ TRAVADO até o telefone entrar */}
          {phase !== "done" && (
            <form className="rx-card rx-locked" onSubmit={handleReveal} noValidate>
              <span className="rx-eyebrow">{c.lockedEyebrow}</span>
              <p className="rx-body">{c.lockedBody}</p>

              <label className="rx-label" htmlFor="rx-name">{c.nameLabel}</label>
              <input
                id="rx-name"
                type="text"
                className="rx-input"
                value={name}
                onChange={(ev) => setName(ev.target.value)}
                placeholder={c.namePlaceholder}
                autoComplete="given-name"
              />

              <label className="rx-label" htmlFor="rx-phone">{c.phoneLabel}</label>
              <PhoneInput
                id="rx-phone"
                defaultCountry="BR"
                international
                value={phone}
                onChange={setPhone}
                placeholder={c.phonePlaceholder}
                className="rx-phone"
              />

              {errMsg && <p className="rx-err">{errMsg}</p>}
              <button type="submit" className="rx-btn" disabled={phase === "sending"}>
                {phase === "sending" ? c.sending : c.revealBtn}
              </button>
              <p className="rx-micro">{c.captureMicro}</p>
            </form>
          )}

          {/* Revelação */}
          {phase === "done" && impacto && (
            <div className="rx-card rx-reveal">
              <span className="rx-eyebrow">{c.revealEyebrow}</span>
              <p className="rx-money">
                <span className="rx-money-pre">{c.aPartirDe}</span>
                {" "}
                {formatBRL(impacto.perdaMes)}
                <span className="rx-money-suf">{c.porMes}</span>
              </p>
              {/* Frase montada no SERVIDOR. A island renderiza, não reescreve. */}
              <p className="rx-body">{impacto.frase}</p>
              <p className="rx-seal">{pick(SELO_ESTIMATIVA, lang)}</p>
            </div>
          )}

          {phase === "done" && !impacto && (
            <div className="rx-card rx-reveal">
              <p className="rx-strong">
                {semNumero && scan.falhas === 0 ? c.semNumeroStrong : c.handoffOnlyStrong}
              </p>
              <p className="rx-body">
                {semNumero && scan.falhas === 0 ? c.semNumeroBody : c.handoffOnlyBody}
              </p>
            </div>
          )}

          {phase === "done" && (
            <div className="rx-foot">
              <button type="button" className="rx-link" onClick={reset}>{c.refazer}</button>
              <span className="rx-prov">{c.provider(scan.provider, scan.model)}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────
function Field({
  def,
  value,
  onChange,
  lang,
}: {
  def: FieldDef;
  value: number;
  onChange: (v: string) => void;
  lang: Lang;
}) {
  return (
    <div className="rx-field">
      <label className="rx-label" htmlFor={`rx-${def.key}`}>{pick(def.label, lang)}</label>
      <div className="rx-inputwrap">
        {def.prefix && <span className="rx-prefix">{def.prefix}</span>}
        <input
          id={`rx-${def.key}`}
          type="number"
          inputMode="numeric"
          className="rx-input"
          value={value}
          min={def.min}
          max={def.max}
          step={def.step}
          onChange={(e) => onChange(e.target.value)}
        />
        {def.suffix && <span className="rx-suffix">{pick(def.suffix, lang)}</span>}
      </div>
      {def.helper && <p className="rx-helper">{pick(def.helper, lang)}</p>}
    </div>
  );
}

// ── DEV mock — eliminado do build de produção ─────────────────
function devMockScan(u: string): ScanResponse {
  return {
    ok: true,
    scanToken: "mock-token",
    score: 40,
    falhas: 3,
    classificacao: "alvo prioritário",
    dorDominante: "contato",
    dorDominanteLabel: "Contato",
    dorDominanteJustificativa:
      "Não existe link direto de WhatsApp. O telefone aparece só como texto no rodapé.",
    checks: [
      { key: "clareza", passou: true, evidencia: "Título diz a especialidade." },
      { key: "contato", passou: false, evidencia: "Telefone só como texto." },
      { key: "percepcao", passou: true, evidencia: "Site responsivo e atual." },
      { key: "prova", passou: false, evidencia: "CRP não aparece." },
      { key: "direcao_comercial", passou: false, evidencia: "Nenhuma chamada pra ação." },
    ],
    provider: "zen",
    model: "glm-5.2",
  };
}

function devMockImpacto(scan: ScanResponse, inputs: AuditInputs): Impacto {
  const faturamentoMes = inputs.ticket * inputs.sessoesSemana * 4;
  return {
    perdaMes: Math.floor((faturamentoMes * 0.15) / 50) * 50,
    base: "dor_dominante",
    dorDominante: scan.dorDominante,
    taxaEscape: 0.15,
    faturamentoMesBase: faturamentoMes,
    sessoesMesEquivalentes: (faturamentoMes * 0.15) / inputs.ticket,
    frase: "Mock local. O número real é montado no servidor.",
  };
}

const CSS = `
.rx { display: flex; flex-direction: column; gap: 1rem; }
.rx-card { background: var(--background, #FAFFFF); border: 1px solid var(--color-border); border-radius: 14px; padding: 1.25rem; }
.rx-center { text-align: center; }
.rx-eyebrow { display: block; font-size: 0.8rem; letter-spacing: 0.04em; text-transform: uppercase; color: var(--text-muted, #6b7280); margin-bottom: 0.5rem; }
.rx-label { display: block; font-size: 0.95rem; font-weight: 600; color: var(--text-heading); margin: 0.75rem 0 0.35rem; }
.rx-url, .rx-input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.rx-url:focus, .rx-input:focus { border-color: var(--primary); }
.rx-inputwrap { display: flex; align-items: center; gap: 0.5rem; }
.rx-prefix, .rx-suffix { font-size: 0.9rem; color: var(--text-muted, #6b7280); white-space: nowrap; }
.rx-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 0.9rem; }
.rx-helper { font-size: 0.85rem; line-height: 1.45; color: var(--text-muted, #6b7280); margin: 0.35rem 0 0; }
.rx-seal { font-size: 0.8rem; line-height: 1.5; color: var(--text-muted, #6b7280); margin: 0.85rem 0 0; }
.rx-micro { font-size: 0.8rem; color: var(--text-muted, #6b7280); margin: 0.6rem 0 0; }
.rx-btn { width: 100%; margin-top: 1rem; padding: 0.85rem 1rem; border: 0; border-radius: 10px; background: var(--primary); color: #fff; font-family: var(--font-ui); font-size: 1rem; font-weight: 600; cursor: pointer; }
.rx-btn:disabled { opacity: 0.6; cursor: default; }
.rx-err { margin: 0.75rem 0 0; font-size: 0.9rem; color: #b42318; }
.rx-captcha { margin-top: 1rem; }
.rx-spinner { width: 28px; height: 28px; margin: 0.5rem auto; border: 3px solid var(--color-border); border-top-color: var(--primary); border-radius: 50%; animation: rx-spin 0.9s linear infinite; }
@keyframes rx-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { .rx-spinner { animation-duration: 3s; } }
.rx-scanning { font-size: 1.05rem; font-weight: 600; color: var(--text-heading); margin: 0.5rem 0 0; }
.rx-score { font-size: 2.4rem; font-weight: 700; color: var(--text-heading); margin: 0; line-height: 1.1; }
.rx-class { font-size: 0.95rem; color: var(--text-muted, #6b7280); margin: 0.25rem 0 0; }
.rx-checks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.85rem; }
.rx-checks li { display: flex; flex-direction: column; gap: 0.2rem; padding-left: 0.85rem; border-left: 3px solid var(--color-border); }
.rx-checks li.rx-no { border-left-color: #d97706; }
.rx-checks li.rx-ok { border-left-color: #059669; }
.rx-check-head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.75rem; }
.rx-check-head em { font-style: normal; font-size: 0.8rem; color: var(--text-muted, #6b7280); }
.rx-check-q { font-size: 0.9rem; color: var(--text-primary); }
.rx-check-ev { font-size: 0.85rem; color: var(--text-muted, #6b7280); }
.rx-dor { border-color: var(--primary); }
.rx-strong { font-size: 1.15rem; font-weight: 700; color: var(--text-heading); margin: 0; }
.rx-body { font-size: 1rem; line-height: 1.55; color: var(--text-primary); margin: 0.4rem 0 0; }
.rx-money { font-size: 2.2rem; font-weight: 700; color: var(--text-heading); margin: 0.25rem 0 0; line-height: 1.15; }
.rx-money-pre { font-size: 1rem; font-weight: 500; color: var(--text-muted, #6b7280); }
.rx-money-suf { font-size: 1.1rem; font-weight: 500; color: var(--text-muted, #6b7280); }
.rx-phone { display: flex; align-items: center; }
.rx-phone .PhoneInputCountry { display: none; }
.rx-phone input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.rx-phone input:focus { border-color: var(--primary); }
.rx-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; }
.rx-link { background: none; border: 0; padding: 0; font-family: var(--font-ui); font-size: 0.9rem; color: var(--primary); text-decoration: underline; cursor: pointer; }
.rx-prov { font-size: 0.78rem; color: var(--text-muted, #6b7280); }
`;
