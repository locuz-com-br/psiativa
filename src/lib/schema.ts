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
