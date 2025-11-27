export const locales = ["vi", "en", "zh", "id"] as const;
export const defaultLocale = locales[0];

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function buildLocalePath(locale: Locale, path = "") {
  const normalized = path.replace(/^\/+/u, "").replace(/\/+/u, "/");
  const segments = [locale, normalized].filter(Boolean);
  return `/${segments.join("/")}`;
}
