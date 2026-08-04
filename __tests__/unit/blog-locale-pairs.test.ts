import {
  BLOG_EN_TO_ES_SLUGS,
  getAlternateBlogSlug,
} from "@/lib/blog-locale-pairs";

describe("blog-locale-pairs", () => {
  it("maps every English slug to a Spanish counterpart", () => {
    expect(Object.keys(BLOG_EN_TO_ES_SLUGS)).toHaveLength(6);
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
