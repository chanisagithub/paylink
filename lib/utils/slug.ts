const slugSuffixPattern = /-[a-z0-9]{4}$/;

function randomSuffix(length = 4) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length })
    .map(() => alphabet[Math.floor(Math.random() * alphabet.length)])
    .join("");
}

export function normalizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function createSlugCandidate(title: string) {
  const normalized = normalizeSlugInput(title);
  const base = normalized || "payment-link";
  const candidateBase = base.replace(slugSuffixPattern, "").slice(0, 75);
  return `${candidateBase}-${randomSuffix(4)}`;
}

export function createAlternateSlug(baseSlug: string) {
  const normalized = normalizeSlugInput(baseSlug) || "payment-link";
  const base = normalized.replace(slugSuffixPattern, "").slice(0, 75);
  return `${base}-${randomSuffix(4)}`;
}

