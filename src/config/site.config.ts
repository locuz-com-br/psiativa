// ─────────────────────────────────────────────
// PsiAtiva — Site Configuration
// ─────────────────────────────────────────────
// Design System: PsiAtiva (Teal/Sage Green palette, New York + Lora fonts)
// This is the SINGLE file you need to edit to customize the entire template.

export const SITE_CONFIG = {
  // ── Brand ──────────────────────────────────
  name: "PsiAtiva",
  tagline: {
    pt: "Processo de captação para clínicas de psicologia.",
    en: "Patient acquisition process for psychology clinics.",
  },
  description: {
    pt: "Processo de captação para clínicas de psicologia, do primeiro contato à sessão confirmada. Agenda previsível, menos faltas e um processo estruturado que respeita sua identidade clínica.",
    en: "Patient acquisition process for psychology clinics, from initial contact to confirmed session. Predictable schedules, fewer no-shows, and a structured process that respects your clinical identity.",
  },
  url: "https://psiativa.com.br",
  defaultLocale: "pt-BR" as const,

  // ── Colors ─────────────────────────────────
  colors: {
    primary: "#1A4B51",
    accent: "#7EAE89",
    highlight: "#00B1C8",
  },

  // ── Typography ─────────────────────────────
  fonts: {
    display: "'New York', Georgia, serif",
    subtitle: "'Lora', Georgia, serif",
    body: "'Lora', Georgia, serif",
  },

  // ── Contact ────────────────────────────────
  contact: {
    email: "contato@psiativa.com.br",
    phone: "+55 (21) 97990-7947",
    whatsappNumber: "5521979907947",
    meetingUrl: "",
    hours: {
      pt: "Seg a Sex, das 9h às 18h",
      en: "Mon to Fri, 9am to 6pm",
    },
  },

  // ── Social Links ───────────────────────────
  socials: {
    whatsapp: "",
    instagram: "https://instagram.com/psiativa.com.br",
    linkedin: "https://linkedin.com/company/psiativa-com-br",
    facebook: "",
    tiktok: "",
    youtube: "",
    twitter: "",
  },

  // ── Logos ───────────────────────────────────
  logos: {
    navbarLight: "/images/logo/navbar-full-dark.svg",
    navbarDark: "/images/logo/navbar-full-dark.svg",
    footerLight: "/images/logo/navbar-full-dark.svg",
    footerDark: "/images/logo/navbar-full-dark.svg",
    favicon: "/images/logo/psiativa-profile.svg",
  },

  // ── SEO / Social Preview ────────────────────
  seo: {
    ogImage: "/images/logo/psiativa-full.png",
  },

  // ── Hero Background ────────────────────────
  hero: {
    backgroundImage: "",
    typewriterWords: ["previsível", "estruturado", "ético", "consistente"],
  },

  // ── Section Toggles ────────────────────────
  sections: {
    hero: true,
    partners: false,
    about: true,
    features: true,
    testimonials: true,
    functionalities: true,
    integrations: false,
    ctaFinal: true,
    calcCta: true,
    quizCta: true,
    auditSiteCta: true,
    cases: true,
    contact: true,
    faq: true,
    whatsappFab: true,
  },

  // ── Analytics & Integrations ───────────────
  analytics: {
    web3formsKey: "",
    // hCaptcha SITE keys (public — safe in the bundle). The matching SECRET lives
    // server-side in n8n (HCAPTCHA_SECRET), never here.
    //
    // ⛔ hCaptcha issues ONE secret per ACCOUNT, not one per site (established
    // 2026-08-23; the older "same site" comment here was wrong and caused a
    // sitekey to be provisioned under a secret's name). Both keys below verify
    // against the same HCAPTCHA_SECRET. A key from a DIFFERENT account is what
    // makes siteverify return `sitekey-secret-mismatch`.
    //
    // Empty is a real state, not a bug: the islands guard on
    // `HCAPTCHA_KEY && !captchaToken`, so an unset key SKIPS the widget rather
    // than blocking the form. Production builds MUST set both.

    /** /quiz + /calculadora. */
    hcaptchaSiteKey:
      import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY || "",
    /** /analise-de-site-para-psicologo — dedicated key so the Raio-X can be blocked or rotated
     *  without taking the quiz and calculadora down with it. */
    hcaptchaSiteKeyRaiox:
      import.meta.env.PUBLIC_HCAPTCHA_SITEKEY_RAIOX || "",
    googleAnalyticsId:
      import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID ||
      import.meta.env.PUBLIC_GA_ID || "",
    gtmId:
      import.meta.env.PUBLIC_GTM_ID || "GTM-TFTX34PC",
    clarityId: import.meta.env.PUBLIC_CLARITY_ID || "",
    // Consent-free WhatsApp click counter (n8n webhook) — see ClickBeacon.astro.
    // Carries NO personal data, so it is deliberately NOT gated on cookie consent;
    // that is the only way its count is comparable with server-side db_sales.sessions.
    // Empty = beacon renders nothing.
    beaconEndpoint: import.meta.env.PUBLIC_BEACON_ENDPOINT || "",
    beaconSiteId: import.meta.env.PUBLIC_BEACON_SITE_ID || "psiativa-lp",
    // Meta Pixel / Dataset IDs (public by design — they ship in the bundle).
    // Supports several datasets because PsiAtiva runs more than one ad account.
    // NOTE: one shared pixel assigned to both ad accounts is the better setup —
    // two pixels split attribution, and each dataset only ever sees part of the
    // traffic. Kept multi-capable because the accounts may live in different
    // Business Managers, where sharing is not possible.
    // Accepts PUBLIC_META_PIXEL_ID plus PUBLIC_META_PIXEL_ID_1..._5; blanks drop out.
    metaPixelIds: [
      import.meta.env.PUBLIC_META_PIXEL_ID,
      import.meta.env.PUBLIC_META_PIXEL_ID_1,
      import.meta.env.PUBLIC_META_PIXEL_ID_2,
      import.meta.env.PUBLIC_META_PIXEL_ID_3,
      import.meta.env.PUBLIC_META_PIXEL_ID_4,
      import.meta.env.PUBLIC_META_PIXEL_ID_5,
    ]
      .map((id) => String(id || "").trim())
      .filter((id) => id.length > 0)
      .join(","),
    // n8n webhook that forwards conversions to the Graph API. The CAPI ACCESS TOKEN
    // lives in n8n's own env and must NEVER appear here or in any PUBLIC_ variable.
    metaCapiEndpoint: import.meta.env.PUBLIC_META_CAPI_ENDPOINT || "",
  },

  // Formbricks surveys
  formbricks: {
    appUrl: import.meta.env.PUBLIC_FORMBRICKS_APP_URL || "https://app.formbricks.com",
    workspaceId: import.meta.env.PUBLIC_FORMBRICKS_WORKSPACE_ID || "",
    environmentId: import.meta.env.PUBLIC_FORMBRICKS_ENV_ID || "",
    linkSurveyId:
      import.meta.env.PUBLIC_FORMBRICKS_LINK_SURVEY_ID ||
      "xnnk82ql3hkany9kmlkp47oi",
    appSurveyTrigger: "view_psi_survey",
  },

  // ── Legal Page Slugs ───────────────────────
  legal: {
    blog: "/blog",
    podcast: "/podcast",
    terms: "/termos",
    privacy: "/privacidade",
    cookies: "/cookies",
  },
} as const;

// ── Derived values (do not edit) ─────────────
export const WHATSAPP_LINK = SITE_CONFIG.socials.whatsapp
  || `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent("Olá! Vim pelo site da PsiAtiva e gostaria de agendar o diagnóstico gratuito da minha clínica.")}`;
