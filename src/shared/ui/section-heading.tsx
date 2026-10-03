import type { ReactNode, Ref } from "react";

/**
 * Header for the page's top-level sections: the section number sitting on
 * the divider line itself, then a large title below it. The title is the
 * section name unless `children` supplies real title copy.
 *
 * The divider row and the heading are siblings on purpose: the hero
 * transition finds the content's starting point through the heading's
 * previousElementSibling.
 */
export function SectionHeading({
  index,
  label,
  children,
  headingId,
  headingRef,
}: {
  /** Zero-based, and numbered for display the way the nav numbers itself. */
  index: number;
  label: string;
  children?: ReactNode;
  headingId?: string;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <>
      <div className="flex items-center gap-4" aria-hidden="true">
        <span className="font-display text-lg leading-none text-[#e2451f]">{String(index + 1).padStart(2, "0")}</span>
        <span className="h-px flex-1 bg-[#2a2824]" />
      </div>
      <h2
        id={headingId}
        ref={headingRef}
        className="mt-6 font-display text-[clamp(2rem,3.4vw,3.5rem)] leading-[1.02] text-[#ece5d6]"
      >
        {children ?? label}
      </h2>
    </>
  );
}
