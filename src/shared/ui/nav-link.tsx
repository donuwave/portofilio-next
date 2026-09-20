"use client";

import type { MouseEvent, ReactNode } from "react";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";

/**
 * Deliberately a different, more jagged/crooked squiggle than ScribbleUnderline's
 * smooth wave (used on the hero name) — draws in on hover via a CSS transition,
 * no JS needed.
 */
function HoverUnderline() {
  return (
    <svg
      viewBox="0 0 120 10"
      preserveAspectRatio="none"
      // Absolutely positioned (not a normal flex-col sibling of the label) —
      // an in-flow svg here contributes to the <a>'s own intrinsic width via
      // its w-full percentage, and since the <a> is itself shrink-to-fit, a
      // definite height (h-[0.5em]) with an indefinite container width makes
      // browsers fall back to sizing the svg by its own aspect ratio
      // (viewBox 120:10 = 12:1) times that height — 14px tall at 28px type
      // resolves to a 168px-wide svg regardless of the label's real text
      // width, so any label shorter than that reads as if it had a huge
      // trailing gap before the next nav item. Taking it out of flow lets
      // the <a> size to the text alone; inset-x-0 then stretches it to match.
      // Anchored to the <a>'s own bottom edge (see the matching pb-* on <a>)
      // rather than top-full, so the reserved gap above it stays inside the
      // <a>'s own hoverable box instead of being a dead strip between two
      // separately-hoverable elements.
      className="absolute inset-x-0 bottom-0 h-[0.5em]"
      aria-hidden="true">
      <path
        d="M1 6 L 15 2 L 29 8 L 43 3 L 57 7 L 71 2 L 85 8 L 99 3 L 119 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-300 ease-out group-hover:[stroke-dashoffset:0]"
      />
    </svg>
  );
}

export function NavLink({ href, children, className = "" }: { href: string; children: ReactNode; className?: string }) {
  const lenisRef = useLenis();

  // Native/CSS smooth-scroll fights Lenis's own animation loop while it's
  // still settling from the last scroll, making clicks feel dead until it
  // stops — routing through Lenis's own scrollTo keeps navigation responsive
  // no matter what Lenis is doing when the click happens.
  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    const lenis = lenisRef?.current;
    if (!lenis || !href.startsWith("#")) return;
    e.preventDefault();
    lenis.scrollTo(href);
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      // pb reserves the underline's own space (gap + height) inside the <a>'s
      // own box, so that strip stays part of its hoverable area — without it,
      // the absolutely positioned underline sits entirely outside the <a>'s
      // box and the small gap above it becomes a dead zone neither element
      // covers.
      className={`group relative inline-block pb-[calc(0.5em+2px)] hover:text-[#ece5d6] ${className}`}
    >
      <span>{children}</span>
      <HoverUnderline />
    </a>
  );
}
