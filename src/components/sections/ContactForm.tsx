'use client';

import { useState, useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { afterPress, sanitizeEmail, validEmailStrict, validWhatsapp } from '../../lib/fields';
import 'react-phone-number-input/style.css';
import { trackEvent } from '../../lib/analytics';

export default function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'captcha_required'>('idle');
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [phoneValue, setPhoneValue] = useState<string | undefined>('');
  const [phoneCountry, setPhoneCountry] = useState<any>('BR');
  // Fix 6.1: field-level errors (e-mail must be real; phone optional, but if filled it must be a valid
  // WhatsApp number: a real BR mobile/landline, or a valid number for the chosen country).
  const [fieldErr, setFieldErr] = useState<{ email?: boolean; phone?: boolean }>({});
  const [fieldOk, setFieldOk] = useState<{ email?: boolean; phone?: boolean }>({});
  const stateStyle = (k: 'email' | 'phone') =>
    fieldErr[k] ? fieldErrorBorder : fieldOk[k] ? fieldOkBorder : {};
  const phoneOk = (v: string | undefined) =>
    !v || (v.startsWith('+55') ? !!validWhatsapp(v.slice(3)) : isValidPhoneNumber(v));
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    // Escuta mudanças de idioma no html tag para trocar a bandeira do telefone
    if (typeof document !== 'undefined') {
      const updateCountry = () => {
        const isEnglish = document.documentElement.lang.startsWith('en');
        setPhoneCountry(isEnglish ? 'US' : 'BR');
      };
      
      updateCountry();

      const langObserver = new MutationObserver((mutations) => {
        if (mutations.some((m) => m.attributeName === 'lang')) {
          updateCountry();
        }
      });

      langObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
      return () => langObserver.disconnect();
    }
  }, []);

  useEffect(() => {
    // Re-apply translations if the component changes state (e.g., shows error or success)
    if (typeof window !== 'undefined' && (window as any).__siteI18n) {
      const i18n = (window as any).__siteI18n;
      i18n.applyTranslations(i18n.detectDefaultLang());
    }
  }, [status]);

  useEffect(() => {
    // Dynamically observe and add loading="lazy" to the hCaptcha iframe that gets injected automatically
    // This fixes the 'Unoptimized loading attribute / IFRAME below the fold' SEO warning.
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeName === 'IFRAME') {
            const iframe = node as HTMLIFrameElement;
            if (iframe.src.includes('hcaptcha.com')) {
              iframe.setAttribute('loading', 'lazy');
              // Optionally set a title for accessibility warnings as well
              if (!iframe.getAttribute('title')) {
                iframe.setAttribute('title', 'hCaptcha security verification');
              }
            }
          }
        });
      });
    });

    if (typeof window !== 'undefined') {
      observer.observe(document.body, { childList: true, subtree: true });
      // Clean up the observer on unmount
      return () => observer.disconnect();
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const emailValue = String(new FormData(e.currentTarget).get('email') || '');
    const errs = { email: !validEmailStrict(emailValue), phone: !phoneOk(phoneValue) };
    setFieldErr(errs);
    if (errs.email || errs.phone) return;

    if (!captchaToken) {
      setStatus('captcha_required');
      return;
    }

    setStatus('sending');

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    // O componente HCaptcha injeta um campo oculto "g-recaptcha-response" por compatibilidade.
    // O Web3Forms detecta isso e acha que você está tentando usar o Recaptcha do Google (plano Pro).
    // Precisamos deledar esse campo para que ele leia apenas o h-captcha-response gratuito.
    formData.delete('g-recaptcha-response');
    
    // Pega a chave do arquivo .env
    const accessKey = import.meta.env.PUBLIC_WEB3FORMS_ACCESS_KEY || '';
    formData.append('access_key', accessKey);
    formData.set('h-captcha-response', captchaToken);
    formData.set('phone', phoneValue || '');

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: json
      });

      const data = await response.json();

      if (data.success) {
        setStatus('sent');
        trackEvent('generate_lead', {
          form_name: 'contact',
          page_path: window.location.pathname,
        });
        form.reset();
        captchaRef.current?.resetCaptcha();
        setCaptchaToken(null);
      } else {
        console.error('Erro Web3Forms:', data);
        trackEvent('form_error', {
          form_name: 'contact',
          error_type: 'provider_error',
        });
        setStatus('error');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      trackEvent('form_error', {
        form_name: 'contact',
        error_type: 'network_error',
      });
      setStatus('error');
    }
  }

  return (
    <>
      <style>{`
        .tpl-phone-input {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .tpl-phone-input input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: var(--input-bg, transparent);
          border: 1px solid var(--input-border, #e2e8f0);
          border-radius: 0.75rem;
          color: var(--input-color, inherit);
          font-size: 0.9375rem;
          font-family: inherit;
          outline: none;
        }
        /*
        .tpl-phone-input .PhoneInputCountry {
          padding: 0.5rem;
          background: var(--input-bg, transparent);
          border: 1px solid var(--input-border, #e2e8f0);
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
        }
        */
        .tpl-phone-input .PhoneInputCountry {
          display: none;
        }
        .tpl-phone-input .PhoneInputCountrySelect {
          color: var(--input-color, inherit);
          background: var(--input-bg, transparent);
        }
      `}</style>
      <form
        onSubmit={handleSubmit}
        style={formStyles}
        data-clarity-mask="true"
      >
      <div style={rowStyles}>
        <div style={fieldStyles}>
          <label style={labelStyles} htmlFor="name" data-i18n="contact.form_name">Nome *</label>
          <input
            id="name"
            type="text"
            name="name"
            required
            placeholder="Seu nome completo"
            data-i18n-placeholder="contact.form_name_placeholder"
            style={inputStyles}
          />
        </div>
        <div style={fieldStyles}>
          <label style={labelStyles} htmlFor="email" data-i18n="contact.form_email">E-mail *</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="seu@email.com"
            data-i18n-placeholder="contact.form_email_placeholder"
            style={{ ...inputStyles, ...stateStyle('email') }}
            inputMode="email"
            maxLength={160}
            spellCheck={false}
            autoCapitalize="off"
            aria-invalid={fieldErr.email || undefined}
            onInput={(e) => {
              const el = e.currentTarget;
              const clean = sanitizeEmail(el.value);
              if (clean !== el.value) el.value = clean;
              const good = validEmailStrict(clean);
              setFieldOk((f) => ({ ...f, email: good }));
              if (good) setFieldErr((f) => ({ ...f, email: false }));
            }}
            onBlur={(e) => {
              // Read the value now: React clears currentTarget before a deferred updater runs.
              const v = e.currentTarget.value;
              afterPress(() => setFieldErr((f) => ({ ...f, email: !!v && !validEmailStrict(v) })));
            }}
          />
          {fieldErr.email && (
            <p style={tooltipStyles} role="alert" data-i18n="contact.form_email_invalid">Confira o e-mail.</p>
          )}
        </div>
      </div>

      <div style={rowStyles}>
        <div style={fieldStyles}>
          <label style={labelStyles} htmlFor="phone" data-i18n="contact.form_phone">Telefone</label>
          <PhoneInput
            id="phone"
            // National format: "21 99999-9999" reads as BR (+55), not as country code +21. The country select
            // still switches to an international number.
            defaultCountry={phoneCountry}
            value={phoneValue}
            onChange={(v) => {
              setPhoneValue(v);
              setFieldOk((f) => ({ ...f, phone: !!v && phoneOk(v) }));
              if (phoneOk(v)) setFieldErr((f) => ({ ...f, phone: false }));
            }}
            onBlur={() => afterPress(() => setFieldErr((f) => ({ ...f, phone: !phoneOk(phoneValue) })))}
            limitMaxLength
            placeholder="(11) 99999-9999"
            className="tpl-phone-input"
            // The border lives on the inner <input>; it reads --input-border.
            style={{ '--input-border': fieldErr.phone ? '#c0392b' : fieldOk.phone ? '#2e7d4f' : undefined } as React.CSSProperties}
          />
          {fieldErr.phone && (
            <p style={tooltipStyles} role="alert" data-i18n="contact.form_phone_invalid">
              Confira o número de WhatsApp, com DDD.
            </p>
          )}
        </div>
        <div style={fieldStyles}>
          <label style={labelStyles} htmlFor="company" data-i18n="contact.form_company">Nome da Clínica</label>
          <input
            id="company"
            type="text"
            name="company"
            placeholder="Nome da sua clínica ou consultório"
            data-i18n-placeholder="contact.form_company_placeholder"
            style={inputStyles}
          />
        </div>
      </div>

      <div style={fieldStyles}>
        <label style={labelStyles} htmlFor="message" data-i18n="contact.form_message">Mensagem *</label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          placeholder="Conte um pouco sobre o momento da sua clínica..."
          data-i18n-placeholder="contact.form_message_placeholder"
          style={{ ...inputStyles, resize: 'vertical' as const, minHeight: '120px' }}
        />
      </div>
      
      {/*
      <div style={{ display: 'flex', justifyContent: 'flex-start', margin: '0.5rem 0' }}>
        <HCaptcha
          ref={captchaRef}
          sitekey="50b2fe65-b00b-4b9e-ad62-3ba471098be2"
          onVerify={(token) => setCaptchaToken(token)}
          onExpire={() => setCaptchaToken(null)}
        />
      </div>
      */}
      
      {status === 'captcha_required' && (
        <p style={errorStyles} data-i18n="contact.form_captcha_required">
          Por favor, resolva o captcha de segurança antes de enviar.
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        style={{
          ...buttonStyles,
          opacity: status === 'sending' ? 0.7 : 1,
          cursor: status === 'sending' ? 'not-allowed' : 'pointer',
        }}
        data-i18n={status === 'sending' ? 'contact.form_sending' : 'contact.form_submit'}
      >
        {status === 'sending' ? 'Enviando...' : 'Enviar Mensagem →'}
      </button>

      {status === 'sent' && (
        <p style={successStyles} data-i18n="contact.form_success">
          Mensagem enviada! Retornaremos em até 24h.
        </p>
      )}
      {status === 'error' && (
        <p style={errorStyles} data-i18n="contact.form_error">
          Algo deu errado. Por favor, tente novamente.
        </p>
      )}
    </form>
    </>
  );
}

const formStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const rowStyles: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: '1.25rem',
};

const fieldStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.375rem',
};

const labelStyles: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: '#868C94',
  letterSpacing: '0.02em',
};

const inputStyles: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: '0.75rem',
  color: 'var(--input-color)',
  fontSize: '0.9375rem',
  fontFamily: 'var(--font-ui)',
  outline: 'none',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

const buttonStyles: React.CSSProperties = {
  padding: '0.875rem 2rem',
  background: 'var(--btn-primary-bg)',
  color: 'var(--btn-primary-color)',
  border: 'none',
  borderRadius: '9999px',
  fontSize: '0.9375rem',
  fontWeight: 600,
  fontFamily: 'var(--font-ui)',
  transition: 'all 0.3s ease',
  marginTop: '0.5rem',
};

const successStyles: React.CSSProperties = {
  color: '#7EAE89',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  background: 'rgba(126, 174, 137, 0.1)',
  border: '1px solid rgba(126, 174, 137, 0.2)',
};

// Fix 6.1: field states (error = red border + tooltip bubble under the field; ok = green border).
// Full `border` shorthand: inputStyles sets `border`, and mixing it with `borderColor` breaks React re-renders.
const fieldErrorBorder: React.CSSProperties = { border: '1px solid #c0392b', boxShadow: '0 0 0 3px rgba(192, 57, 43, 0.12)' };
const fieldOkBorder: React.CSSProperties = { border: '1px solid #2e7d4f' };
const tooltipStyles: React.CSSProperties = {
  alignSelf: 'flex-start',
  margin: '0.4rem 0 0',
  padding: '0.45rem 0.7rem',
  borderRadius: '8px',
  background: '#c0392b',
  color: '#fff',
  fontSize: '0.85rem',
  lineHeight: 1.4,
};

const errorStyles: React.CSSProperties = {
  color: '#F7C800',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '0.75rem 1rem',
  borderRadius: '0.75rem',
  background: 'rgba(247, 200, 0, 0.1)',
  border: '1px solid rgba(247, 200, 0, 0.2)',
};
