import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The "back" link of the public pages. One component so it sits at exactly the same spot
 * (top-left corner) on every page, and it stays there while the page scrolls. It has the
 * page colour behind it so scrolling content passes under it cleanly; the sticky columns
 * on the pages that have one start below it (see the project page).
 */
export function PageBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      // Below lg it sits in the 56px top bar (centred in it, level with the language switcher).
      // From lg up: left/top are the text position (48px/32px) minus the px-3 py-1 padding.
      className="fixed left-3 top-0 z-30 flex h-14 items-center bg-transparent px-3 font-hand text-xl text-[#8a8378] transition-colors hover:text-[#ece5d6] sm:left-9 lg:top-7 lg:block lg:h-auto lg:bg-[#141312] lg:py-1"
    >
      {children}
    </Link>
  );
}
