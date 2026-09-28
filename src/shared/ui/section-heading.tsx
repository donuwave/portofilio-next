import type { ReactNode, Ref } from "react";

/**
 * Shared header for the page's top-level sections: a full-width rule, the
 * section's number and name in the same treatment the menu uses, then the
 * heading itself. The rule belongs to the header rather than to the section's
 * own top edge so it always lands right above the number — sections don't
 * share a top padding (the first one clears the hero), and a border on the
 * section would sit a screen away from the text it belongs to.
 *
 * The label and the heading are siblings on purpose: the hero transition finds
 * the content's starting point through the heading's previousElementSibling.
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
  children: ReactNode;
  headingId?: string;
  headingRef?: Ref<HTMLHeadingElement>;
}) {
  return (
    <>
      <div className="border-t border-[#2a2824] pt-5 text-xs tracking-[0.25em] text-[#8a8378]">
        <span className="text-[#e2451f]">{String(index + 1).padStart(2, "0")}</span>
        <span className="ml-3">{label.toUpperCase()}</span>
      </div>
      <h2
        id={headingId}
        ref={headingRef}
        className="mt-6 font-display text-4xl leading-[1.05] text-[#ece5d6] sm:text-5xl"
      >
        {children}
      </h2>
    </>
  );
}
