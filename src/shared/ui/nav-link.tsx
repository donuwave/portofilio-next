import type { ReactNode } from "react";

/**
 * Deliberately a different, more jagged/crooked squiggle than ScribbleUnderline's
 * smooth wave (used on the hero name) — draws in on hover via a CSS transition,
 * no JS needed.
 */
function HoverUnderline() {
  return (
    <svg viewBox="0 0 120 10" preserveAspectRatio="none" className="mt-0.5 h-[0.5em] w-full" aria-hidden="true">
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
  return (
    <a href={href} className={`group inline-flex flex-col hover:text-[#ece5d6] ${className}`}>
      <span>{children}</span>
      <HoverUnderline />
    </a>
  );
}
