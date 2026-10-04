"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useDictionary } from "@/shared/i18n/locale-provider";
import { NavLink } from "@/shared/ui/nav-link";

gsap.registerPlugin(ScrollTrigger);

export function AboutStats({ skills, company }: { skills: string[]; company: string | null }) {
  const dict = useDictionary().about.stats;
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia();
    media.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.fromTo(root.querySelectorAll("[data-stat]"), { y: 14, opacity: 0 }, {
        y: 0,
        opacity: 1,
        duration: 0.55,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 88%", once: true },
      });
    });
    return () => media.revert();
  }, []);

  const coreSkills = skills.filter((skill) => ["react", "typescript", "next.js", "node.js"].includes(skill.toLowerCase()));
  const stack = (coreSkills.length ? coreSkills : skills.slice(0, 4)).join(" · ");

  return (
    <div ref={rootRef} className="mt-12 sm:mt-16">
      <p data-stat className="text-xs uppercase tracking-[0.18em] text-[#8a8378]">{dict.label}</p>
      <h3 data-stat className="mt-5 font-display text-3xl leading-[1.1] tracking-tight text-[#ece5d6] sm:text-4xl">
        <span className="block text-[#e2451f]">Fullstack-</span>
        {dict.role}
      </h3>
      <p data-stat className="mt-5 text-lg leading-relaxed text-[#b8b1a3]">
        <span className="text-[#ece5d6]">{dict.years}</span> {dict.summary}
      </p>
      <dl data-stat className="mt-8 space-y-4 text-sm leading-relaxed">
        {company && (
          <div className="grid grid-cols-[5rem_1fr] gap-x-4">
            <dt className="text-[#8a8378]">{dict.now}</dt>
            <dd className="text-[#ece5d6]">{company}</dd>
          </div>
        )}
        {stack && (
          <div className="grid grid-cols-[5rem_1fr] gap-x-4">
            <dt className="text-[#8a8378]">{dict.stack}</dt>
            <dd className="text-[#ece5d6]">{stack}</dd>
          </div>
        )}
      </dl>
      <div data-stat className="mt-8">
        <NavLink href="#experience" className="text-sm text-[#b8b1a3]">{dict.moreAboutExperience}</NavLink>
      </div>
    </div>
  );
}
