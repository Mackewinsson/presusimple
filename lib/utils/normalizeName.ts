export function normalizeNameForComparison(name: string): string {
  return name.trim().toLowerCase();
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function buildExactNameRegex(name: string): RegExp {
  return new RegExp(`^${escapeRegExp(name.trim())}$`, "i");
}

export function hasDuplicateName(
  name: string,
  existingNames: string[],
  excludeName?: string
): boolean {
  const normalized = normalizeNameForComparison(name);
  if (!normalized) return false;

  const normalizedExclude = excludeName
    ? normalizeNameForComparison(excludeName)
    : null;

  return existingNames.some((existing) => {
    const normalizedExisting = normalizeNameForComparison(existing);
    if (normalizedExclude && normalizedExisting === normalizedExclude) {
      return false;
    }
    return normalizedExisting === normalized;
  });
}
