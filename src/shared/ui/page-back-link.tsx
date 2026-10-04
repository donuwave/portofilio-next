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
      // left/top are the text position (24px/48px, 24px/32px) minus the px-3 py-1 padding.
      className="fixed left-3 top-5 z-30 bg-[#141312] px-3 py-1 font-hand text-xl text-[#8a8378] transition-colors hover:text-[#ece5d6] sm:left-9 sm:top-7"
    >
      {children}
    </Link>
  );
}
