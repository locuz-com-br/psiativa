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
    cases: true,
    contact: true,
    faq: true,
    whatsappFab: true,
  },

  // ── Analytics & Integrations ───────────────
  analytics: {
    web3formsKey: "",
    // hCaptcha SITE key (public — safe in the bundle). The matching SECRET lives
    // server-side in n8n (HCAPTCHA_SECRET), never here. They must come from the
    // SAME hCaptcha site or siteverify returns `sitekey-secret-mismatch`.
    // Fallback is hCaptcha's test sitekey (only passes against the test secret) —
    // production builds MUST set PUBLIC_HCAPTCHA_SITE_KEY.
    hcaptchaSiteKey:
      import.meta.env.PUBLIC_HCAPTCHA_SITE_KEY || "",
    googleAnalyticsId:
      import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID ||
      import.meta.env.PUBLIC_GA_ID || "",
    clarityId: import.meta.env.PUBLIC_CLARITY_ID || "",
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
    terms: "/termos",
    privacy: "/privacidade",
    cookies: "/cookies",
  },
} as const;

// ── Derived values (do not edit) ─────────────
export const WHATSAPP_LINK = SITE_CONFIG.socials.whatsapp
  || `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}?text=${encodeURIComponent("Olá! Vim pelo site da PsiAtiva e gostaria de agendar o diagnóstico gratuito da minha clínica.")}`;
