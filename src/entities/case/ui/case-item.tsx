import type { Locale } from "@/shared/i18n/config";
import { pickLocalized } from "@/shared/lib/localized-text";
import type { Case } from "../model/types";
import { CaseMediaCarousel } from "./case-media-carousel";

type Block = { heading: string | null; text: string };

/**
 * A case's description is written as plain text with optional sub-headings,
 * each on its own line as `## Heading` ("## Было", "## Что сделали"…). That
 * keeps it editable as a single field in admin while letting the page set the
 * headings apart. Text before the first heading — or a description with no
 * headings at all — is shown as an unlabelled block.
 */
function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let current: Block = { heading: null, text: "" };

  for (const line of source.split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      if (current.heading !== null || current.text.trim()) blocks.push(current);
      current = { heading: heading[1], text: "" };
    } else {
      current.text += `${line}\n`;
    }
  }
  if (current.heading !== null || current.text.trim()) blocks.push(current);

  return blocks.map((block) => ({ ...block, text: block.text.trim() })).filter((block) => block.text || block.heading);
}

export function CaseItem({ item, locale, isLast = false }: { item: Case; locale: Locale; isLast?: boolean }) {
  const title = pickLocalized(item.title, locale);
  const blocks = parseBlocks(pickLocalized(item.description, locale));

  return (
    <article id={`case-${item.id}`} className={`border-t border-[#2a2824] py-14 first:border-t-0 first:pt-0 ${
        // The last case needs enough page under it to be scrolled flush to
        // the top like the others, instead of stopping wherever the page ends.
        isLast ? "lg:min-h-[calc(100vh-3rem)]" : ""
      }`}>
      <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15] text-[#ece5d6]">{title}</h2>

      <div className="mt-8 max-w-[44rem] space-y-8">
        {blocks.map((block, index) => (
          <section key={index}>
            {block.heading && <h3 className="text-lg font-medium text-[#e2451f]">{block.heading}</h3>}
            {block.text && (
              <p className={`whitespace-pre-line text-[1.0625rem] leading-[1.75] text-[#cfc8b8] ${block.heading ? "mt-2" : ""}`}>
                {block.text}
              </p>
            )}
          </section>
        ))}
      </div>

      {item.media.length > 0 && (
        <div className="mt-10">
          <CaseMediaCarousel media={item.media} title={title} />
        </div>
      )}
    </article>
  );
}
