import { SITE_CONFIG } from "../config/site.config";

export interface FaqItem {
  question: string;
  answer: string;
}

interface BreadcrumbItem {
  name: string;
  path: string;
}

interface ArticleSchemaInput {
  title: string;
  description: string;
  path: string;
  publishedAt: Date | string;
  updatedAt?: Date | string;
  image?: string;
}

const siteUrl = SITE_CONFIG.url;

function absoluteUrl(path: string) {
  return new URL(path, siteUrl).toString();
}

function isoDate(value: Date | string) {
  return new Date(value).toISOString();
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_CONFIG.name,
    url: siteUrl,
    logo: absoluteUrl(SITE_CONFIG.logos.favicon),
    email: SITE_CONFIG.contact.email,
    telephone: SITE_CONFIG.contact.phone,
    sameAs: [
      SITE_CONFIG.socials.instagram,
      SITE_CONFIG.socials.linkedin,
    ].filter(Boolean),
    contactPoint: {
      "@type": "ContactPoint",
      telephone: SITE_CONFIG.contact.phone,
      contactType: "customer support",
      areaServed: "BR",
      availableLanguage: ["Portuguese"],
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: siteUrl,
    inLanguage: SITE_CONFIG.defaultLocale,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
  };
}

export function faqPageSchema(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function articleSchema(input: ArticleSchemaInput) {
  const image = input.image ?? SITE_CONFIG.seo.ogImage;

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    image: absoluteUrl(image),
    inLanguage: SITE_CONFIG.defaultLocale,
    datePublished: isoDate(input.publishedAt),
    dateModified: isoDate(input.updatedAt ?? input.publishedAt),
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(SITE_CONFIG.logos.favicon),
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(input.path),
    },
  };
}

interface WebApplicationInput {
  name: string;
  description: string;
  path: string;
  image?: string;
}

// Ferramenta interativa (calculadora). SEM `offers`/`price`/`priceRange`
// — a página pública nunca publica a oferta (briefing §5; oferta-travada Regra de Ferro).
export function webApplicationSchema(input: WebApplicationInput) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.path),
    applicationCategory: "HealthApplication",
    operatingSystem: "Web",
    inLanguage: SITE_CONFIG.defaultLocale,
    isAccessibleForFree: true,
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: siteUrl,
    },
    ...(input.image ? { image: absoluteUrl(input.image) } : {}),
  };
}

interface PersonAuthorInput {
  name: string;
  /** registro profissional, ex.: "CRP 05/12345" */
  crp: string;
  url?: string;
}

// Autor com CRP = sinal E-E-A-T (briefing §5). Opcional: só emitir quando
// houver um(a) profissional atribuível de verdade — nunca fabricar registro.
export function personAuthorSchema(input: PersonAuthorInput) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: input.name,
    ...(input.url ? { url: input.url } : {}),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Registro Profissional",
      name: input.crp,
      recognizedBy: {
        "@type": "Organization",
        name: "Conselho Federal de Psicologia (CFP)",
      },
    },
    worksFor: { "@type": "Organization", name: SITE_CONFIG.name, url: siteUrl },
  };
}
