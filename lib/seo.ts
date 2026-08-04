import type { Metadata } from "next";
import { getBlogSeoEnrichment } from "@/lib/blog-seo-enrichment";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";

export const SITE_NAME = "Presusimple";

/** Served by app/opengraph-image.tsx */
export const DEFAULT_OG_IMAGE = "/opengraph-image";

const SOFTWARE_FEATURE_LIST_EN = [
  "Monthly online budget planner",
  "Daily expense tracking",
  "Zero-based budgeting",
  "Category limits",
  "PWA offline support",
] as const;

const SOFTWARE_FEATURE_LIST_ES = [
  "Presupuesto mensual online",
  "Control de gastos diarios",
  "Presupuesto base cero",
  "Categorías y límites",
  "PWA",
] as const;

const EN_KEYWORDS = [
  "budgeting app",
  "personal finance",
  "zero-based budget",
  "expense tracker",
  "tracking daily spending",
  "free online budget planner",
  "monthly budget planner",
  "PWA finance app",
  "Presusimple",
];

const ES_KEYWORDS = [
  "presupuesto online gratis",
  "app de presupuesto",
  "finanzas personales",
  "presupuesto base cero",
  "gastos diarios",
  "control de gastos",
  "planificador de presupuesto mensual",
  "Presusimple",
];

const EN_LANDING = {
  title: "Free Online Budget Planner | Presusimple",
  description:
    "Make a monthly budget online for free. Track expenses, set category limits, zero-based planning. Start your 30-day trial with Presusimple.",
};

const ES_LANDING = {
  title: "Presupuesto online gratis | Presusimple",
  description:
    "Crea tu presupuesto mensual online gratis. Control de gastos, categorías y base cero. Prueba Presusimple 30 días sin tarjeta.",
};

const EN_DEVELOPERS = {
  title: "Budget & Expense Tracker API | Presusimple Developers",
  description:
    "REST API for budgets, expenses, and categories. JWT auth, OpenAPI/Swagger docs, ready for mobile and integrations. Build with Presusimple.",
};

const ES_DEVELOPERS = {
  title: "API de presupuestos y gastos | Presusimple Developers",
  description:
    "API REST para presupuestos, gastos y categorías. Auth JWT, docs OpenAPI/Swagger, lista para móvil e integraciones. Construye con Presusimple.",
};

const EN_API_DOCS = {
  title: "Presusimple API Docs (OpenAPI / Swagger)",
  description:
    "Interactive OpenAPI reference for the Presusimple budgeting API. Authenticate with JWT, try endpoints, and integrate expense tracking.",
};

const ES_API_DOCS = {
  title: "Documentación API Presusimple (OpenAPI / Swagger)",
  description:
    "Referencia OpenAPI interactiva de la API de presupuestos de Presusimple. Autentica con JWT, prueba endpoints e integra el control de gastos.",
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

function softwareApplicationNode(locale: "en" | "es", url: string) {
  const isSpanish = locale === "es";
  return {
    "@type": "SoftwareApplication" as const,
    name: SITE_NAME,
    applicationCategory: "FinanceApplication",
    applicationSubCategory: "Budgeting",
    operatingSystem: "Web, iOS, Android",
    isAccessibleForFree: true,
    featureList: isSpanish
      ? [...SOFTWARE_FEATURE_LIST_ES]
      : [...SOFTWARE_FEATURE_LIST_EN],
    offers: {
      "@type": "Offer" as const,
      price: "0",
      priceCurrency: isSpanish ? "EUR" : "USD",
      description: isSpanish
        ? "Plan gratuito de prueba 30 días; luego Pro opcional"
        : "Free 30-day trial; Pro plan optional afterward",
    },
    description: isSpanish ? ES_LANDING.description : EN_LANDING.description,
    url,
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
      softwareApplicationNode(locale, url),
      {
        "@type": "WebApplication",
        name: SITE_NAME,
        browserRequirements: "Requires JavaScript",
        url,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: isSpanish ? "EUR" : "USD",
        },
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
  const enrichment = getBlogSeoEnrichment(locale, post.slug);
  const landingUrl = locale === "es" ? `${PRODUCTION_APP_URL}/es` : PRODUCTION_APP_URL;

  const blogPosting = {
    "@type": "BlogPosting" as const,
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    ...(post.dateModified ? { dateModified: post.dateModified } : {}),
    inLanguage: locale === "es" ? "es" : "en",
    author: {
      "@type": "Organization" as const,
      name: post.author,
    },
    publisher: {
      "@type": "Organization" as const,
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject" as const,
        url: `${PRODUCTION_APP_URL}/icons/icon-512x512.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage" as const,
      "@id": url,
    },
    url,
  };

  if (!enrichment) {
    return {
      "@context": "https://schema.org",
      ...blogPosting,
    };
  }

  const graph: Record<string, unknown>[] = [
    blogPosting,
    softwareApplicationNode(locale, landingUrl),
    {
      "@type": "FAQPage",
      mainEntity: enrichment.faqs.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  if (enrichment.howTo) {
    graph.push({
      "@type": "HowTo",
      name: enrichment.howTo.name,
      description: enrichment.howTo.description,
      ...(enrichment.howTo.totalTime
        ? { totalTime: enrichment.howTo.totalTime }
        : {}),
      step: enrichment.howTo.steps.map((step) => ({
        "@type": "HowToStep",
        name: step.name,
        text: step.text,
      })),
      tool: {
        "@type": "HowToTool",
        name: SITE_NAME,
      },
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function getDevelopersMetadata(locale: "en" | "es"): Metadata {
  const isSpanish = locale === "es";
  const copy = isSpanish ? ES_DEVELOPERS : EN_DEVELOPERS;
  const url = isSpanish
    ? `${PRODUCTION_APP_URL}/es/developers`
    : `${PRODUCTION_APP_URL}/developers`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
      languages: {
        en: `${PRODUCTION_APP_URL}/developers`,
        es: `${PRODUCTION_APP_URL}/es/developers`,
        "x-default": `${PRODUCTION_APP_URL}/developers`,
      },
    },
    openGraph: buildOpenGraph(copy.title, copy.description, url, locale),
    twitter: buildTwitter(copy.title, copy.description),
  };
}

export function getDevelopersJsonLd(locale: "en" | "es") {
  const isSpanish = locale === "es";
  const url = isSpanish
    ? `${PRODUCTION_APP_URL}/es/developers`
    : `${PRODUCTION_APP_URL}/developers`;
  const apiDocsUrl = `${PRODUCTION_APP_URL}/api-docs`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: isSpanish ? ES_DEVELOPERS.title : EN_DEVELOPERS.title,
        description: isSpanish
          ? ES_DEVELOPERS.description
          : EN_DEVELOPERS.description,
        url,
        inLanguage: isSpanish ? "es" : "en",
        isPartOf: {
          "@type": "WebSite",
          name: SITE_NAME,
          url: PRODUCTION_APP_URL,
        },
      },
      {
        "@type": "TechArticle",
        headline: isSpanish
          ? "API REST de Presusimple para presupuestos y gastos"
          : "Presusimple REST API for budgets and expenses",
        description: isSpanish
          ? ES_DEVELOPERS.description
          : EN_DEVELOPERS.description,
        url,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${PRODUCTION_APP_URL}/icons/icon-512x512.png`,
          },
        },
      },
      softwareApplicationNode(
        locale,
        isSpanish ? `${PRODUCTION_APP_URL}/es` : PRODUCTION_APP_URL
      ),
      {
        "@type": "WebAPI",
        name: "Presusimple API",
        description: isSpanish
          ? "API REST con autenticación JWT para presupuestos, gastos y categorías."
          : "REST API with JWT authentication for budgets, expenses, and categories.",
        documentation: apiDocsUrl,
        url: `${PRODUCTION_APP_URL}/api`,
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: PRODUCTION_APP_URL,
        },
      },
    ],
  };
}

export function getApiDocsMetadata(locale: "en" | "es" = "en"): Metadata {
  const isSpanish = locale === "es";
  const copy = isSpanish ? ES_API_DOCS : EN_API_DOCS;
  const url = `${PRODUCTION_APP_URL}/api-docs`;

  return {
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: url,
    },
    openGraph: buildOpenGraph(copy.title, copy.description, url, locale),
    twitter: buildTwitter(copy.title, copy.description),
  };
}

export function getApiDocsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: EN_API_DOCS.title,
        description: EN_API_DOCS.description,
        url: `${PRODUCTION_APP_URL}/api-docs`,
        author: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        publisher: {
          "@type": "Organization",
          name: SITE_NAME,
          logo: {
            "@type": "ImageObject",
            url: `${PRODUCTION_APP_URL}/icons/icon-512x512.png`,
          },
        },
      },
      {
        "@type": "WebAPI",
        name: "Presusimple API",
        description:
          "OpenAPI/Swagger interactive documentation for budgets, expenses, categories, and auth.",
        documentation: `${PRODUCTION_APP_URL}/api-docs`,
        url: `${PRODUCTION_APP_URL}/api`,
        provider: {
          "@type": "Organization",
          name: SITE_NAME,
          url: PRODUCTION_APP_URL,
        },
      },
    ],
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
