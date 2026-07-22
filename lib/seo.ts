import type { Metadata } from "next";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";

export const SITE_NAME = "Presusimple";

/** Served by app/opengraph-image.tsx */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

const EN_KEYWORDS = [
  "budgeting app",
  "personal finance",
  "zero-based budget",
  "expense tracker",
  "monthly budget planner",
  "PWA finance app",
  "Presusimple",
];

const ES_KEYWORDS = [
  "app de presupuesto",
  "finanzas personales",
  "presupuesto base cero",
  "control de gastos",
  "planificador de presupuesto mensual",
  "Presusimple",
];

const EN_LANDING = {
  title: "Presusimple – Budgeting Made Easy",
  description:
    "Zero-based budgeting app that tracks every expense. Plan monthly budgets, visualize spending, and take control of your finances with Presusimple.",
};

const ES_LANDING = {
  title: "Presusimple – Presupuestos Fáciles",
  description:
    "App de presupuesto base cero que rastrea cada gasto. Planifica presupuestos mensuales, visualiza tus finanzas y toma el control con Presusimple.",
};

function buildOpenGraph(
  title: string,
  description: string,
  url: string,
  locale: "en" | "es"
): Metadata["openGraph"] {
  return {
    title,
    description,
    url,
    siteName: SITE_NAME,
    locale: locale === "es" ? "es_ES" : "en_US",
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: title,
      },
    ],
  };
}

function buildTwitter(title: string, description: string): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [DEFAULT_OG_IMAGE],
  };
}

export function getEnglishLandingMetadata(): Metadata {
  return {
    title: EN_LANDING.title,
    description: EN_LANDING.description,
    keywords: EN_KEYWORDS,
    alternates: {
      canonical: PRODUCTION_APP_URL,
      languages: {
        en: PRODUCTION_APP_URL,
        es: `${PRODUCTION_APP_URL}/es`,
        "x-default": PRODUCTION_APP_URL,
      },
    },
    openGraph: buildOpenGraph(
      EN_LANDING.title,
      EN_LANDING.description,
      PRODUCTION_APP_URL,
      "en"
    ),
    twitter: buildTwitter(EN_LANDING.title, EN_LANDING.description),
  };
}

export function getSpanishLandingMetadata(): Metadata {
  return {
    title: ES_LANDING.title,
    description: ES_LANDING.description,
    keywords: ES_KEYWORDS,
    alternates: {
      canonical: `${PRODUCTION_APP_URL}/es`,
      languages: {
        en: PRODUCTION_APP_URL,
        es: `${PRODUCTION_APP_URL}/es`,
        "x-default": PRODUCTION_APP_URL,
      },
    },
    openGraph: buildOpenGraph(
      ES_LANDING.title,
      ES_LANDING.description,
      `${PRODUCTION_APP_URL}/es`,
      "es"
    ),
    twitter: buildTwitter(ES_LANDING.title, ES_LANDING.description),
  };
}

export function getBlogIndexMetadata(locale: "en" | "es"): Metadata {
  const isSpanish = locale === "es";
  const title = isSpanish
    ? "Blog | Presusimple – Consejos de Finanzas Personales"
    : "Blog | Presusimple – Personal Finance Tips";
  const description = isSpanish
    ? "Artículos sobre presupuestos base cero, control de gastos y finanzas personales."
    : "Articles on zero-based budgeting, expense tracking, and personal finance.";
  const url = isSpanish ? `${PRODUCTION_APP_URL}/es/blog` : `${PRODUCTION_APP_URL}/blog`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${PRODUCTION_APP_URL}/blog`,
        es: `${PRODUCTION_APP_URL}/es/blog`,
        "x-default": `${PRODUCTION_APP_URL}/blog`,
      },
    },
    openGraph: buildOpenGraph(title, description, url, locale),
    twitter: buildTwitter(title, description),
  };
}

export function getBlogPostMetadata(
  locale: "en" | "es",
  post: {
    title: string;
    description: string;
    slug: string;
    date: string;
    tags?: string[];
    translationSlug?: string;
  }
): Metadata {
  const basePath = locale === "es" ? "/es/blog" : "/blog";
  const url = `${PRODUCTION_APP_URL}${basePath}/${post.slug}`;

  // Build cross-language alternates if a translation slug is provided
  const enSlug = locale === "en" ? post.slug : post.translationSlug;
  const esSlug = locale === "es" ? post.slug : post.translationSlug;
  const languages: Record<string, string> = {};
  if (enSlug) {
    languages.en = `${PRODUCTION_APP_URL}/blog/${enSlug}`;
    languages["x-default"] = `${PRODUCTION_APP_URL}/blog/${enSlug}`;
  }
  if (esSlug) {
    languages.es = `${PRODUCTION_APP_URL}/es/blog/${esSlug}`;
  }

  return {
    title: `${post.title} | Presusimple`,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: url,
      ...(Object.keys(languages).length > 0 ? { languages } : {}),
    },
    openGraph: {
      ...buildOpenGraph(`${post.title} | Presusimple`, post.description, url, locale),
      type: "article",
      publishedTime: post.date,
    },
    twitter: buildTwitter(`${post.title} | Presusimple`, post.description),
  };
}

/** Metadata for the Privacy Policy page with cross-language alternates. */
export function getPrivacyMetadata(locale: "en" | "es"): Metadata {
  const isSpanish = locale === "es";
  const title = isSpanish ? "Política de Privacidad | Presusimple" : "Privacy Policy | Presusimple";
  const description = isSpanish
    ? "Cómo Presusimple recopila, usa y protege tus datos personales."
    : "How Presusimple collects, uses, and protects your personal data.";
  const url = isSpanish ? `${PRODUCTION_APP_URL}/es/privacy` : `${PRODUCTION_APP_URL}/privacy`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${PRODUCTION_APP_URL}/privacy`,
        es: `${PRODUCTION_APP_URL}/es/privacy`,
        "x-default": `${PRODUCTION_APP_URL}/privacy`,
      },
    },
  };
}

/** Metadata for the Terms of Service page with cross-language alternates. */
export function getTermsMetadata(locale: "en" | "es"): Metadata {
  const isSpanish = locale === "es";
  const title = isSpanish ? "Términos de Servicio | Presusimple" : "Terms of Service | Presusimple";
  const description = isSpanish
    ? "Términos de Servicio para usar Presusimple."
    : "Terms of Service for using Presusimple personal finance software.";
  const url = isSpanish ? `${PRODUCTION_APP_URL}/es/terms` : `${PRODUCTION_APP_URL}/terms`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        en: `${PRODUCTION_APP_URL}/terms`,
        es: `${PRODUCTION_APP_URL}/es/terms`,
        "x-default": `${PRODUCTION_APP_URL}/terms`,
      },
    },
  };
}

export function getLandingJsonLd(locale: "en" | "es") {
  const isSpanish = locale === "es";
  const url = isSpanish ? `${PRODUCTION_APP_URL}/es` : PRODUCTION_APP_URL;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: PRODUCTION_APP_URL,
        logo: `${PRODUCTION_APP_URL}/icons/icon-512x512.png`,
        sameAs: [PRODUCTION_APP_URL],
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        applicationCategory: "FinanceApplication",
        operatingSystem: "Web, iOS, Android",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        description: isSpanish ? ES_LANDING.description : EN_LANDING.description,
        url,
      },
    ],
  };
}

export function getBlogPostJsonLd(
  locale: "en" | "es",
  post: {
    title: string;
    description: string;
    slug: string;
    date: string;
    author: string;
    dateModified?: string;
  }
) {
  const basePath = locale === "es" ? "/es/blog" : "/blog";
  const url = `${PRODUCTION_APP_URL}${basePath}/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${PRODUCTION_APP_URL}/icons/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
  };
}

export const rootSeoDefaults: Partial<Metadata> = {
  metadataBase: new URL(PRODUCTION_APP_URL),
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} – Personal Finance Management`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
};
