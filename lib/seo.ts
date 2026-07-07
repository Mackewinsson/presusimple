import type { Metadata } from "next";
import { getAlternateBlogSlug } from "@/lib/blog-locale-pairs";
import { PRODUCTION_APP_URL } from "@/lib/constants/branding";
import {
  buildFaqPageJsonLd,
  LANDING_FAQS,
  type FaqItem,
} from "@/lib/seo-faqs";

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
      },
    },
    openGraph: buildOpenGraph(title, description, url, locale),
    twitter: buildTwitter(title, description),
  };
}

function getBlogPostAlternateLanguages(
  locale: "en" | "es",
  slug: string
): Record<string, string> | undefined {
  const alternateSlug = getAlternateBlogSlug(locale, slug);
  if (!alternateSlug) {
    return undefined;
  }

  const enSlug = locale === "en" ? slug : alternateSlug;
  const esSlug = locale === "es" ? slug : alternateSlug;

  return {
    en: `${PRODUCTION_APP_URL}/blog/${enSlug}`,
    es: `${PRODUCTION_APP_URL}/es/blog/${esSlug}`,
  };
}

export function getBlogPostMetadata(
  locale: "en" | "es",
  post: { title: string; description: string; slug: string; date: string; tags?: string[] }
): Metadata {
  const basePath = locale === "es" ? "/es/blog" : "/blog";
  const url = `${PRODUCTION_APP_URL}${basePath}/${post.slug}`;
  const languages = getBlogPostAlternateLanguages(locale, post.slug);

  return {
    title: `${post.title} | Presusimple`,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: url,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      ...buildOpenGraph(`${post.title} | Presusimple`, post.description, url, locale),
      type: "article",
      publishedTime: post.date,
    },
    twitter: buildTwitter(`${post.title} | Presusimple`, post.description),
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
      buildFaqPageJsonLd(LANDING_FAQS[locale]),
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
    faqs?: FaqItem[];
  }
) {
  const basePath = locale === "es" ? "/es/blog" : "/blog";
  const blogIndexPath = locale === "es" ? "/es/blog" : "/blog";
  const url = `${PRODUCTION_APP_URL}${basePath}/${post.slug}`;
  const blogIndexUrl = `${PRODUCTION_APP_URL}${blogIndexPath}`;
  const homeUrl = locale === "es" ? `${PRODUCTION_APP_URL}/es` : PRODUCTION_APP_URL;
  const blogIndexLabel = locale === "es" ? "Blog" : "Blog";

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.date,
      inLanguage: locale === "es" ? "es" : "en",
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
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Presusimple",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: blogIndexLabel,
          item: blogIndexUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    },
  ];

  if (post.faqs && post.faqs.length > 0) {
    graph.push(buildFaqPageJsonLd(post.faqs));
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph,
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
