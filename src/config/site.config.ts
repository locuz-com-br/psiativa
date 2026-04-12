// ─────────────────────────────────────────────
// Landing Page Template — Site Configuration
// ─────────────────────────────────────────────
// Design System: PsiAtiva (teal/gold palette, Barlow font)
// This is the SINGLE file you need to edit to customize the entire template.
// Fill in your client's brand, colors, contact info, and the site will
// automatically adapt everywhere: meta tags, navbar, footer, forms, etc.

export const SITE_CONFIG = {
  // ── Brand ──────────────────────────────────
  name: "PsiAtiva",
  tagline: {
    pt: "Inovação que transforma resultados.",
    en: "Innovation that transforms results.",
  },
  description: {
    pt: "Plataforma inteligente para transformar a experiência do seu cliente.",
    en: "Intelligent platform to transform your customer experience.",
  },
  url: "https://your-domain.com",
  defaultLocale: "pt-BR" as const, // "pt-BR" | "en"

  // ── Colors ─────────────────────────────────
  // PsiAtiva Design System palette
  colors: {
    primary: "#385664",    // Teal escuro principal
    accent: "#DEDA93",     // Dourado/Mostarda
    highlight: "#EF853C",  // Detalhes em laranja
  },

  // ── Typography ─────────────────────────────
  // Barlow (Google Fonts) is the primary and only font family.
  fonts: {
    display: "'Barlow', sans-serif",
    subtitle: "'Barlow', sans-serif",
    body: "'Barlow', sans-serif",
  },

  // ── Contact ────────────────────────────────
  contact: {
    email: "hello@your-domain.com",
    phone: "+1 (555) 000-0000",
    whatsappNumber: "15550000000", // Raw international number (no +, no spaces)
    meetingUrl: "https://cal.com/your-name/30min",
    hours: {
      pt: "Seg–Sex, 9h às 18h",
      en: "Mon–Fri, 9am to 6pm",
    },
  },

  // ── Social Links ───────────────────────────
  // Set to empty string "" to hide the icon in the footer.
  socials: {
    whatsapp: "", // Auto-generated from whatsappNumber if empty
    instagram: "https://instagram.com/your-handle",
    linkedin: "https://linkedin.com/company/your-company",
    facebook: "",
    tiktok: "",
    youtube: "",
    twitter: "",
  },

  // ── Logos ───────────────────────────────────
  // Paths relative to /public. Replace with your client's logo files.
  logos: {
    navbarLight: "/images/logo/logo-light.svg",   // White logo for dark hero bg
    navbarDark: "/images/logo/logo-dark.svg",      // Dark logo (for future dark theme)
    footerLight: "/images/logo/logo-footer-light.svg",
    footerDark: "/images/logo/logo-footer-dark.svg",
    favicon: "/images/logo/logo-dark.svg",
  },

  // ── Hero Background ────────────────────────
  // The hero section uses a full-bleed dark teal background image.
  hero: {
    backgroundImage: "https://images.unsplash.com/photo-placeholder-hero-bg",
    typewriterWords: ["automatizado", "inteligente", "personalizado", "eficiente"],
  },

  // ── Section Toggles ────────────────────────
  // Set to `false` to completely hide a section from the landing page.
  sections: {
    hero: true,
    partners: true,         // was: logoBar
    about: true,            // was: whyUs
    features: true,         // was: services
    testimonials: true,
    functionalities: true,  // was: process
    integrations: true,     // NEW
    ctaFinal: true,         // was: cta
    cases: true,            // was: results
    contact: false,         // Disabled by default (available for opt-in)
    whatsappFab: true,      // NEW: Floating WhatsApp button
  },

  // ── Analytics & Integrations ───────────────
  // Leave empty strings "" to disable.
  analytics: {
    web3formsKey: "",                                   // Web3Forms access key for contact form
    hcaptchaSiteKey: "50b2fe65-b00b-4b9e-ad62-3ba471098be2", // hCaptcha site key
    googleAnalyticsId: "",                              // e.g. "G-XXXXXXXXXX"
    clarityId: "",                                      // Microsoft Clarity ID
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
  || `https://wa.me/${SITE_CONFIG.contact.whatsappNumber}`;
