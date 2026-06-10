"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import { gsap } from "gsap";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { SITE_CONFIG } from "../../config/site.config";
import { CAMPAIGN_PARAMS } from "../../config/forms.config";
import {
  buildAnswers,
  buildEnvelope,
  getOrCreateVisitorId,
  messageForError,
  readCampaign,
  validateAnswer,
  type AnswerValue,
  type FieldProps,
  type FieldType,
  type FormAnswer,
  type FormContent,
  type FormQuestion,
} from "../../lib/forms";
import { trackEvent } from "../../lib/analytics";
import SingleSelect from "./fields/SingleSelect";
import MultiSelect from "./fields/MultiSelect";
import OpenText from "./fields/OpenText";
import RatingScale from "./fields/RatingScale";
import Statement from "./fields/Statement";
import Consent from "./fields/Consent";
import ContactStep from "./fields/ContactStep";

// Vite substitui estes acessos estáticos em build (igual ao quiz/calc).
const WEBHOOK_URL = (import.meta.env.PUBLIC_N8N_CAPTURE_WEBHOOK as string | undefined) || "";
const DEV_MOCK = import.meta.env.DEV && import.meta.env.PUBLIC_FORMS_DEV_MOCK === "true";
const HCAPTCHA_KEY = SITE_CONFIG.analytics.hcaptchaSiteKey || "";

const FIELDS: Record<FieldType, ComponentType<FieldProps>> = {
  single_select: SingleSelect,
  multi_select: MultiSelect,
  open_text: OpenText,
  long_text: OpenText,
  rating: RatingScale,
  statement: Statement,
  consent: Consent,
};

interface Props {
  content: FormContent;
  source: string;
  page?: string;
}

type Phase = "intro" | "questions" | "contact" | "done";
type Status =
  | "idle"
  | "sending"
  | "sent"
  | "error"
  | "captcha_required"
  | "phone_required";

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function FormIsland({ content, source, page }: Props) {
  const questions = content.questions;
  const hasIntro = !!content.intro;
  const hasContact = !!content.contact?.enabled;
  const total = questions.length + (hasContact ? 1 : 0);
  const ui = content.ui;

  const [phase, setPhase] = useState<Phase>(hasIntro ? "intro" : "questions");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, FormAnswer>>({});
  const [error, setError] = useState<string | null>(null);
  const [campaign, setCampaign] = useState<string | null>(null);

  // Captura (passo final)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const captchaRef = useRef<HCaptcha>(null);

  const screenRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // ?lead= / ?c= só existem no cliente — ler após montar (SSR-safe).
  useEffect(() => {
    for (const p of CAMPAIGN_PARAMS) {
      const c = readCampaign(p);
      if (c) {
        setCampaign(c);
        break;
      }
    }
  }, []);

  // survey_start uma vez, ao entrar nas perguntas.
  useEffect(() => {
    if (phase === "questions" && !startedRef.current) {
      startedRef.current = true;
      trackEvent("survey_start", {
        survey_type: "native",
        survey_route: window.location.pathname,
      });
    }
  }, [phase]);

  // Animação de entrada a cada troca de tela (degrada sem motion).
  useEffect(() => {
    const el = screenRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [phase, qIndex]);

  function goToNextStep(extra?: FormAnswer) {
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else if (hasContact) {
      setPhase("contact");
    } else {
      void submit(extra);
    }
  }

  function handleChange(q: FormQuestion, value: AnswerValue, label?: string | string[]) {
    const ans: FormAnswer = { questionId: q.id, type: q.type, value, label };
    setAnswers((prev) => ({ ...prev, [q.id]: ans }));
    setError(null);
    // Single-select: escolha única já é válida → auto-avança (UX do /quiz).
    if (q.type === "single_select") goToNextStep(ans);
  }

  function advanceCurrent() {
    const q = questions[qIndex];
    const err = validateAnswer(q, answers[q.id]);
    if (err) {
      setError(messageForError(err, q, ui));
      return;
    }
    setError(null);
    goToNextStep();
  }

  function goBack() {
    setError(null);
    if (phase === "contact") {
      setPhase("questions");
      setQIndex(questions.length - 1);
      return;
    }
    if (qIndex > 0) setQIndex((i) => i - 1);
    else if (hasIntro) setPhase("intro");
  }

  function finish() {
    setStatus("sent");
    setPhase("done");
    captchaRef.current?.resetCaptcha();
    setCaptchaToken(null);
    const route = typeof window !== "undefined" ? window.location.pathname : "";
    trackEvent("survey_complete", { survey_type: "native", survey_route: route });
    trackEvent("generate_lead", { form_name: source, page_path: route });
  }

  async function submit(extra?: FormAnswer) {
    const c = content.contact;
    setStatus("sending");

    const answersArray = buildAnswers(content, answers, extra);
    const envelope = buildEnvelope(content, answersArray, campaign);
    const payload = {
      source,
      page: page ?? content.meta.slug,
      campaign,
      name: name.trim() || undefined,
      email: (c?.collectEmail ? email.trim() : "") || undefined,
      phone: phone || undefined,
      captcha: captchaToken,
      visitorId: getOrCreateVisitorId(),
      survey: envelope,
      submittedAt: new Date().toISOString(),
    };

    // ── DEV: loga o payload, sem backend. Eliminado do build de produção. ──
    if (DEV_MOCK) {
      console.info("[forms] DEV mock payload:", payload);
      finish();
      return;
    }

    if (!WEBHOOK_URL) {
      console.warn("[forms] PUBLIC_N8N_CAPTURE_WEBHOOK não configurado.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) finish();
      else setStatus("error");
    } catch (err) {
      console.error("[forms] erro no envio:", err);
      setStatus("error");
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const c = content.contact;
    if ((c?.collectPhone ?? true) && !phone) {
      setStatus("phone_required");
      return;
    }
    if ((c?.requireCaptcha ?? true) && HCAPTCHA_KEY && !captchaToken) {
      setStatus("captcha_required");
      return;
    }
    void submit();
  }

  const q = phase === "questions" ? questions[qIndex] : undefined;
  const Field = q ? FIELDS[q.type] : null;
  const stepNum = phase === "contact" ? questions.length + 1 : qIndex + 1;
  const pct = phase === "done" ? 100 : Math.round((stepNum / total) * 100);
  const showProgress = phase === "questions" || phase === "contact";

  return (
    <div className="nf">
      <style>{CSS}</style>

      {showProgress && (
        <div className="nf-progress" aria-hidden="true">
          <div className="nf-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div ref={screenRef} className="nf-screen">
        {/* ── Intro ─────────────────────────────────────────── */}
        {phase === "intro" && content.intro && (
          <div className="nf-intro">
            {content.intro.tag && <span className="nf-tag">{content.intro.tag}</span>}
            <h2 className="nf-intro-title">{content.intro.title}</h2>
            {content.intro.subtitle && <p className="nf-intro-sub">{content.intro.subtitle}</p>}
            {content.intro.note && <p className="nf-intro-note">{content.intro.note}</p>}
            <button type="button" className="nf-btn" onClick={() => setPhase("questions")}>
              {content.intro.start}
            </button>
          </div>
        )}

        {/* ── Pergunta ──────────────────────────────────────── */}
        {phase === "questions" && q && Field && (
          <div className="nf-question">
            <span className="nf-step-label">
              {ui.progress.replace("{n}", String(qIndex + 1)).replace("{total}", String(total))}
            </span>
            <h2 className="nf-prompt">{q.prompt}</h2>
            {q.helper && q.type !== "statement" && q.type !== "consent" && (
              <p className="nf-helper">{q.helper}</p>
            )}

            <Field
              question={q}
              answer={answers[q.id]}
              onChange={(value, label) => handleChange(q, value, label)}
            />

            {error && <p className="nf-error">{error}</p>}

            <div className="nf-nav">
              {qIndex > 0 && (
                <button type="button" className="nf-back" onClick={goBack}>
                  ← {ui.back}
                </button>
              )}
              {q.type !== "single_select" && (
                <button type="button" className="nf-btn" onClick={advanceCurrent}>
                  {q.type === "statement" ? (q.cta ?? ui.next) : ui.next}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Captura ───────────────────────────────────────── */}
        {phase === "contact" && content.contact && (
          <div className="nf-question">
            <ContactStep
              config={content.contact}
              name={name}
              onName={setName}
              email={email}
              onEmail={setEmail}
              phone={phone}
              onPhone={setPhone}
              captchaKey={HCAPTCHA_KEY}
              captchaRef={captchaRef}
              onCaptcha={setCaptchaToken}
              status={status}
              onSubmit={handleSubmit}
            />
            <div className="nf-nav">
              <button type="button" className="nf-back" onClick={goBack}>
                ← {ui.back}
              </button>
            </div>
          </div>
        )}

        {/* ── Obrigado ──────────────────────────────────────── */}
        {phase === "done" && (
          <div className="nf-done">
            <span className="nf-check" aria-hidden="true">✓</span>
            <h2 className="nf-done-title">{content.thankYou.title}</h2>
            <p className="nf-done-body">{content.thankYou.body}</p>
          </div>
        )}
      </div>

      {(phase === "contact" || phase === "done") && ui.disclaimer && (
        <p className="nf-disclaimer">{ui.disclaimer}</p>
      )}
    </div>
  );
}

// ── Estilos da island (tokens do design system, igual à calculadora/quiz) ──
const CSS = `
.nf { --nf-radius: 16px; display: flex; flex-direction: column; gap: 1.25rem; font-family: var(--font-ui); color: var(--text-primary); }
.nf-progress { height: 6px; border-radius: 9999px; background: var(--color-border); overflow: hidden; }
.nf-progress-bar { height: 100%; background: var(--primary); border-radius: 9999px; transition: width .45s ease; }
.nf-screen { background: var(--background, #FAFFFF); border: 1px solid var(--color-border); border-radius: var(--nf-radius); padding: 2rem; }
.nf-tag { display: inline-block; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--secondary); background: var(--sage-bg, #E4E6E3); padding: 6px 14px; border-radius: var(--radius-tag, 9999px); }
.nf-eyebrow { display: block; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--secondary); margin-bottom: 0.5rem; }

/* Intro */
.nf-intro { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
.nf-intro-title { font-family: var(--font-display); font-size: 1.85rem; font-weight: 600; line-height: 1.2; color: var(--text-heading); margin: 0.25rem 0 0; }
.nf-intro-sub { font-family: var(--font-body); font-size: 1.0625rem; line-height: 1.6; color: var(--text-secondary); margin: 0; }
.nf-intro-note { font-size: 0.875rem; color: var(--text-secondary); margin: 0; opacity: 0.9; }

/* Pergunta */
.nf-step-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; }
.nf-prompt { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; line-height: 1.3; color: var(--text-heading); margin: 0 0 0.35rem; }
.nf-helper { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.25rem; }

/* Opções (single + multi) */
.nf-options { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem; }
.nf-option { display: flex; align-items: flex-start; gap: 0.75rem; text-align: left; padding: 1rem 1.1rem; border: 1.5px solid var(--color-border); border-radius: 12px; background: transparent; cursor: pointer; transition: border-color .2s, background .2s; font-family: var(--font-ui); }
.nf-option:hover { border-color: var(--color-border-hover); background: var(--background-subtle, #F0F7F4); }
.nf-option[aria-checked="true"], .nf-option[aria-pressed="true"] { border-color: var(--primary); background: rgba(26,75,81,0.06); }
.nf-radio { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; border: 2px solid var(--color-border-hover); border-radius: 50%; transition: border-color .2s, box-shadow .2s; }
.nf-option[aria-checked="true"] .nf-radio { border-color: var(--primary); box-shadow: inset 0 0 0 4px var(--primary); }
.nf-check { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; border: 2px solid var(--color-border-hover); border-radius: 6px; position: relative; transition: border-color .2s, background .2s; }
.nf-option[aria-pressed="true"] .nf-check { border-color: var(--primary); background: var(--primary); }
.nf-option[aria-pressed="true"] .nf-check::after { content: "✓"; position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: 13px; font-weight: 700; line-height: 1; }
.nf-option-label { font-size: 1rem; font-weight: 500; color: var(--text-heading); line-height: 1.4; }

/* Texto */
.nf-input, .nf-textarea { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.nf-input:focus, .nf-textarea:focus { border-color: var(--primary); }
.nf-textarea { resize: vertical; min-height: 120px; line-height: 1.5; }

/* Rating */
.nf-rating { display: flex; flex-direction: column; gap: 0.5rem; }
.nf-rating-row { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.nf-rating-btn { min-width: 46px; height: 46px; padding: 0 0.6rem; border: 1.5px solid var(--color-border); border-radius: 10px; background: transparent; cursor: pointer; font-family: var(--font-ui); font-size: 1rem; font-weight: 600; color: var(--text-heading); transition: border-color .2s, background .2s, color .2s; }
.nf-rating-btn:hover { border-color: var(--color-border-hover); }
.nf-rating-btn.is-active { border-color: var(--primary); background: rgba(26,75,81,0.08); }
.nf-rating-btn.is-star { border: none; background: none; font-size: 1.9rem; min-width: auto; height: auto; padding: 0 0.12rem; color: var(--color-border-hover); }
.nf-rating-btn.is-star.is-active { color: var(--accent, #7EAE89); }
.nf-rating-labels { display: flex; justify-content: space-between; gap: 1rem; font-size: 0.8125rem; color: var(--text-secondary); }

/* Consent + statement */
.nf-consent { display: flex; align-items: flex-start; gap: 0.7rem; cursor: pointer; font-size: 0.95rem; line-height: 1.5; color: var(--text-primary); margin-top: 0.5rem; }
.nf-consent input { margin-top: 0.2rem; width: 18px; height: 18px; accent-color: var(--primary); flex-shrink: 0; }
.nf-statement-body { font-size: 1rem; line-height: 1.6; color: var(--text-secondary); margin: 0.25rem 0 0; }

/* Captura */
.nf-capture-title { font-family: var(--font-display); font-size: 1.35rem; font-weight: 600; color: var(--text-heading); margin: 0 0 1.1rem; line-height: 1.35; }
.nf-form { display: flex; flex-direction: column; gap: 1rem; max-width: 460px; }
.nf-field { display: flex; flex-direction: column; gap: 0.4rem; }
.nf-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-heading); }
.nf-phone { display: flex; align-items: center; }
.nf-phone .PhoneInputCountry { display: none; }
.nf-phone input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.nf-phone input:focus { border-color: var(--primary); }
.nf-captcha { min-height: 78px; }
.nf-micro { font-size: 0.75rem; color: var(--text-secondary); }

/* Mensagens */
.nf-error { font-size: 0.8125rem; color: #9a6a00; background: rgba(247,200,0,0.12); border: 1px solid rgba(247,200,0,0.3); padding: 0.6rem 0.8rem; border-radius: 8px; margin: 0.75rem 0 0; }

/* Nav + botões */
.nf-nav { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; justify-content: flex-end; }
.nf-btn { padding: 0.85rem 1.75rem; border: none; border-radius: 9999px; background: var(--btn-primary-bg); color: var(--btn-primary-color); font-family: var(--font-ui); font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background .2s, transform .2s; }
.nf-btn:hover:not(:disabled) { background: var(--btn-primary-hover-bg); transform: translateY(-1px); }
.nf-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.nf-back { margin-right: auto; background: none; border: none; color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.875rem; cursor: pointer; padding: 0.25rem 0; }
.nf-back:hover { color: var(--primary); }

/* Obrigado */
.nf-done { display: flex; flex-direction: column; align-items: flex-start; gap: 0.85rem; }
.nf-check { display: inline-grid; width: 56px; height: 56px; place-items: center; border-radius: 50%; background: var(--gradient-brand, var(--primary)); color: #fff; font: 700 1.6rem/1 var(--font-ui); }
.nf-done-title { font-family: var(--font-display); font-size: 1.7rem; font-weight: 600; color: var(--text-heading); margin: 0.25rem 0 0; line-height: 1.2; }
.nf-done-body { font-size: 1.0625rem; line-height: 1.6; color: var(--text-secondary); margin: 0; }

.nf-disclaimer { font-size: 0.6875rem; color: var(--text-secondary); line-height: 1.5; opacity: 0.8; text-align: center; margin: 0; }

@media (max-width: 720px) {
  .nf-screen { padding: 1.4rem; }
  .nf-intro-title { font-size: 1.5rem; }
  .nf-prompt { font-size: 1.25rem; }
  .nf-done-title { font-size: 1.45rem; }
}
`;
