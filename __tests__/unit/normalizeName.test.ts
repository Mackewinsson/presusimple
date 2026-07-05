import { describe, it, expect } from "@jest/globals";
import {
  hasDuplicateName,
  normalizeNameForComparison,
} from "@/lib/utils/normalizeName";

describe("normalizeName", () => {
  it("compares names case-insensitively with trimmed whitespace", () => {
    expect(normalizeNameForComparison("  Rent  ")).toBe("rent");
    expect(
      hasDuplicateName("rent", ["Rent"], undefined)
    ).toBe(true);
  });

  it("excludes the current name when checking for duplicates", () => {
    expect(
      hasDuplicateName("Rent", ["Rent", "Food"], "Rent")
    ).toBe(false);
    expect(
      hasDuplicateName("Food", ["Rent", "Food"], "Rent")
    ).toBe(true);
  });
});
