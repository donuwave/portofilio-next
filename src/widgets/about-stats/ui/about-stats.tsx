"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { NavLink } from "@/shared/ui/nav-link";

gsap.registerPlugin(ScrollTrigger);

export function AboutStats({ skills, projectCount }: { skills: string[]; projectCount: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const id = useId();

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      const underline = root.closest("section")?.querySelector("[data-about-underline]");
      const paths = root.querySelectorAll("[data-stat-line]");
      const values = root.querySelectorAll("[data-stat-value]");
      const dots = root.querySelectorAll("[data-stat-dot]");
      const timeline = gsap.timeline({ scrollTrigger: {
        trigger: root, start: "top 90%", end: "bottom 65%", scrub: 0.6,
      } });
      if (underline) timeline.fromTo(underline, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.6, ease: "none" });
      values.forEach((value, index) => {
        if (index > 0) timeline.fromTo(paths[index - 1], { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.65, ease: "none" });
        timeline.fromTo(dots[index], { opacity: 0.2 }, { opacity: 1, duration: 0.15 });
        timeline.fromTo(value, { y: 16, opacity: 0.2 }, { y: 0, opacity: 1, duration: 0.35 }, "<");
      });
    });
    return () => media.revert();
  }, []);

  const stats = [
    { value: "3+", label: "года опыта", detail: "От прототипа до продакшена", href: "#experience", link: "Мой путь ↗" },
    { value: `${skills.length}+`, label: "технологий", detail: skills.slice(0, 4).join(" · "), href: "#skills", link: "Весь стек ↗" },
    { value: String(projectCount), label: "проекта", detail: "Задачи, решения и результат", href: "#projects", link: "Смотреть работы ↗" },
  ];

  return (
    <div ref={rootRef} className="relative mt-12 sm:mt-16">
      <svg viewBox="0 0 600 100" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-20 w-full overflow-visible text-[#e2451f]" fill="none">
        <path data-stat-line d="M100 28 C150 28 162 75 208 66 S257 28 300 28" stroke="currentColor" strokeWidth="2" pathLength="1" strokeDasharray="1 2" />
        <path data-stat-line d="M300 28 C344 28 350 68 398 68 C453 68 439 9 411 26 C381 44 452 52 500 28" stroke="currentColor" strokeWidth="2" pathLength="1" strokeDasharray="1 2" />
        {[100, 300, 500].map((x) => <circle key={x} data-stat-dot cx={x} cy="28" r="5" fill="currentColor" />)}
      </svg>
      <div className="grid grid-cols-3 gap-3 pt-24 sm:gap-5">
        {stats.map((stat, index) => (
          <div key={stat.label} className="group min-w-0" data-expanded={expanded === index}>
            <button type="button" aria-expanded={expanded === index} aria-controls={`${id}-${index}`} onClick={() => setExpanded(expanded === index ? null : index)} className="w-full cursor-pointer rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#e2451f]">
              <span data-stat-value className="block font-display text-4xl leading-none tracking-tight text-[#ece5d6] sm:text-5xl">{stat.value}</span>
              <span className="mt-3 block text-[10px] uppercase tracking-[0.12em] text-[#8a8378] sm:text-xs">{stat.label}</span>
              <span aria-hidden="true" className="mt-3 block text-sm text-[#e2451f] transition-transform group-hover:translate-x-1 motion-reduce:transition-none">{expanded === index ? "−" : "+"}</span>
            </button>
            <div id={`${id}-${index}`} className="invisible mt-3 min-h-28 translate-y-2 text-xs leading-relaxed text-[#b8b1a3] opacity-0 transition-[opacity,transform,visibility] duration-300 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-data-[expanded=true]:visible group-data-[expanded=true]:translate-y-0 group-data-[expanded=true]:opacity-100 motion-reduce:transform-none motion-reduce:transition-none">
              <p>{stat.detail}</p>
              <NavLink href={stat.href} className="mt-3 text-[#ece5d6]">{stat.link}</NavLink>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
