/** Maps English blog slugs to their Spanish equivalents. */
export const BLOG_EN_TO_ES_SLUGS: Record<string, string> = {
  "getting-started-zero-based-budgeting": "comenzar-presupuesto-base-cero",
  "how-to-make-a-monthly-budget": "como-hacer-un-presupuesto-mensual",
  "50-30-20-vs-zero-based-budgeting": "regla-50-30-20-vs-presupuesto-base-cero",
  "how-to-track-expenses-daily": "como-controlar-gastos-diarios",
  "emergency-fund-how-much-to-save": "fondo-de-emergencia-cuanto-ahorrar",
  "how-to-stop-overspending": "como-dejar-de-gastar-de-mas",
};

const ES_TO_EN_SLUGS = Object.fromEntries(
  Object.entries(BLOG_EN_TO_ES_SLUGS).map(([en, es]) => [es, en])
);

export function getAlternateBlogSlug(
  locale: "en" | "es",
  slug: string
): string | undefined {
  if (locale === "en") {
    return BLOG_EN_TO_ES_SLUGS[slug];
  }
  return ES_TO_EN_SLUGS[slug];
}
