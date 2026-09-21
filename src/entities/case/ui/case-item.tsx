import { pickLocalized } from "@/shared/lib/localized-text";
import type { Case } from "../model/types";
import { CaseMediaCarousel } from "./case-media-carousel";

export function CaseItem({ item }: { item: Case }) {
  const title = pickLocalized(item.title);
  const description = pickLocalized(item.description);

  return (
    <article className="border-t border-[#2a2824] py-20">
      <div className="px-6 sm:px-12">
        <h3 className="font-display text-4xl text-[#ece5d6] sm:text-5xl">{title}</h3>
        <p className="mt-3 max-w-xl text-[#b8b1a3]">{description}</p>
      </div>
      {item.media.length > 0 && (
        <div className="mt-10">
          <CaseMediaCarousel media={item.media} title={title} />
        </div>
      )}
    </article>
  );
}
