import {
  BLOG_EN_TO_ES_SLUGS,
  getAlternateBlogSlug,
} from "@/lib/blog-locale-pairs";

describe("blog-locale-pairs", () => {
  it("maps every English slug to a distinct Spanish counterpart", () => {
    const entries = Object.entries(BLOG_EN_TO_ES_SLUGS);
    expect(entries.length).toBeGreaterThan(0);

    const spanishSlugs = entries.map(([, es]) => es);
    for (const [en, es] of entries) {
      expect(es.length).toBeGreaterThan(0);
      expect(es).not.toBe(en);
    }
    expect(new Set(spanishSlugs).size).toBe(entries.length);
  });

  it("resolves alternate slugs in both directions", () => {
    expect(
      getAlternateBlogSlug("en", "how-to-make-a-monthly-budget")
    ).toBe("como-hacer-un-presupuesto-mensual");
    expect(
      getAlternateBlogSlug("es", "como-hacer-un-presupuesto-mensual")
    ).toBe("how-to-make-a-monthly-budget");
  });

  it("returns undefined for unknown slugs", () => {
    expect(getAlternateBlogSlug("en", "unknown-slug")).toBeUndefined();
  });
});
