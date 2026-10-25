import type { Locale } from "@/shared/i18n/config";
import { pickLocalized } from "@/shared/lib/localized-text";
import { Markdown } from "@/shared/ui/markdown";
import type { Case } from "../model/types";
import { CaseMediaCarousel } from "./case-media-carousel";

/**
 * A case: its title, then the media, then the text. The description is markdown; the "## Heading"
 * lines that cases were already written with ("## Было", "## Что сделали"…) are simply level-2
 * markdown headings, so existing cases keep working unchanged.
 */
export function CaseItem({ item, locale, isLast = false }: { item: Case; locale: Locale; isLast?: boolean }) {
  const title = pickLocalized(item.title, locale);
  const description = pickLocalized(item.description, locale);

  return (
    <article id={`case-${item.id}`} className={`border-t border-[#2a2824] py-14 first:border-t-0 first:pt-0 ${
        // The last case needs enough page under it to be scrolled flush to
        // the top like the others, instead of stopping wherever the page ends.
        isLast ? "lg:min-h-[calc(100vh-3rem)]" : ""
      }`}>
      <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15] text-[#ece5d6]">{title}</h2>

      {item.media.length > 0 && (
        <div className="mt-8">
          <CaseMediaCarousel media={item.media} title={title} />
        </div>
      )}

      {description.trim() && <Markdown className="mt-10 max-w-[44rem]">{description}</Markdown>}
    </article>
  );
}
