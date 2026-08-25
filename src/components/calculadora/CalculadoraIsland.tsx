"use client";

import { useMemo, useRef, useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { SITE_CONFIG } from "../../config/site.config";
import {
  CAPTURE,
  DEFAULT_INPUTS,
  DISCLAIMER,
  FIELDS,
  PERFIL_OPTIONS,
  POV,
  PRODUTO_OPTIONS,
  SELO_PROJECAO,
  type FieldDef,
} from "../../config/calculadora.config";
import {
  computeProjection,
  computeReveal,
  formatBRL,
  type CalcInputs,
  type Perfil,
  type Produto,
  type RevealPayload,
} from "../../lib/calculadora";
import Chart from "./Chart";
import { pick, useSiteLang, type Lang } from "../../lib/useSiteLang";

// Vite substitui estes acessos estáticos em build. Acesso dinâmico não
// é substituído — por isso referenciamos a chave literalmente.
const WEBHOOK_URL = (import.meta.env.PUBLIC_N8N_CAPTURE_WEBHOOK as string | undefined) || "";
const DEV_MOCK = import.meta.env.DEV && import.meta.env.PUBLIC_CALC_DEV_MOCK === "true";
const HCAPTCHA_KEY = SITE_CONFIG.analytics.hcaptchaSiteKey || "";

// ── Copy bilíngue da island (resolvida por useSiteLang) ─────────
// A engine DOM-swap (src/scripts/i18n.ts) não alcança a island; aqui a copy
// é { pt, en } escolhida por `lang`. Rótulos de config (FIELDS/options) e
// SELO_PROJECAO/DISCLAIMER/POV vêm de calculadora.config.ts via pick().
const COPY = {
  pt: {
    eyebrowPerfil: "Como você atende hoje?",
    eyebrowProduto: "Que estrutura você consideraria?",
    eyebrowNumeros: "Seus números",
    statSem: (m: number) => `Sem um processo, no ritmo de hoje (${m} meses)`,
    statCom: (m: number) => `Com um processo de captação, cenário (${m} meses)`,
    labelSem: "Sem método",
    labelCom: "Com método",
    autoqualStrong: "No seu cenário, a conta já fecha bem.",
    autoqualBody:
      "Pelos seus próprios números, você talvez não precise de um processo de captação agora, e a gente prefere te dizer isso com clareza. ",
    gapLabel: (m: number) => `A diferença no ciclo de ${m} meses`,
    gapSub: "é o que fica na mesa: faturamento que entraria com constância e hoje depende de quando alguém indica.",
    band: (piso: string, teto: string) =>
      `Dependendo da retenção, sua projeção com método fica entre ${piso} e ${teto} no ciclo.`,
    ctaCopyAuto: "Quer conversar mesmo assim? Posso te mostrar a leitura completa.",
    ctaCopyGap: "Quer ver quanto custaria capturar essa diferença?",
    ctaBtn: "Ver a conta completa",
    ctaMicro: "Sem preço de tabela aqui. O panorama vai pro seu WhatsApp.",
    captureTitle: "Vou te mostrar a leitura e te mando o panorama no WhatsApp.",
    nameLabel: "Seu nome",
    namePlaceholder: "Como te chamo?",
    phoneLabel: "Seu WhatsApp",
    phonePlaceholder: "(11) 99999-9999",
    errPhone: "Me deixa seu WhatsApp pra eu te enviar.",
    errCaptcha: "Confirme o desafio de segurança antes de enviar.",
    errGeneric: "Algo não funcionou no envio. Tenta de novo em instantes.",
    sending: "Enviando...",
    submitBtn: "Ver minha leitura",
    captureMicro: "Seu contato fica só com a PsiAtiva. Sem disparo em massa.",
    revealEyebrow: "A conta de capturar esse faturamento",
    revealInvest: "Investimento PsiAtiva",
    aPartirDe: (v: string) => `a partir de ${v}`,
    revealRoi: "Retorno sobre o investimento",
    revealPayback: "Tempo de retorno",
    paybackMonths: (m: number) => `~${m} meses`,
    paybackOver: (m: number) => `acima de ${m} meses`,
    midiaLabel: "Verba de mídia (vai pro Google/Meta, não pra PsiAtiva, não reembolsável):",
    midiaValue: (mes: string, ciclo: number, total: string) => `${mes}/mês × ${ciclo} = ${total}`,
    desembolsoLabel: "Desembolso transparente no ciclo (investimento + mídia):",
    garantiaLabel: "Sua segurança:",
    revealFoot:
      "O valor exato e as formas de pagamento a gente vê numa conversa, no seu momento. O retorno aqui é sobre o investimento PsiAtiva. A mídia aparece à parte pra você ver o caixa completo.",
    handoffStrong: "Pronto.",
    handoffBody: "Seus números estão comigo. Te mando o panorama completo no seu WhatsApp, com calma, no seu momento.",
    decrease: "Diminuir",
    increase: "Aumentar",
    roi: (v: number) => `${v.toFixed(1).replace(".", ",")}×`,
  },
  en: {
    eyebrowPerfil: "How do you practice today?",
    eyebrowProduto: "What structure would you consider?",
    eyebrowNumeros: "Your numbers",
    statSem: (m: number) => `Without a process, at today's pace (${m} months)`,
    statCom: (m: number) => `With an acquisition process, scenario (${m} months)`,
    labelSem: "Without a method",
    labelCom: "With a method",
    autoqualStrong: "In your scenario, the math already works well.",
    autoqualBody:
      "By your own numbers, you may not need an acquisition process right now, and we'd rather tell you that clearly. ",
    gapLabel: (m: number) => `The difference over the ${m}-month cycle`,
    gapSub: "is what gets left on the table: revenue that would come in steadily and today depends on when someone refers you.",
    band: (piso: string, teto: string) =>
      `Depending on retention, your projection with a method lands between ${piso} and ${teto} over the cycle.`,
    ctaCopyAuto: "Want to talk anyway? I can show you the full read.",
    ctaCopyGap: "Want to see what it would cost to capture that difference?",
    ctaBtn: "See the full math",
    ctaMicro: "No list price here. The overview goes to your WhatsApp.",
    captureTitle: "I'll show you the read and send the overview to your WhatsApp.",
    nameLabel: "Your name",
    namePlaceholder: "What should I call you?",
    phoneLabel: "Your WhatsApp",
    phonePlaceholder: "(11) 99999-9999",
    errPhone: "Leave me your WhatsApp so I can send it to you.",
    errCaptcha: "Confirm the security challenge before sending.",
    errGeneric: "Something went wrong sending. Try again in a moment.",
    sending: "Sending...",
    submitBtn: "See my read",
    captureMicro: "Your contact stays only with PsiAtiva. No mass messaging.",
    revealEyebrow: "The math of capturing that revenue",
    revealInvest: "PsiAtiva investment",
    aPartirDe: (v: string) => `from ${v}`,
    revealRoi: "Return on investment",
    revealPayback: "Payback time",
    paybackMonths: (m: number) => `~${m} months`,
    paybackOver: (m: number) => `over ${m} months`,
    midiaLabel: "Media budget (goes to Google/Meta, not to PsiAtiva, non-refundable):",
    midiaValue: (mes: string, ciclo: number, total: string) => `${mes}/mo × ${ciclo} = ${total}`,
    desembolsoLabel: "Transparent outlay over the cycle (investment + media):",
    garantiaLabel: "Your safety net:",
    revealFoot:
      "The exact figure and payment terms we go over in a conversation, in your own time. The return here is on the PsiAtiva investment. Media is shown separately so you see the full cash picture.",
    handoffStrong: "Done.",
    handoffBody: "I've got your numbers. I'll send the full overview to your WhatsApp, calmly, in your own time.",
    decrease: "Decrease",
    increase: "Increase",
    roi: (v: number) => `${v.toFixed(1)}×`,
  },
};

type Status = "idle" | "sending" | "sent" | "error" | "captcha_required" | "phone_required";

export default function CalculadoraIsland() {
  const lang = useSiteLang();
  const c = COPY[lang];
  // Opções de config resolvidas pro idioma (Segmented recebe strings puras).
  const perfilOptions = PERFIL_OPTIONS.map((o) => ({
    value: o.value,
    label: pick(o.label, lang),
    helper: o.helper ? pick(o.helper, lang) : undefined,
  }));
  const produtoOptions = PRODUTO_OPTIONS.map((o) => ({
    value: o.value,
    label: pick(o.label, lang),
    helper: o.helper ? pick(o.helper, lang) : undefined,
  }));

  const [perfil, setPerfil] = useState<Perfil>("autonomo");
  const [produto, setProduto] = useState<Produto>("p7k");
  const [inputs, setInputs] = useState<CalcInputs>({ ...DEFAULT_INPUTS });

  const [showCapture, setShowCapture] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [reveal, setReveal] = useState<RevealPayload | null>(null);
  const [handoffOnly, setHandoffOnly] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  const proj = useMemo(() => computeProjection(inputs), [inputs]);
  const ciclo = inputs.horizonteMeses;

  function setField(key: keyof CalcInputs, value: number, clampMin = false) {
    const def = FIELDS.find((f) => f.key === key);
    const min = clampMin ? def?.min ?? 0 : 0;
    const max = def?.max ?? Number.MAX_SAFE_INTEGER;
    const v = Math.min(max, Math.max(min, value));
    setInputs((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!phone) {
      setStatus("phone_required");
      return;
    }
    if (HCAPTCHA_KEY && !captchaToken) {
      setStatus("captcha_required");
      return;
    }
    setStatus("sending");

    const payload = {
      source: CAPTURE.source,
      page: "calculadora",
      name: name.trim(),
      phone,
      captcha: captchaToken,
      perfil,
      produto,
      inputs,
      projection: {
        projecaoSem: Math.round(proj.projecaoSem),
        projecaoCom: Math.round(proj.projecaoCom),
        gap: Math.round(proj.gap),
        mensalPorPaciente: proj.mensalPorPaciente,
        autoQualified: proj.autoQualified,
      },
      submittedAt: new Date().toISOString(),
    };

    // ── DEV: demonstra a revelação localmente, sem backend. ──
    // Bloco eliminado do build de produção (import.meta.env.DEV → false).
    if (DEV_MOCK) {
      setReveal(devMockReveal(perfil, produto, inputs, proj));
      setStatus("sent");
      return;
    }

    if (!WEBHOOK_URL) {
      // Sem webhook configurado em produção = erro de configuração.
      console.warn("[calculadora] PUBLIC_N8N_CAPTURE_WEBHOOK não configurado.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      // O n8n responde 200 mesmo nos ramos de recusa (payload/captcha/source
      // inválidos), com { ok: false } no corpo. Sem ler o corpo, a recusa
      // vira tela de sucesso e o lead se perde em silêncio.
      const data = (await res.json().catch(() => null)) as RevealPayload | null;
      if (res.ok && data?.ok !== false) {
        setStatus("sent");
        if (data && data.ok && typeof data.investimentoAPartirDe === "number") {
          setReveal(data); // números travados, computados no servidor
        } else {
          setHandoffOnly(true); // gravou o lead, mas a leitura vem pelo WhatsApp
        }
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("[calculadora] erro no envio:", err);
      setStatus("error");
    }
  }

  const done = reveal !== null || handoffOnly;

  return (
    <div className="calc-roi">
      <style>{CSS}</style>

      {/* ── Seletores (§1) ───────────────────────────────────── */}
      <div className="calc-card">
        <div className="calc-block-grid">
          <div>
            <span className="calc-eyebrow">{c.eyebrowPerfil}</span>
            <Segmented
              options={perfilOptions}
              value={perfil}
              onChange={(v) => setPerfil(v as Perfil)}
              name="perfil"
            />
          </div>
          <div>
            <span className="calc-eyebrow">{c.eyebrowProduto}</span>
            <Segmented
              options={produtoOptions}
              value={produto}
              onChange={(v) => setProduto(v as Produto)}
              name="produto"
            />
          </div>
        </div>
      </div>

      {/* ── Entradas (Bloco A — público) ─────────────────────── */}
      <div className="calc-card">
        <span className="calc-eyebrow">{c.eyebrowNumeros}</span>
        <div className="calc-grid-inputs">
          {FIELDS.map((f) => (
            <Field key={f.key} def={f} value={inputs[f.key]} onChange={(v, blur) => setField(f.key, v, blur)} lang={lang} />
          ))}
        </div>
        <p className="calc-seal">{pick(SELO_PROJECAO, lang)}</p>
      </div>

      {/* ── Projeção + gráfico (Bloco A — público) ───────────── */}
      <div className="calc-card">
        <div className="calc-stats">
          <Stat label={c.statSem(ciclo)} value={formatBRL(proj.projecaoSem)} muted />
          <Stat label={c.statCom(ciclo)} value={formatBRL(proj.projecaoCom)} />
        </div>

        <div className="calc-chart-wrap">
          <Chart
            curvaSem={proj.curvaSem}
            curvaCom={proj.curvaCom}
            labelSem={c.labelSem}
            labelCom={c.labelCom}
            gap={proj.gap}
            autoQualified={proj.autoQualified}
            lang={lang}
          />
        </div>

        {proj.autoQualified ? (
          <div className="calc-autoqual">
            <strong>{c.autoqualStrong}</strong> {c.autoqualBody}
            {pick(POV, lang)}
          </div>
        ) : (
          <div className="calc-gap-hero">
            <span className="calc-gap-label">{c.gapLabel(ciclo)}</span>
            <span className="calc-gap-value">{formatBRL(proj.gap)}</span>
            <span className="calc-gap-sub">{c.gapSub}</span>
            <span className="calc-band">{c.band(formatBRL(proj.piso), formatBRL(proj.teto))}</span>
          </div>
        )}
      </div>

      {/* ── Porta de captura → revelação gated ───────────────── */}
      {!done && !showCapture && (
        <div className="calc-card calc-cta-card">
          <p className="calc-cta-copy">{proj.autoQualified ? c.ctaCopyAuto : c.ctaCopyGap}</p>
          <button type="button" className="calc-btn" onClick={() => setShowCapture(true)}>
            {c.ctaBtn}
          </button>
          <span className="calc-cta-micro">{c.ctaMicro}</span>
        </div>
      )}

      {!done && showCapture && (
        <div className="calc-card">
          <h3 className="calc-capture-title">{c.captureTitle}</h3>
          <form className="calc-capture" onSubmit={handleSubmit}>
            <div className="calc-field">
              <label htmlFor="calc-name" className="calc-label">
                {c.nameLabel}
              </label>
              <input
                id="calc-name"
                className="calc-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                placeholder={c.namePlaceholder}
                autoComplete="name"
              />
            </div>
            <div className="calc-field">
              <label htmlFor="calc-phone" className="calc-label">
                {c.phoneLabel}
              </label>
              <PhoneInput
                id="calc-phone"
                international
                defaultCountry="BR"
                value={phone}
                onChange={setPhone}
                placeholder={c.phonePlaceholder}
                className="calc-phone"
              />
            </div>

            {HCAPTCHA_KEY && (
              <div className="calc-captcha">
                <HCaptcha
                  ref={captchaRef}
                  sitekey={HCAPTCHA_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                />
              </div>
            )}

            {status === "phone_required" && <p className="calc-msg-error">{c.errPhone}</p>}
            {status === "captcha_required" && <p className="calc-msg-error">{c.errCaptcha}</p>}
            {status === "error" && <p className="calc-msg-error">{c.errGeneric}</p>}

            <button type="submit" className="calc-btn" disabled={status === "sending"}>
              {status === "sending" ? c.sending : c.submitBtn}
            </button>
            <span className="calc-cta-micro">{c.captureMicro}</span>
          </form>
        </div>
      )}

      {/* ── Revelação gated (Bloco B + C) ────────────────────── */}
      {reveal && <RevealBlock reveal={reveal} gap={proj.gap} ciclo={ciclo} lang={lang} />}

      {handoffOnly && (
        <div className="calc-card calc-handoff">
          <strong>{c.handoffStrong}</strong> {c.handoffBody}
        </div>
      )}

      <p className="calc-disclaimer">{pick(DISCLAIMER, lang)}</p>
    </div>
  );
}

// ── Subcomponentes ──────────────────────────────────────────

function Segmented({
  options,
  value,
  onChange,
  name,
}: {
  options: { value: string; label: string; helper?: string }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div className="calc-seg" role="group" aria-label={name}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="calc-seg-btn"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
        >
          <span className="calc-seg-label">{o.label}</span>
          {o.helper && <span className="calc-seg-helper">{o.helper}</span>}
        </button>
      ))}
    </div>
  );
}

function Field({
  def,
  value,
  onChange,
  lang,
}: {
  def: FieldDef;
  value: number;
  onChange: (value: number, clampMin: boolean) => void;
  lang: Lang;
}) {
  const id = `calc-${def.key}`;
  const cc = COPY[lang];
  return (
    <div className="calc-field">
      <label htmlFor={id} className="calc-label">
        {pick(def.label, lang)}
      </label>
      <div className="calc-input-row">
        <button type="button" className="calc-step" aria-label={cc.decrease} onClick={() => onChange(value - def.step, true)}>
          −
        </button>
        <div className="calc-input-box">
          {def.prefix && <span className="calc-affix">{def.prefix}</span>}
          <input
            id={id}
            className="calc-input"
            type="number"
            inputMode="numeric"
            min={def.min}
            max={def.max}
            step={def.step}
            value={value}
            onChange={(e) => {
              const raw = e.currentTarget.value;
              const num = raw === "" ? 0 : Number(raw);
              if (Number.isFinite(num)) onChange(num, false);
            }}
            onBlur={(e) => onChange(Number(e.currentTarget.value) || def.min, true)}
          />
          {def.suffix && <span className="calc-affix calc-affix-suffix">{pick(def.suffix, lang)}</span>}
        </div>
        <button type="button" className="calc-step" aria-label={cc.increase} onClick={() => onChange(value + def.step, true)}>
          +
        </button>
      </div>
      {def.helper && <span className="calc-help">{pick(def.helper, lang)}</span>}
    </div>
  );
}

function Stat({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className={`calc-stat${muted ? " calc-stat-muted" : ""}`}>
      <span className="calc-stat-value">{value}</span>
      <span className="calc-stat-label">{label}</span>
    </div>
  );
}

function RevealBlock({ reveal, gap, ciclo, lang }: { reveal: RevealPayload; gap: number; ciclo: number; lang: Lang }) {
  const c = COPY[lang];
  return (
    <div className="calc-card calc-reveal">
      <span className="calc-eyebrow">{c.revealEyebrow}</span>

      <div className="calc-reveal-grid">
        <div className="calc-reveal-item">
          <span className="calc-reveal-k">{c.revealInvest}</span>
          <span className="calc-reveal-v">{c.aPartirDe(formatBRL(reveal.investimentoAPartirDe))}</span>
        </div>
        <div className="calc-reveal-item">
          <span className="calc-reveal-k">{c.revealRoi}</span>
          <span className="calc-reveal-v calc-reveal-hi">{c.roi(reveal.roi)}</span>
          <span className="calc-reveal-note">
            {formatBRL(gap)} ÷ {formatBRL(reveal.investimentoAPartirDe)}
          </span>
        </div>
        <div className="calc-reveal-item">
          <span className="calc-reveal-k">{c.revealPayback}</span>
          <span className="calc-reveal-v">
            {reveal.paybackMeses ? c.paybackMonths(reveal.paybackMeses) : c.paybackOver(ciclo)}
          </span>
        </div>
      </div>

      <div className="calc-reveal-line">
        <span>
          {c.midiaLabel}{" "}
          <strong>{c.midiaValue(formatBRL(reveal.midiaMes), ciclo, formatBRL(reveal.midiaCiclo))}</strong>
        </span>
        <span>
          {c.desembolsoLabel} <strong>{formatBRL(reveal.desembolsoTotal)}</strong>
        </span>
      </div>

      {reveal.garantia && (
        <p className="calc-reveal-guarantee">
          <strong>{c.garantiaLabel}</strong> {reveal.garantia}
        </p>
      )}

      <p className="calc-reveal-foot">{c.revealFoot}</p>
    </div>
  );
}

// ── DEV-only mock (eliminado do build de produção) ──────────
// NUNCA inclui o piso Pix. Só o valor de TABELA ("a partir de") e a
// mídia mínima — os mesmos números que o servidor devolveria.
function devMockReveal(
  perfil: Perfil,
  produto: Produto,
  input: CalcInputs,
  proj: { gap: number; mensalPorPaciente: number },
): RevealPayload {
  const TABELA: Record<Perfil, Record<Produto, number>> = {
    autonomo: { p7k: 9074, p10k: 16000 },
    clinica: { p7k: 15340, p10k: 33540 },
  };
  const MIDIA: Record<Perfil, Record<Produto, number>> = {
    autonomo: { p7k: 3000, p10k: 5000 },
    clinica: { p7k: 5000, p10k: 8000 },
  };
  // Frases de garantia travadas (oferta-travada.md §1) — espelham o nó Recompute
  // Calc do webhook. P7K carrega "(Não é devolução.)"; P10K = prazo é resultado.
  const GARANTIA: Record<Produto, string> = {
    p7k: "uma meta de novo faturamento definida junto, na primeira conversa. Se não bater, a PsiAtiva segue trabalhando sem custo até bater. (Não é devolução.)",
    p10k: "a PsiAtiva fica até bater a meta acordada. O prazo é resultado, não calendário.",
  };
  const investimento = TABELA[perfil][produto];
  const midiaMes = MIDIA[perfil][produto];
  const r = computeReveal(input, proj, { investimento, midiaMes });
  return {
    ok: true,
    investimentoAPartirDe: investimento,
    midiaMes,
    midiaCiclo: r.midiaCiclo,
    desembolsoTotal: r.desembolsoTotal,
    roi: r.roi,
    paybackMeses: r.paybackMeses,
    garantia: GARANTIA[produto],
  };
}

// ── Estilos da island ───────────────────────────────────────
const CSS = `
.calc-roi { --calc-radius: 16px; display: flex; flex-direction: column; gap: 1rem; font-family: var(--font-ui); color: var(--text-primary); }
.calc-card { background: var(--background, #FAFFFF); border: 1px solid var(--color-border); border-radius: var(--calc-radius); padding: 1.5rem; }
.calc-eyebrow { display: block; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-heading); margin-bottom: 0.75rem; }
.calc-block-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
.calc-seg { display: flex; gap: 0.5rem; }
.calc-seg-btn { flex: 1; display: flex; flex-direction: column; gap: 0.2rem; text-align: left; padding: 0.75rem 0.9rem; border: 1.5px solid var(--color-border); border-radius: 12px; background: transparent; cursor: pointer; transition: border-color .2s, background .2s; font-family: var(--font-ui); }
.calc-seg-btn:hover { border-color: var(--color-border-hover); }
.calc-seg-btn[aria-pressed="true"] { border-color: var(--primary); background: rgba(26,75,81,0.06); }
.calc-seg-label { font-size: 0.9375rem; font-weight: 600; color: var(--text-heading); }
.calc-seg-helper { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.3; }
.calc-grid-inputs { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1.1rem; }
.calc-field { display: flex; flex-direction: column; gap: 0.4rem; }
.calc-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-heading); }
.calc-input-row { display: flex; align-items: stretch; gap: 0.4rem; }
.calc-step { width: 38px; flex-shrink: 0; border: 1px solid var(--color-border); background: var(--background-subtle, #F0F7F4); border-radius: 10px; font-size: 1.25rem; line-height: 1; color: var(--primary); cursor: pointer; transition: background .2s; }
.calc-step:hover { background: var(--light-blue); }
.calc-input-box { flex: 1; display: flex; align-items: center; gap: 0.35rem; border: 1px solid var(--color-border); border-radius: 10px; padding: 0 0.75rem; background: var(--background, #FAFFFF); }
.calc-input-box:focus-within { border-color: var(--primary); }
.calc-affix { font-size: 0.875rem; color: var(--text-secondary); white-space: nowrap; }
.calc-affix-suffix { color: var(--text-secondary); }
.calc-input { width: 100%; border: none; outline: none; background: transparent; font-family: var(--font-ui); font-size: 1rem; font-weight: 600; color: var(--text-heading); padding: 0.6rem 0; text-align: left; -moz-appearance: textfield; }
.calc-input::-webkit-outer-spin-button, .calc-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
.calc-help { font-size: 0.75rem; color: var(--text-secondary); line-height: 1.35; }
.calc-seal { margin-top: 1rem; font-size: 0.75rem; color: var(--text-secondary); line-height: 1.45; font-style: italic; }
.calc-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem; }
.calc-stat { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; border-radius: 12px; background: var(--background-subtle, #F0F7F4); border: 1px solid var(--color-border); }
.calc-stat-muted { opacity: 0.85; }
.calc-stat-value { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; color: var(--text-heading); line-height: 1.1; }
.calc-stat-muted .calc-stat-value { color: var(--text-secondary); }
.calc-stat-label { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.35; }
.calc-chart-wrap { margin: 0.5rem 0 1.25rem; }
.calc-gap-hero { display: flex; flex-direction: column; gap: 0.35rem; padding: 1.25rem; border-radius: 12px; background: rgba(247,200,0,0.08); border: 1px solid rgba(247,200,0,0.35); }
.calc-gap-label { font-size: 0.8125rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-heading); }
.calc-gap-value { font-family: var(--font-display); font-size: 2.5rem; font-weight: 700; color: var(--primary); line-height: 1.05; }
.calc-gap-sub { font-size: 0.9375rem; color: var(--text-primary); line-height: 1.45; }
.calc-band { font-size: 0.8125rem; color: var(--text-secondary); margin-top: 0.25rem; }
.calc-autoqual { padding: 1.25rem; border-radius: 12px; background: var(--sage-bg, #E4E6E3); border: 1px solid var(--color-border); font-size: 0.9375rem; line-height: 1.5; color: var(--text-primary); }
.calc-cta-card { display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem; }
.calc-cta-copy { font-size: 1.0625rem; font-weight: 600; color: var(--text-heading); margin: 0; }
.calc-btn { align-self: flex-start; padding: 0.85rem 1.75rem; border: none; border-radius: 9999px; background: var(--btn-primary-bg); color: var(--btn-primary-color); font-family: var(--font-ui); font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background .2s, transform .2s; }
.calc-btn:hover:not(:disabled) { background: var(--btn-primary-hover-bg); transform: translateY(-1px); }
.calc-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.calc-cta-micro { font-size: 0.75rem; color: var(--text-secondary); }
.calc-capture-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--text-heading); margin: 0 0 1rem; }
.calc-capture { display: flex; flex-direction: column; gap: 1rem; max-width: 460px; }
.calc-phone { display: flex; align-items: center; }
.calc-phone .PhoneInputCountry { display: none; }
.calc-phone input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.calc-phone input:focus { border-color: var(--primary); }
.calc-captcha { min-height: 78px; }
.calc-msg-error { font-size: 0.8125rem; color: #9a6a00; background: rgba(247,200,0,0.12); border: 1px solid rgba(247,200,0,0.3); padding: 0.6rem 0.8rem; border-radius: 8px; margin: 0; }
.calc-reveal { border-color: var(--primary); }
.calc-reveal-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin: 0.5rem 0 1.25rem; }
.calc-reveal-item { display: flex; flex-direction: column; gap: 0.25rem; padding: 1rem; border-radius: 12px; background: var(--background-subtle, #F0F7F4); }
.calc-reveal-k { font-size: 0.8125rem; color: var(--text-secondary); }
.calc-reveal-v { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; color: var(--text-heading); }
.calc-reveal-hi { color: var(--primary); font-size: 2rem; }
.calc-reveal-note { font-size: 0.75rem; color: var(--text-secondary); }
.calc-reveal-line { display: flex; flex-direction: column; gap: 0.4rem; padding: 1rem; border-radius: 12px; background: rgba(26,75,81,0.05); font-size: 0.875rem; color: var(--text-primary); line-height: 1.45; }
.calc-reveal-guarantee { font-size: 0.875rem; color: var(--text-primary); line-height: 1.5; margin: 1rem 0 0; }
.calc-reveal-foot { font-size: 0.8125rem; color: var(--text-secondary); line-height: 1.5; margin: 1rem 0 0; }
.calc-handoff { font-size: 1rem; line-height: 1.55; color: var(--text-primary); }
.calc-disclaimer { font-size: 0.6875rem; color: var(--text-secondary); line-height: 1.5; opacity: 0.8; text-align: center; margin: 0.25rem 0 0; }
@media (max-width: 720px) {
  .calc-block-grid { grid-template-columns: 1fr; }
  .calc-seg { flex-direction: column; }
  .calc-stats { grid-template-columns: 1fr; }
  .calc-gap-value { font-size: 2rem; }
}
`;
