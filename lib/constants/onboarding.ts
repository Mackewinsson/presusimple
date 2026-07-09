/** localStorage key — user has seen the zero-based budgeting tutorial */
export const ZBB_TUTORIAL_SEEN_KEY = "zbbTutorialSeen";

export const ZBB_BLOG_SLUGS = {
  en: "getting-started-zero-based-budgeting",
  es: "comenzar-presupuesto-base-cero",
} as const;

export function getZbbBlogPath(locale: "en" | "es"): string {
  const slug = ZBB_BLOG_SLUGS[locale];
  return locale === "es" ? `/es/blog/${slug}` : `/blog/${slug}`;
}
