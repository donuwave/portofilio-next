export type LocalizedText = { ru: string; en: string };

const DEFAULT_LOCALE: keyof LocalizedText = "ru";

export function pickLocalized(value: LocalizedText, locale: keyof LocalizedText = DEFAULT_LOCALE): string {
  return value[locale] || value.ru || value.en;
}
