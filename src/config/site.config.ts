// ─────────────────────────────────────────────
// PsiAtiva — Site Configuration
// ─────────────────────────────────────────────
// Design System: PsiAtiva (Teal/Sage Green palette, New York + Lora fonts)
// This is the SINGLE file you need to edit to customize the entire template.

export const SITE_CONFIG = {
  // ── Brand ──────────────────────────────────
  name: "PsiAtiva",
  tagline: {
    pt: "Ativa sua clínica. Preserva sua essência.",
    en: "Activate your clinic. Preserve your essence.",
  },
  description: {
    pt: "Captação ética e previsível para clínicas de psicologia. Agenda previsível, menos faltas e um processo estruturado que respeita sua identidade clínica.",
    en: "Ethical and predictable patient acquisition for psychology clinics. Predictable schedules, fewer no-shows, and a structured process that respects your clinical identity.",
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
      pt: "Seg–Sex, 9h às 18h",
      en: "Mon–Fri, 9am to 6pm",
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
    cases: true,
    contact: true,
    faq: true,
    whatsappFab: true,
  },

  // ── Analytics & Integrations ───────────────
  analytics: {
    web3formsKey: "",
    hcaptchaSiteKey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2",
    googleAnalyticsId: "",
    clarityId: "",
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
