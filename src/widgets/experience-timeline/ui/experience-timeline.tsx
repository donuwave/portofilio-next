"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Experience } from "@/entities/experience/model/types";
import { pickLocalized } from "@/shared/lib/localized-text";

gsap.registerPlugin(ScrollTrigger);

function formatRange(dateFrom: string, dateTo: string | null) {
  const from = new Date(dateFrom).getFullYear();
  const to = dateTo ? new Date(dateTo).getFullYear() : "наст. время";
  return `${from} – ${to}`;
}

export function ExperienceTimeline({ items }: { items: Experience[] }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add({ reduceMotion: "(prefers-reduced-motion: reduce)", motion: "(prefers-reduced-motion: no-preference)" }, (context) => {
      const reduced = context.conditions?.reduceMotion;
      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-experience-row]"));
      const logos = Array.from(root.querySelectorAll<HTMLElement>("[data-experience-logo]"));
      const paths = Array.from(root.querySelectorAll<SVGPathElement>("[data-experience-path]"));
      let animation: gsap.Context | undefined;
      let frame = 0;

      const draw = () => {
        animation?.revert();
        const origin = root.getBoundingClientRect();
        animation = gsap.context(() => {
          paths.forEach((path, index) => {
            const from = logos[index].getBoundingClientRect();
            const to = logos[index + 1].getBoundingClientRect();
            const rowBottom = rows[index].getBoundingClientRect().bottom - origin.top;
            const nextTop = rows[index + 1].getBoundingClientRect().top - origin.top;
            const x = from.left + from.width / 2 - origin.left;
            const y = from.top + from.height / 2 - origin.top;
            const endY = to.top + to.height / 2 - origin.top;
            const middle = (rowBottom + nextTop) / 2;
            // Flourishes stay inside the gap, clear of years and wrapped titles.
            const direction = index % 2 === 0 ? -1 : 1;
            const gap = nextTop - rowBottom;
            const curl = Math.min(gap * 0.3, 88);
            const sweep = Math.min(origin.width * 0.3, 150);
            const outer = x + direction * Math.min(sweep, direction === -1 ? x - 8 : origin.width - x - 8);
            const inner = x - direction * Math.min(sweep * 0.55, 64);
            path.setAttribute("d", [
              `M ${x} ${y}`,
              `C ${x} ${rowBottom + gap * 0.12}, ${outer} ${middle - curl}, ${outer} ${middle}`,
              `C ${outer} ${middle + curl}, ${inner} ${middle + curl}, ${inner} ${middle}`,
              `C ${inner} ${middle - curl * 0.75}, ${x} ${middle - curl * 0.6}, ${x} ${middle + curl * 0.6}`,
              `C ${x} ${nextTop - gap * 0.12}, ${x} ${nextTop - gap * 0.12}, ${x} ${endY}`,
            ].join(" "));
            if (reduced) return;
            const length = path.getTotalLength();
            gsap.fromTo(path, { strokeDasharray: `${length} ${length}`, strokeDashoffset: length }, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: logos[index], start: "center 70%",
                endTrigger: logos[index + 1], end: "center 70%",
                scrub: 0.65, invalidateOnRefresh: true,
              },
            });
          });
          if (!reduced) {
            logos.forEach((logo) => {
              gsap.fromTo(logo, { borderColor: "#3a372f" }, {
                borderColor: "#e2451f", ease: "none",
                scrollTrigger: { trigger: logo, start: "center 78%", end: "center 68%", scrub: 0.4 },
              });
            });
          }
        }, root);
      };
      draw();
      // Re-anchor after font loading, title wrapping and responsive resizing.
      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          draw();
          ScrollTrigger.refresh();
        });
      });
      observer.observe(root);
      rows.forEach((row) => observer.observe(row));
      return () => {
        cancelAnimationFrame(frame);
        observer.disconnect();
        animation?.revert();
      };
    });
    return () => media.revert();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef} className="relative mt-12 border-t border-[#2a2824] py-10 sm:mt-16 sm:py-14">
      <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" fill="none" aria-hidden="true">
        {items.slice(1).map((item) => (
          <path key={item.id} data-experience-path stroke="#e2451f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
      </svg>
      <ol aria-label="Опыт работы" className="relative space-y-[clamp(12rem,32vh,22rem)]">
      {items.map((item) => (
        <li key={item.id} data-experience-row className="flex items-center gap-3 sm:gap-4">
          <p className="w-24 shrink-0 font-display text-[1.75rem] leading-none tracking-tight text-[#8a8378] sm:w-32 sm:text-4xl">
            {new Date(item.dateFrom).getFullYear()}
          </p>
          <div data-experience-logo className="relative flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#3a372f] bg-[#1c1a17] text-2xl font-bold text-[#e2451f]">
            {item.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.logo.path} alt={item.company} className="h-full w-full object-cover" />
            ) : (
              item.company.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed text-[#b8b1a3] sm:text-base">
              {formatRange(item.dateFrom, item.dateTo)} ({item.company}):
            </p>
            <p className="mt-2 text-xl leading-tight font-bold sm:text-2xl text-[#ece5d6]">{pickLocalized(item.position)}</p>
          </div>
        </li>
      ))}
      </ol>
    </div>
  );
}
