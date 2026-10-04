import type { Locale } from "@/shared/i18n/config";
import { pickLocalized, type LocalizedText } from "@/shared/lib/localized-text";

export function ProjectTag({
  tag,
  locale,
  className = "",
}: {
  tag: LocalizedText | null;
  locale: Locale;
  className?: string;
}) {
  const text = tag ? pickLocalized(tag, locale) : "";
  if (!text) return null;
  return (
    <span className={`inline-block rounded-full border border-[#3a372f] px-3 py-1 text-xs text-[#cfc8b8] ${className}`}>
      {text}
    </span>
  );
}
