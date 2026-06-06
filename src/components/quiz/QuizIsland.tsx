"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { SITE_CONFIG } from "../../config/site.config";
import { CAMPAIGN_PARAM, CAPTURE, QUIZ } from "../../config/quiz.config";
import {
  buildEnvelope,
  computeOutcome,
  type Answer,
  type QuizOutcome,
} from "../../lib/quiz";

// Vite substitui estes acessos estáticos em build. Acesso dinâmico não é
// substituído — por isso referenciamos a chave literalmente (igual à calc).
const WEBHOOK_URL = (import.meta.env.PUBLIC_N8N_CAPTURE_WEBHOOK as string | undefined) || "";
const DEV_MOCK = import.meta.env.DEV && import.meta.env.PUBLIC_QUIZ_DEV_MOCK === "true";
const HCAPTCHA_KEY = SITE_CONFIG.analytics.hcaptchaSiteKey || "";

type Phase = "intro" | "quiz" | "result";
type Status = "idle" | "sending" | "sent" | "error" | "captcha_required" | "phone_required";

const questions = QUIZ.questions;
const total = questions.length;

// Lê e sanitiza o ?c= da URL (a stories marca qual dor o link atacou).
// Não confiar em querystring crua — só slug curto [a-z0-9-].
function readCampaign(): string | null {
  if (typeof window === "undefined") return null;
  const raw = new URLSearchParams(window.location.search).get(CAMPAIGN_PARAM);
  if (!raw) return null;
  const slug = raw.toLowerCase().slice(0, 40);
  return /^[a-z0-9-]+$/.test(slug) ? slug : null;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function QuizIsland() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [campaign, setCampaign] = useState<string | null>(null);

  // Captura (último passo)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [done, setDone] = useState(false);
  const captchaRef = useRef<HCaptcha>(null);

  const screenRef = useRef<HTMLDivElement>(null);

  // ?c= só existe no cliente — ler após montar (SSR-safe).
  useEffect(() => setCampaign(readCampaign()), []);

  // Animação de entrada (GSAP) a cada troca de tela. Sem motion reduzido =
  // conteúdo já visível (CSS base opacity:1), então degrada sem sumir.
  useEffect(() => {
    const el = screenRef.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
    }, el);
    return () => ctx.revert();
  }, [phase, qIndex]);

  const answersArray = useMemo(
    () => questions.map((q) => answers[q.id]).filter(Boolean) as Answer[],
    [answers],
  );

  const allAnswered = answersArray.length === total;
  const outcome: QuizOutcome | null = useMemo(
    () => (allAnswered ? computeOutcome(QUIZ, answersArray) : null),
    [allAnswered, answersArray],
  );

  function selectOption(questionId: string, optionId: string, label: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: { questionId, optionId, label } }));
    // Auto-avança: próxima pergunta ou resultado.
    if (qIndex < total - 1) {
      setQIndex((i) => i + 1);
    } else {
      setPhase("result");
    }
  }

  function goBack() {
    if (qIndex > 0) setQIndex((i) => i - 1);
  }

  function restart() {
    setAnswers({});
    setQIndex(0);
    setName("");
    setPhone("");
    setCaptchaToken(null);
    setStatus("idle");
    setDone(false);
    setPhase("intro");
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
    if (!outcome) {
      setStatus("error");
      return;
    }
    setStatus("sending");

    const envelope = buildEnvelope(outcome, answersArray, campaign);
    const payload = {
      source: CAPTURE.source,
      page: CAPTURE.page,
      campaign,
      name: name.trim(),
      phone,
      captcha: captchaToken,
      quiz: envelope,
      submittedAt: new Date().toISOString(),
    };

    // ── DEV: simula o handoff localmente, sem backend. ──
    // Bloco eliminado do build de produção (import.meta.env.DEV → false).
    if (DEV_MOCK) {
      console.info("[quiz] DEV mock payload:", payload);
      setDone(true);
      setStatus("sent");
      return;
    }

    if (!WEBHOOK_URL) {
      console.warn("[quiz] PUBLIC_N8N_CAPTURE_WEBHOOK não configurado.");
      setStatus("error");
      return;
    }

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("sent");
        setDone(true);
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("[quiz] erro no envio:", err);
      setStatus("error");
    }
  }

  const q = questions[qIndex];
  const selectedId = q ? answers[q.id]?.optionId : undefined;
  const pct = phase === "result" ? 100 : Math.round(((qIndex + 1) / total) * 100);

  return (
    <div className="quiz">
      <style>{CSS}</style>

      {/* Barra de progresso (oculta na intro) */}
      {phase !== "intro" && (
        <div className="quiz-progress" aria-hidden="true">
          <div className="quiz-progress-bar" style={{ width: `${pct}%` }} />
        </div>
      )}

      <div ref={screenRef} className="quiz-screen">
        {/* ── Intro ─────────────────────────────────────────── */}
        {phase === "intro" && (
          <div className="quiz-intro">
            <span className="quiz-tag">{QUIZ.intro.tag}</span>
            <h2 className="quiz-intro-title">{QUIZ.intro.title}</h2>
            <p className="quiz-intro-sub">{QUIZ.intro.subtitle}</p>
            <p className="quiz-intro-note">{QUIZ.intro.note}</p>
            <button type="button" className="quiz-btn" onClick={() => setPhase("quiz")}>
              {QUIZ.intro.start}
            </button>
          </div>
        )}

        {/* ── Perguntas ─────────────────────────────────────── */}
        {phase === "quiz" && q && (
          <div className="quiz-question">
            <span className="quiz-step-label">
              {QUIZ.ui.progress.replace("{n}", String(qIndex + 1)).replace("{total}", String(total))}
            </span>
            <h2 className="quiz-prompt">{q.prompt}</h2>
            {q.helper && <p className="quiz-helper">{q.helper}</p>}
            <div className="quiz-options" role="group" aria-label={q.prompt}>
              {q.options.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className="quiz-option"
                  aria-pressed={selectedId === o.id}
                  onClick={() => selectOption(q.id, o.id, o.label)}
                >
                  <span className="quiz-option-radio" aria-hidden="true" />
                  <span className="quiz-option-label">{o.label}</span>
                </button>
              ))}
            </div>
            {qIndex > 0 && (
              <button type="button" className="quiz-back" onClick={goBack}>
                ← {QUIZ.ui.back}
              </button>
            )}
          </div>
        )}

        {/* ── Resultado + captura ───────────────────────────── */}
        {phase === "result" && outcome && (
          <div className="quiz-result">
            <span className="quiz-eyebrow">{QUIZ.ui.resultEyebrow}</span>
            <h2 className="quiz-result-pain">{outcome.dominant.painName}</h2>
            <p className="quiz-result-echo">{outcome.dominant.echo}</p>

            <div className="quiz-result-cost">
              <span className="quiz-result-cost-label">O que isso custa</span>
              <p>{outcome.dominant.hemorrhage}</p>
            </div>

            <div className="quiz-result-aspiration">
              <p>{outcome.dominant.aspiration}</p>
            </div>

            {/* Captura — a isca fica atrás do telefone (sem link de download) */}
            {!done ? (
              <div className="quiz-capture-card">
                <span className="quiz-eyebrow">{QUIZ.capture.eyebrow}</span>
                <p className="quiz-capture-title">
                  {QUIZ.capture.title.replace("{isca}", outcome.dominant.iscaPromise)}
                </p>
                <form className="quiz-capture" onSubmit={handleSubmit}>
                  <div className="quiz-field">
                    <label htmlFor="quiz-name" className="quiz-label">
                      {QUIZ.capture.nameLabel}
                    </label>
                    <input
                      id="quiz-name"
                      className="quiz-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.currentTarget.value)}
                      placeholder={QUIZ.capture.namePlaceholder}
                      autoComplete="name"
                    />
                  </div>
                  <div className="quiz-field">
                    <label htmlFor="quiz-phone" className="quiz-label">
                      {QUIZ.capture.phoneLabel}
                    </label>
                    <PhoneInput
                      id="quiz-phone"
                      international
                      defaultCountry="BR"
                      value={phone}
                      onChange={setPhone}
                      placeholder={QUIZ.capture.phonePlaceholder}
                      className="quiz-phone"
                    />
                  </div>

                  {HCAPTCHA_KEY && (
                    <div className="quiz-captcha">
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={HCAPTCHA_KEY}
                        onVerify={(t) => setCaptchaToken(t)}
                        onExpire={() => setCaptchaToken(null)}
                      />
                    </div>
                  )}

                  {status === "phone_required" && <p className="quiz-msg-error">{QUIZ.capture.phoneRequired}</p>}
                  {status === "captcha_required" && <p className="quiz-msg-error">{QUIZ.capture.captchaRequired}</p>}
                  {status === "error" && <p className="quiz-msg-error">{QUIZ.capture.error}</p>}

                  <button type="submit" className="quiz-btn" disabled={status === "sending"}>
                    {status === "sending" ? QUIZ.capture.sending : QUIZ.capture.submit}
                  </button>
                  <span className="quiz-micro">{QUIZ.capture.micro}</span>
                </form>
              </div>
            ) : (
              <div className="quiz-handoff">
                <strong>{QUIZ.handoff.title}</strong>
                <p>{QUIZ.handoff.body.replace("{isca}", outcome.dominant.iscaTitle)}</p>
              </div>
            )}

            <button type="button" className="quiz-restart" onClick={restart}>
              {QUIZ.ui.restart}
            </button>
          </div>
        )}
      </div>

      {phase === "result" && <p className="quiz-disclaimer">{QUIZ.ui.disclaimer}</p>}
    </div>
  );
}

// ── Estilos da island (tokens do design system, igual à calculadora) ──
const CSS = `
.quiz { --quiz-radius: 16px; display: flex; flex-direction: column; gap: 1.25rem; font-family: var(--font-ui); color: var(--text-primary); }
.quiz-progress { height: 6px; border-radius: 9999px; background: var(--color-border); overflow: hidden; }
.quiz-progress-bar { height: 100%; background: var(--primary); border-radius: 9999px; transition: width .45s ease; }
.quiz-screen { background: var(--background, #FAFFFF); border: 1px solid var(--color-border); border-radius: var(--quiz-radius); padding: 2rem; }
.quiz-tag { display: inline-block; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--secondary); background: var(--sage-bg, #E4E6E3); padding: 6px 14px; border-radius: var(--radius-tag, 9999px); }
.quiz-eyebrow { display: block; font-size: 0.8125rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--secondary); margin-bottom: 0.5rem; }

/* Intro */
.quiz-intro { display: flex; flex-direction: column; align-items: flex-start; gap: 1rem; }
.quiz-intro-title { font-family: var(--font-display); font-size: 1.85rem; font-weight: 600; line-height: 1.2; color: var(--text-heading); margin: 0.25rem 0 0; }
.quiz-intro-sub { font-family: var(--font-body); font-size: 1.0625rem; line-height: 1.6; color: var(--text-secondary); margin: 0; }
.quiz-intro-note { font-size: 0.875rem; color: var(--text-secondary); margin: 0; opacity: 0.9; }

/* Pergunta */
.quiz-step-label { display: block; font-size: 0.8125rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.5rem; }
.quiz-prompt { font-family: var(--font-display); font-size: 1.5rem; font-weight: 600; line-height: 1.3; color: var(--text-heading); margin: 0 0 0.35rem; }
.quiz-helper { font-size: 0.875rem; color: var(--text-secondary); margin: 0 0 1.25rem; }
.quiz-options { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem; }
.quiz-option { display: flex; align-items: flex-start; gap: 0.75rem; text-align: left; padding: 1rem 1.1rem; border: 1.5px solid var(--color-border); border-radius: 12px; background: transparent; cursor: pointer; transition: border-color .2s, background .2s; font-family: var(--font-ui); }
.quiz-option:hover { border-color: var(--color-border-hover); background: var(--background-subtle, #F0F7F4); }
.quiz-option[aria-pressed="true"] { border-color: var(--primary); background: rgba(26,75,81,0.06); }
.quiz-option-radio { flex-shrink: 0; width: 20px; height: 20px; margin-top: 1px; border: 2px solid var(--color-border-hover); border-radius: 50%; transition: border-color .2s, box-shadow .2s; }
.quiz-option[aria-pressed="true"] .quiz-option-radio { border-color: var(--primary); box-shadow: inset 0 0 0 4px var(--primary); }
.quiz-option-label { font-size: 1rem; font-weight: 500; color: var(--text-heading); line-height: 1.4; }
.quiz-back { align-self: flex-start; margin-top: 1.25rem; background: none; border: none; color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.875rem; cursor: pointer; padding: 0.25rem 0; }
.quiz-back:hover { color: var(--primary); }

/* Resultado */
.quiz-result { display: flex; flex-direction: column; }
.quiz-result-pain { font-family: var(--font-display); font-size: 2rem; font-weight: 700; line-height: 1.15; color: var(--primary); margin: 0 0 0.85rem; }
.quiz-result-echo { font-family: var(--font-body); font-style: italic; font-size: 1.1875rem; line-height: 1.5; color: var(--text-heading); margin: 0 0 1.5rem; }
.quiz-result-cost { padding: 1.25rem; border-radius: 12px; background: rgba(247,200,0,0.08); border: 1px solid rgba(247,200,0,0.35); margin-bottom: 1.25rem; }
.quiz-result-cost-label { display: block; font-size: 0.8125rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--text-heading); margin-bottom: 0.4rem; }
.quiz-result-cost p { font-size: 1rem; line-height: 1.55; color: var(--text-primary); margin: 0; }
.quiz-result-aspiration { padding: 1.25rem; border-radius: 12px; background: var(--background-subtle, #F0F7F4); border: 1px solid var(--color-border); margin-bottom: 1.75rem; }
.quiz-result-aspiration p { font-size: 1rem; line-height: 1.55; color: var(--text-primary); margin: 0; }

/* Captura */
.quiz-capture-card { border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
.quiz-capture-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 600; color: var(--text-heading); margin: 0 0 1.1rem; line-height: 1.35; }
.quiz-capture { display: flex; flex-direction: column; gap: 1rem; max-width: 460px; }
.quiz-field { display: flex; flex-direction: column; gap: 0.4rem; }
.quiz-label { font-size: 0.8125rem; font-weight: 600; color: var(--text-heading); }
.quiz-input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.quiz-input:focus { border-color: var(--primary); }
.quiz-phone { display: flex; align-items: center; }
.quiz-phone .PhoneInputCountry { display: none; }
.quiz-phone input { width: 100%; padding: 0.7rem 0.9rem; border: 1px solid var(--color-border); border-radius: 10px; font-family: var(--font-ui); font-size: 1rem; color: var(--text-heading); background: var(--background, #FAFFFF); outline: none; }
.quiz-phone input:focus { border-color: var(--primary); }
.quiz-captcha { min-height: 78px; }
.quiz-msg-error { font-size: 0.8125rem; color: #9a6a00; background: rgba(247,200,0,0.12); border: 1px solid rgba(247,200,0,0.3); padding: 0.6rem 0.8rem; border-radius: 8px; margin: 0; }

/* Botões */
.quiz-btn { align-self: flex-start; margin-top: 0.5rem; padding: 0.85rem 1.75rem; border: none; border-radius: 9999px; background: var(--btn-primary-bg); color: var(--btn-primary-color); font-family: var(--font-ui); font-size: 0.9375rem; font-weight: 600; cursor: pointer; transition: background .2s, transform .2s; }
.quiz-btn:hover:not(:disabled) { background: var(--btn-primary-hover-bg); transform: translateY(-1px); }
.quiz-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.quiz-micro { font-size: 0.75rem; color: var(--text-secondary); }
.quiz-restart { align-self: flex-start; margin-top: 1.5rem; background: none; border: none; color: var(--text-secondary); font-family: var(--font-ui); font-size: 0.8125rem; text-decoration: underline; text-underline-offset: 3px; cursor: pointer; padding: 0; }
.quiz-restart:hover { color: var(--primary); }

/* Handoff */
.quiz-handoff { border-top: 1px solid var(--color-border); padding-top: 1.5rem; }
.quiz-handoff strong { display: block; font-family: var(--font-display); font-size: 1.35rem; color: var(--primary); margin-bottom: 0.5rem; }
.quiz-handoff p { font-size: 1rem; line-height: 1.55; color: var(--text-primary); margin: 0; }

.quiz-disclaimer { font-size: 0.6875rem; color: var(--text-secondary); line-height: 1.5; opacity: 0.8; text-align: center; margin: 0; }

@media (max-width: 720px) {
  .quiz-screen { padding: 1.4rem; }
  .quiz-intro-title { font-size: 1.5rem; }
  .quiz-prompt { font-size: 1.25rem; }
  .quiz-result-pain { font-size: 1.6rem; }
  .quiz-result-echo { font-size: 1.0625rem; }
}
`;
