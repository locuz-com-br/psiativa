// ─────────────────────────────────────────────
// Centralized Link Constants
// ─────────────────────────────────────────────
// All links are derived from site.config.ts.
// Import and use these instead of hard-coding hrefs in components.

import { SITE_CONFIG, WHATSAPP_LINK } from '../config/site.config';

// ── Pages ───────���────────────────────────────
export const PAGES = {
  home: "/",
} as const;

// ── Section Anchors ──────────────���───────────
export const SECTIONS = {
  inicio: "/#inicio",
  sobre: "/#sobre",
  funcionalidades: "/#funcionalidades",
  depoimentos: "/#depoimentos",
  resultados: "/#resultados",
  faq: "/#faq",
  cta: "/#cta",
  contato: "/#contato",
} as const;

// ── Social Media ─────────────────────────────
export const SOCIALS = {
  whatsapp: WHATSAPP_LINK,
  linkedin: SITE_CONFIG.socials.linkedin,
  instagram: SITE_CONFIG.socials.instagram,
  facebook: SITE_CONFIG.socials.facebook,
  tiktok: SITE_CONFIG.socials.tiktok,
  youtube: SITE_CONFIG.socials.youtube,
  twitter: SITE_CONFIG.socials.twitter,
} as const;

// ── Contact ──────────────────────────────────
export const CONTACT = {
  email: SITE_CONFIG.contact.email,
  emailHref: `mailto:${SITE_CONFIG.contact.email}`,
  phone: SITE_CONFIG.contact.phone,
  phoneHref: WHATSAPP_LINK,
  meet: SITE_CONFIG.contact.meetingUrl,
} as const;

// ── Legal / Misc ─────────────────────────────
export const LEGAL = {
  blog: SITE_CONFIG.legal.blog,
  terms: SITE_CONFIG.legal.terms,
  privacy: SITE_CONFIG.legal.privacy,
  cookies: SITE_CONFIG.legal.cookies,
} as const;

// ── Aggregated export ────────────────────────
const LINKS = {
  pages: PAGES,
  sections: SECTIONS,
  socials: SOCIALS,
  contact: CONTACT,
  legal: LEGAL,
} as const;

export default LINKS;
