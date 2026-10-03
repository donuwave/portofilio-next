"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";

export type CaseNavItem = { id: string; title: string };

/**
 * The project's table of contents: one row per case, the one currently being
 * read highlighted. "Current" is the last case whose top has scrolled past a
 * line a third of the way down the screen, so a short case isn't skipped over
 * just because its heading never gets close to the top.
 */
export function CaseNav({ items }: { items: CaseNavItem[] }) {
  const lenisRef = useLenis();
  const [active, setActive] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const update = () => {
      const line = window.innerHeight / 3;
      let current = items[0]?.id ?? "";
      for (const item of items) {
        const el = document.getElementById(`case-${item.id}`);
        if (el && el.getBoundingClientRect().top <= line) current = item.id;
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

  return (
    <nav aria-label="Кейсы проекта">
      <ol className="space-y-1">
        {items.map((item, index) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#case-${item.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => {
                  const lenis = lenisRef?.current;
                  if (!lenis) return;
                  event.preventDefault();
                  lenis.scrollTo(`#case-${item.id}`, { offset: -96 });
                }}
                className={`group flex gap-3 py-1.5 text-sm leading-snug transition-colors ${
                  isActive ? "text-[#ece5d6]" : "text-[#8a8378] hover:text-[#cfc8b8]"
                }`}
              >
                <span className={`tabular-nums transition-colors ${isActive ? "text-[#e2451f]" : ""}`}>
                  {String(index + 1).padStart(2, "0")}
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
