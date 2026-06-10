import type { RefObject } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import type { ContactStepConfig } from "../../../lib/forms";

interface ContactStepProps {
  config: ContactStepConfig;
  name: string;
  onName: (s: string) => void;
  email: string;
  onEmail: (s: string) => void;
  phone: string | undefined;
  onPhone: (s: string | undefined) => void;
  captchaKey: string;
  captchaRef: RefObject<HCaptcha | null>;
  onCaptcha: (t: string | null) => void;
  status: string;
  onSubmit: (e: React.FormEvent) => void;
}

// Passo final: captura. Espelha o bloco de captura do /quiz (nome + telefone
// E.164 + hCaptcha), agora dirigido pela config (nome/email/telefone/captcha).
export default function ContactStep(p: ContactStepProps) {
  const c = p.config;
  const collectName = c.collectName ?? true;
  const collectPhone = c.collectPhone ?? true;
  const requireCaptcha = c.requireCaptcha ?? true;

  return (
    <div className="nf-capture" data-clarity-mask="true">
      {c.eyebrow && <span className="nf-eyebrow">{c.eyebrow}</span>}
      {c.title && <p className="nf-capture-title">{c.title}</p>}

      <form className="nf-form" onSubmit={p.onSubmit}>
        {collectName && (
          <div className="nf-field">
            <label className="nf-label" htmlFor="nf-name">
              {c.nameLabel ?? "Seu nome"}
            </label>
            <input
              id="nf-name"
              className="nf-input"
              type="text"
              autoComplete="name"
              value={p.name}
              placeholder={c.namePlaceholder}
              onChange={(e) => p.onName(e.currentTarget.value)}
            />
          </div>
        )}

        {c.collectEmail && (
          <div className="nf-field">
            <label className="nf-label" htmlFor="nf-email">
              {c.emailLabel ?? "Seu e-mail"}
            </label>
            <input
              id="nf-email"
              className="nf-input"
              type="email"
              autoComplete="email"
              value={p.email}
              placeholder={c.emailPlaceholder}
              onChange={(e) => p.onEmail(e.currentTarget.value)}
            />
          </div>
        )}

        {collectPhone && (
          <div className="nf-field">
            <label className="nf-label" htmlFor="nf-phone">
              {c.phoneLabel ?? "Seu WhatsApp"}
            </label>
            <PhoneInput
              id="nf-phone"
              international
              defaultCountry="BR"
              value={p.phone}
              onChange={p.onPhone}
              placeholder={c.phonePlaceholder}
              className="nf-phone"
            />
          </div>
        )}

        {requireCaptcha && p.captchaKey && (
          <div className="nf-captcha">
            <HCaptcha
              ref={p.captchaRef}
              sitekey={p.captchaKey}
              onVerify={(t) => p.onCaptcha(t)}
              onExpire={() => p.onCaptcha(null)}
            />
          </div>
        )}

        {p.status === "phone_required" && (
          <p className="nf-error">{c.phoneRequired ?? "Informe um número válido."}</p>
        )}
        {p.status === "captcha_required" && (
          <p className="nf-error">{c.captchaRequired ?? "Confirme que você não é um robô."}</p>
        )}
        {p.status === "error" && (
          <p className="nf-error">{c.error ?? "Algo deu errado. Tente novamente."}</p>
        )}

        <button type="submit" className="nf-btn" disabled={p.status === "sending"}>
          {p.status === "sending" ? (c.sending ?? "Enviando...") : (c.submit ?? "Enviar")}
        </button>
        {c.micro && <span className="nf-micro">{c.micro}</span>}
      </form>
    </div>
  );
}
