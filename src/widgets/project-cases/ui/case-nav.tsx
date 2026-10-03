"use client";

import { useEffect, useState } from "react";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";

/** `id` is the id of the element the row scrolls to and tracks. */
export type NavChild = { id: string; title: string };
export type NavSection = { id: string; title: string; children?: NavChild[] };

// Matches the sticky column's own top offset (lg:top-12): a section lands
// flush with the top of the content, level with the title on the left.
const LAND_OFFSET = 48;

// A section's own top padding and divider line sit above its content; landing
// flush means lining up the content, not that padding.
function contentInset(el: HTMLElement) {
  const style = getComputedStyle(el);
  return parseFloat(style.paddingTop) + parseFloat(style.borderTopWidth);
}

/** Last of `ids` whose content has reached the landing line, plus some slack. */
function lastReached(ids: string[]) {
  const line = LAND_OFFSET + 80;
  let current: string | null = null;
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el && el.getBoundingClientRect().top + contentInset(el) <= line) current = id;
  }
  return current;
}

/**
 * The project's table of contents, two levels deep: sections ("О проекте",
 * "Кейсы") with the individual cases nested under the one that holds them.
 * The section being read and, inside it, the case being read are highlighted.
 */
export function CaseNav({ sections }: { sections: NavSection[] }) {
  const lenisRef = useLenis();
  const [activeSection, setActiveSection] = useState(sections[0]?.id ?? "");
  const [activeChild, setActiveChild] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const section = lastReached(sections.map((s) => s.id)) ?? sections[0]?.id ?? "";
      setActiveSection(section);
      const children = sections.find((s) => s.id === section)?.children ?? [];
      setActiveChild(lastReached(children.map((c) => c.id)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  function goTo(event: React.MouseEvent, id: string) {
    const lenis = lenisRef?.current;
    const el = document.getElementById(id);
    if (!lenis || !el) return;
    event.preventDefault();
    lenis.scrollTo(el, { offset: contentInset(el) - LAND_OFFSET });
  }

  return (
    <nav aria-label="Содержание проекта">
      <ol className="space-y-1">
        {sections.map((section, index) => {
          const isActive = section.id === activeSection;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                onClick={(event) => goTo(event, section.id)}
                className={`flex gap-3 py-1.5 text-sm leading-snug transition-colors ${
                  isActive ? "text-[#ece5d6]" : "text-[#8a8378] hover:text-[#cfc8b8]"
                }`}
              >
                <span className={`w-5 shrink-0 tabular-nums transition-colors ${isActive ? "text-[#e2451f]" : ""}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{section.title}</span>
              </a>

              {section.children && section.children.length > 0 && (
                <ul className="mb-2 ml-[0.55rem] mt-1 space-y-0.5 border-l border-[#2a2824] pl-[1.3rem]">
                  {section.children.map((child) => {
                    const isChildActive = isActive && child.id === activeChild;
                    return (
                      <li key={child.id}>
                        <a
                          href={`#${child.id}`}
                          aria-current={isChildActive ? "true" : undefined}
                          onClick={(event) => goTo(event, child.id)}
                          className={`relative block py-1 text-[0.8125rem] leading-snug transition-colors ${
                            isChildActive ? "text-[#ece5d6]" : "text-[#8a8378] hover:text-[#cfc8b8]"
                          }`}
                        >
                          {isChildActive && (
                            <span
                              aria-hidden="true"
                              className="absolute -left-[1.3rem] top-1/2 h-4 w-px -translate-y-1/2 bg-[#e2451f]"
                            />
                          )}
                          {child.title}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
