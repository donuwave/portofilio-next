import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The "back" link of the public pages. One component so it sits at exactly the
 * same spot (top-left corner of the page) on every page. Absolutely positioned,
 * so it scrolls away with the page instead of colliding with sticky columns.
 */
export function PageBackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="absolute left-6 top-6 z-10 font-hand text-xl text-[#8a8378] transition-colors hover:text-[#ece5d6] sm:left-12 sm:top-8"
    >
      {children}
    </Link>
  );
}
