"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";

/** `id` is the id of the element the row scrolls to and tracks. */
export type CaseNavItem = { id: string; title: string; numbered?: boolean };

/**
 * The project's table of contents: one row per section (the project's own
 * description, then each case), the one currently being read highlighted.
 * "Current" is the last section whose top has reached the line a clicked row
 * lands it on, plus a little slack, so a row that was just scrolled to is
 * always the highlighted one.
 */
// Matches the sticky column's own top offset (lg:top-12): a section lands
// flush with the top of the content, level with the title on the left.
const LAND_OFFSET = 48;

// A section's own top padding and divider line sit above its content; landing
// flush means lining up the content, not that padding.
function contentInset(el: HTMLElement) {
  const style = getComputedStyle(el);
  return parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);
}

export function CaseNav({ items }: { items: CaseNavItem[] }) {
  const lenisRef = useLenis();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const update = () => {
      const line = LAND_OFFSET + 80;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top + contentInset(el) <= line) current = item.id;
      }
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [items]);

  let caseNumber = 0;

  return (
    <nav aria-label="Содержание проекта">
      <ol className="space-y-1">
        {items.map((item) => {
          const isActive = item.id === active;
          const number = item.numbered ? ++caseNumber : 0;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  const lenis = lenisRef?.current;
                  const el = document.getElementById(item.id);
                  if (!lenis || !el) return;
                  event.preventDefault();
                  lenis.scrollTo(el, { offset: contentInset(el) - LAND_OFFSET });
                }}
                className={`group flex gap-3 py-1.5 text-sm leading-snug transition-colors ${
                  isActive ? "text-[#ece5d6]" : "text-[#8a8378] hover:text-[#cfc8b8]"
                }`}
              >
                <span className={`w-5 shrink-0 tabular-nums transition-colors ${isActive ? "text-[#e2451f]" : ""}`}>
                  {item.numbered ? String(number).padStart(2, "0") : "·"}
                </span>
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
