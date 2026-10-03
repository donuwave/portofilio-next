import { pickLocalized } from "@/shared/lib/localized-text";
import type { Case } from "../model/types";
import { CaseMediaCarousel } from "./case-media-carousel";

// The first sentence is what a skimmer should walk away with, so it's set
// apart as a lead; the rest is the detail for anyone who keeps reading.
function splitLead(text: string) {
  const match = text.match(/^([\s\S]+?[.!?…])(\s+[\s\S]*)?$/);
  return match ? { lead: match[1], rest: (match[2] ?? "").trim() } : { lead: text, rest: "" };
}

export function CaseItem({ item, index, isLast = false }: { item: Case; index: number; isLast?: boolean }) {
  const title = pickLocalized(item.title);
  const { lead, rest } = splitLead(pickLocalized(item.description));

  return (
    <article id={`case-${item.id}`} className={`border-t border-[#2a2824] py-14 first:border-t-0 first:pt-0 ${
        // The last case needs enough page under it to be scrolled flush to
        // the top like the others, instead of stopping wherever the page ends.
        isLast ? "lg:min-h-[calc(100vh-3rem)]" : ""
      }`}>
      <p className="text-sm tabular-nums text-[#e2451f]">{String(index + 1).padStart(2, "0")}</p>
      <h2 className="mt-3 font-display text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.15] text-[#ece5d6]">{title}</h2>
      <p className="mt-6 max-w-[44rem] text-[clamp(1.125rem,1.4vw,1.375rem)] leading-[1.5] text-[#ece5d6]">{lead}</p>
      {rest && <p className="mt-5 max-w-[44rem] whitespace-pre-line leading-[1.75] text-[#b8b1a3]">{rest}</p>}
      {item.media.length > 0 && (
        <div className="mt-10">
          <CaseMediaCarousel media={item.media} title={title} />
        </div>
      )}
    </article>
  );
}
