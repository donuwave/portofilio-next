"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Profile } from "@/entities/profile/model/types";
import type { Project } from "@/entities/project/model/types";
import { ProfilePhoto } from "@/entities/profile/ui/profile-photo";
import { NAV_ITEMS } from "@/shared/config/nav-items";
import { SOCIAL_LINKS } from "@/shared/config/social-links";
import { pickLocalized } from "@/shared/lib/localized-text";
import { splitName } from "@/shared/lib/split-name";
import { NavLink } from "@/shared/ui/nav-link";
import { ScribbleUnderline } from "@/shared/ui/scribble-underline";
import { ProjectsGrid } from "@/widgets/projects-grid/ui/projects-grid";

gsap.registerPlugin(ScrollTrigger);

export function HomeScrollLayout({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Every piece below lives permanently at its real, settled (sidebar) position
  // in the DOM — there is no separate hero layer. At scroll=0 a transform offset
  // makes each one *look* like it's still part of the big hero arrangement; as
  // the pinned section scrolls, that offset eases back to identity. Opacity is
  // never touched on these — only transform (and, for the nav/underline, width)
  // change, so each piece visibly travels to where it really lives rather than
  // one copy fading out while an unrelated copy fades in.
  const nameRef = useRef<HTMLHeadingElement>(null);
  const surnameRef = useRef<HTMLHeadingElement>(null);
  const underlineWrapRef = useRef<HTMLDivElement>(null);
  const underlinePathRef = useRef<SVGPathElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navItemRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const photoRef = useRef<HTMLDivElement>(null);

  // Genuinely new content — not present anywhere in the hero — fades in on its
  // own only after the travelling pieces have settled, per the "don't replace
  // what's already there" rule.
  const descRef = useRef<HTMLParagraphElement>(null);
  const emailRef = useRef<HTMLAnchorElement>(null);

  const leftColumnRef = useRef<HTMLDivElement>(null);
  // leftColumnRef's own top edge sits at the very top of the page regardless
  // of the section's lg:pt-[130vh] padding (padding shifts content inward,
  // not the element's own border-box position) — so a trigger's "content has
  // actually scrolled into view" needs to watch the padded content itself.
  const aboutHeadingRef = useRef<HTMLHeadingElement>(null);

  // Fixed hero chrome (top-left tag, bottom-left scroll hint) — has no final
  // counterpart anywhere in the sidebar, so it simply fades out as the hero
  // starts leaving, rather than travelling anywhere.
  const tagRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLParagraphElement>(null);
  // Appears once the page has scrolled into the left column's content — by
  // then the hero's own left-side chrome has already faded out, so it never
  // shares the screen with the tag/scroll-hint above.
  const backToTopRef = useRef<HTMLAnchorElement>(null);

  const { first, rest } = splitName(profile.name);
  const tag = profile.skills.slice(0, 3).join(" / ").toUpperCase();
  const about = pickLocalized(profile.about);
  const position = profile.currentJobPosition ? pickLocalized(profile.currentJobPosition) : null;

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      const ctx = gsap.context(() => {
        // dasharray "1 3" (not just "1") gives the hidden gap phase 3x the
        // buffer instead of sitting exactly on the dash/gap boundary — with a
        // single-length dasharray, dashoffset:1 sits precisely at the edge of
        // the "off" phase, and any pattern imprecision there renders a small
        // sliver of stroke right at the path's end.
        gsap.set(underlinePathRef.current, { attr: { "stroke-dashoffset": 1, "stroke-dasharray": "1 3" } });

        // --- Hero-frame offsets, computed from real measurements instead of
        // guessed vw/vh values — this reproduces the original hero layout's exact
        // formulas (nav pinned at right:48/top:40, the name+photo row centered at
        // 62% of the viewport height) at whatever the actual viewport size is,
        // rather than approximating it by hand. ---
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        // Measure name/surname at their real final (48px) size first, so the
        // underline's final width can match the widest of the two exactly —
        // otherwise a hardcoded width drifts out of sync with the actual text.
        gsap.set(nameRef.current, { fontSize: 48, x: 0, y: 0 });
        gsap.set(surnameRef.current, { fontSize: 48, x: 0, y: 0 });
        const nameFinalWidth = nameRef.current!.getBoundingClientRect().width;
        const surnameFinalWidth = surnameRef.current?.getBoundingClientRect().width ?? nameFinalWidth;
        const underlineFinalWidth = Math.max(nameFinalWidth, surnameFinalWidth);

        // Photo's height is driven by an explicit number derived from its fixed
        // aspect-[3/4] ratio — not GSAP's "auto" resolution, which depends on the
        // image having already loaded (a race GSAP can lose on first paint) and
        // otherwise resolves against a stale/zero layout, making the photo
        // randomly grow/shrink while scrolling.
        const PHOTO_ASPECT = 3 / 4;
        const PHOTO_HERO_WIDTH = 160;
        const PHOTO_FINAL_WIDTH = 144;
        const photoHeroHeight = PHOTO_HERO_WIDTH / PHOTO_ASPECT;
        const photoFinalHeight = PHOTO_FINAL_WIDTH / PHOTO_ASPECT;

        // Grow each piece to its hero-frame size, in place, so we can measure
        // exactly where it naturally lands at that size before any offset.
        gsap.set(nameRef.current, { fontSize: "9vw", x: 0, y: 0 });
        gsap.set(surnameRef.current, { fontSize: "9vw", x: 0, y: 0 });
        gsap.set(taglineRef.current, { x: 0, y: 0 });
        gsap.set(underlineWrapRef.current, { width: 480, x: 0, y: 0 });
        gsap.set(photoRef.current, { width: PHOTO_HERO_WIDTH, height: photoHeroHeight, x: 0, y: 0 });
        gsap.set(socialRef.current, { x: 0, y: 0 });

        const nameRect = nameRef.current!.getBoundingClientRect();
        const surnameRect = surnameRef.current?.getBoundingClientRect() ?? nameRect;
        const taglineRect = taglineRef.current!.getBoundingClientRect();
        const underlineRect = underlineWrapRef.current!.getBoundingClientRect();
        const photoRect = photoRef.current!.getBoundingClientRect();
        const socialRect = socialRef.current!.getBoundingClientRect();

        // Row layout: name -- gap-10 -- (tagline above / surname) -- gap-8 --
        // photo, centered as a whole within inset-x-12, matching the old
        // absolute inset-x-12 + justify-center row exactly.
        const GAP_NAME_SURNAME = 40; // gap-10
        const GAP_GROUP_PHOTO = 32; // gap-8
        const groupWidth = Math.max(taglineRect.width, surnameRect.width);
        // The underline's hero-state width must span from DANIIL's left edge to
        // TAREEV's right edge — the two sit side by side at this point — not the
        // placeholder width used only to measure its own rect a moment ago.
        const underlineHeroWidth = nameRect.width + GAP_NAME_SURNAME + groupWidth;
        const rowWidth = nameRect.width + GAP_NAME_SURNAME + groupWidth + GAP_GROUP_PHOTO + photoRect.width;
        const rowLeft = vw / 2 - rowWidth / 2;
        const rowCenterY = vh * 0.62; // old: top-[62%] -translate-y-1/2

        const nameTargetLeft = rowLeft;
        const groupTargetLeft = nameTargetLeft + nameRect.width + GAP_NAME_SURNAME;
        const photoTargetLeft = groupTargetLeft + groupWidth + GAP_GROUP_PHOTO;

        // name/surname share a bottom baseline (old row used items-end); photo is
        // centered against the row's own vertical center (items-center).
        const rowBottom = rowCenterY + Math.max(nameRect.height, surnameRect.height) / 2;
        const nameTargetTop = rowBottom - nameRect.height;
        const surnameTargetTop = rowBottom - surnameRect.height;
        const taglineTargetTop = surnameTargetTop - taglineRect.height - 8; // mb-2
        const underlineTargetTop = nameTargetTop + Math.max(nameRect.height, surnameRect.height) + 16; // mt-4
        const photoTargetTop = rowCenterY - photoRect.height / 2;

        gsap.set(nameRef.current, { x: nameTargetLeft - nameRect.left, y: nameTargetTop - nameRect.top });
        gsap.set(surnameRef.current, {
          x: groupTargetLeft - surnameRect.left,
          y: surnameTargetTop - surnameRect.top,
        });
        gsap.set(taglineRef.current, {
          x: groupTargetLeft - taglineRect.left,
          y: taglineTargetTop - taglineRect.top,
        });
        // The underline is right-aligned (ml-auto), so its right edge — not its
        // left edge — is the stable reference point when the width is also
        // about to change in this same call; deriving the offset from the old
        // (pre-resize) left edge would land it short by exactly the width delta.
        const underlineNaturalRight = underlineRect.left + underlineRect.width;
        gsap.set(underlineWrapRef.current, {
          x: nameTargetLeft - (underlineNaturalRight - underlineHeroWidth),
          y: underlineTargetTop - underlineRect.top,
          width: underlineHeroWidth,
        });
        gsap.set(photoRef.current, {
          x: photoTargetLeft - photoRect.left,
          y: photoTargetTop - photoRect.top,
        });

        // Social: pinned at the same bottom:40/right:48 corner it always sat at.
        const socialTargetLeft = vw - 48 - socialRect.width;
        const socialTargetTop = vh - 40 - socialRect.height;
        gsap.set(socialRef.current, {
          x: socialTargetLeft - socialRect.left,
          y: socialTargetTop - socialRect.top,
        });

        // Nav items — each is its own frame. The <nav> container never moves or
        // resizes; it's already sitting in its real, final wrapped position (its
        // place is "reserved" from frame one). Only the items get a transform,
        // laid out right-to-left as a single row pinned at right:48/top:40 —
        // matching the old fixed hero nav — then eased back to identity so each
        // one visibly travels into its own spot in the wrapped grid.
        const navItems = navItemRefs.current.filter((el): el is HTMLSpanElement => el !== null);
        const NAV_GAP = vw >= 1280 ? 24 : 16; // gap-x-6 : gap-x-4
        const navItemRects = navItems.map((el) => el.getBoundingClientRect());
        const navRowWidth =
          navItemRects.reduce((sum, r) => sum + r.width, 0) + NAV_GAP * Math.max(navItemRects.length - 1, 0);
        let navCursor = vw - 48 - navRowWidth;
        navItems.forEach((el, i) => {
          const rect = navItemRects[i];
          gsap.set(el, { x: navCursor - rect.left, y: 40 - rect.top });
          navCursor += rect.width + NAV_GAP;
        });

        gsap.set([descRef.current, emailRef.current], { autoAlpha: 0, y: 16 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "+=130%",
            // A lighter scrub lag than before — Lenis already smooths the raw
            // scroll input, so stacking a full 1s GSAP catch-up on top of that
            // made fast-resizing pieces (the photo especially) visibly wobble/
            // overshoot instead of tracking the scroll directly.
            scrub: 0.3,
          },
        });

        // The underline draws in completely on its own first — nothing else
        // starts moving until it's fully drawn. Every other tween below is
        // scheduled at LINE_DRAWN-or-later, so this single constant gates the
        // whole timeline; a bigger value gives the draw more room to read as
        // its own deliberate beat before anything starts travelling.
        const LINE_DRAWN = 0.32;

        tl.to(underlinePathRef.current, { attr: { "stroke-dashoffset": 0 }, ease: "none", duration: LINE_DRAWN }, 0)
          .to(taglineRef.current, { autoAlpha: 0, y: "-=20", duration: 0.15 }, LINE_DRAWN)
          // Fixed hero chrome (top-left tag, bottom-left scroll hint) has nowhere
          // to travel to, so it just fades out as the hero starts leaving.
          .to([tagRef.current, scrollHintRef.current], { autoAlpha: 0, duration: 0.2 }, LINE_DRAWN)
          // Name and surname travel independently — surname lags a touch behind
          // name for a slight, non-mechanical depth effect.
          .to(nameRef.current, { x: 0, y: 0, fontSize: 48, ease: "power2.out", duration: 0.5 }, LINE_DRAWN + 0.02)
          .to(surnameRef.current, { x: 0, y: 0, fontSize: 48, ease: "power2.out", duration: 0.5 }, LINE_DRAWN + 0.06)
          .to(
            underlineWrapRef.current,
            { x: 0, y: 0, width: underlineFinalWidth, ease: "power2.out", duration: 0.5 },
            LINE_DRAWN + 0.04
          )
          // Photo shrinks and travels as its own element, roughly alongside the name.
          .to(
            photoRef.current,
            { x: 0, y: 0, width: PHOTO_FINAL_WIDTH, height: photoFinalHeight, ease: "power2.out", duration: 0.5 },
            LINE_DRAWN + 0.05
          )
          // Social links were already visible at the hero's bottom — they start
          // travelling at the same moment as everything else (no dead pause before
          // they move), but ease in slowly so most of their motion lands after the
          // nav has cleared out of the way, avoiding a visible collision.
          .to(socialRef.current, { x: 0, y: 0, ease: "power3.in", duration: 0.9 }, LINE_DRAWN + 0.06)
          .to(descRef.current, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.25 }, LINE_DRAWN + 1.1)
          .to(emailRef.current, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.25 }, LINE_DRAWN + 1.2);

        // Each nav item is its own frame with a wide staggered start and a short
        // duration, so they arrive one after another — only one or two ever in
        // flight together — instead of all four converging on the same small
        // final cluster at once.
        navItems.forEach((el, i) => {
          tl.to(el, { x: 0, y: 0, ease: "power2.out", duration: 0.4 }, LINE_DRAWN + 0.06 + i * 0.1);
        });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: sidebarRef.current,
        });

        // Left column (headline/stats/about/projects) is a normal scrolling column
        // that starts below the hero's settle point — its own light, non-scrubbed
        // reveal fires once when it naturally scrolls into view.
        gsap.set(leftColumnRef.current, { autoAlpha: 0, y: 30 });
        gsap.timeline({
          scrollTrigger: { trigger: leftColumnRef.current, start: "top 90%" },
        }).to(leftColumnRef.current, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.6 });

        // "Back to top" fades in once the left column's content has actually
        // scrolled into view (watching the padded heading itself, not the
        // column's own top edge — see the comment on aboutHeadingRef) — well
        // after the hero's own tag/scroll-hint have already faded out, so it
        // never overlaps them — and fades back out if the user scrolls back
        // up past that point.
        gsap.set(backToTopRef.current, { autoAlpha: 0 });
        gsap.timeline({
          scrollTrigger: {
            trigger: aboutHeadingRef.current,
            start: "top 90%",
            toggleActions: "play none none reverse",
          },
        }).to(backToTopRef.current, { autoAlpha: 1, duration: 0.4 });
      }, sectionRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, []);

  return (
    <div id="top" ref={sectionRef} className="lg:grid lg:grid-cols-2 lg:items-start">
      {tag && (
        <div
          ref={tagRef}
          className="px-6 pt-10 sm:px-12 lg:fixed lg:left-12 lg:top-10 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mt-2 lg:pt-2"
        >
          <p className="text-xs tracking-[0.25em] text-[#8a8378]">{tag}</p>
          <p className="mt-1 text-xs tracking-[0.15em] text-[#5c584f]">INDEX — ПОРТФОЛИО / {new Date().getFullYear()}</p>
        </div>
      )}

      <div ref={sidebarRef} className="lg:col-start-2 lg:row-start-1 lg:h-screen">
        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-16 sm:px-12 lg:items-end lg:gap-3 lg:py-10">
          {/* Mobile-only static hero (no scroll animation below lg) */}
          <div className="flex flex-col items-center gap-6 lg:hidden">
            <p className="font-hand text-2xl text-[#8a8378] sm:text-3xl">живые интерфейсы</p>
            <div className="flex min-w-0 items-end gap-3">
              <div className="min-w-0">
                <h1 className="break-words font-display text-[13vw] uppercase leading-[0.85] tracking-tight sm:text-[10vw]">
                  <span className="block text-[#ece5d6]">{first || "—"}</span>
                  {rest && <span className="block text-[#e2451f]">{rest}</span>}
                </h1>
                <ScribbleUnderline className="mt-4 h-3 w-32 text-[#ece5d6] sm:h-4 sm:w-44" />
              </div>
              <div className="w-16 shrink-0 overflow-hidden rounded-lg border border-[#3a372f] sm:w-24">
                <ProfilePhoto avatar={profile.avatar} name={profile.name} />
              </div>
            </div>
          </div>

          {/* Desktop name group — real final position; GSAP only ever animates
              transform/opacity on top of this layout, never toggles visibility. */}
          <div className="relative hidden text-right lg:block">
            <p ref={taglineRef} className="absolute -top-10 right-0 whitespace-nowrap font-hand text-2xl text-[#8a8378]">
              ↙ живые интерфейсы
            </p>
            <h1
              ref={nameRef}
              className="ml-auto w-max font-display text-5xl uppercase leading-[0.9] tracking-tight text-[#ece5d6]"
            >
              {first || "—"}
            </h1>
            {rest && (
              <h1
                ref={surnameRef}
                className="ml-auto w-max font-display text-5xl uppercase leading-[0.9] tracking-tight text-[#e2451f]"
              >
                {rest}
              </h1>
            )}
            <div ref={underlineWrapRef} className="ml-auto mt-4">
              <ScribbleUnderline ref={underlinePathRef} className="h-4 w-full text-[#ece5d6]" />
            </div>
          </div>

          <div
            ref={photoRef}
            className="hidden aspect-[3/4] w-36 shrink-0 overflow-hidden rounded-lg border border-[#3a372f] lg:block"
          >
            <ProfilePhoto avatar={profile.avatar} name={profile.name} />
          </div>

          <div ref={socialRef} className="flex gap-4 text-xs tracking-[0.15em] text-[#8a8378]">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="hover:text-[#ece5d6]">
                {link.label.toUpperCase()} ↗
              </a>
            ))}
          </div>

          {(position || profile.currentJobCompany) && (
            <p ref={descRef} className="text-center text-sm text-[#b8b1a3] lg:text-right">
              {position}
              {profile.currentJobCompany ? ` · ${profile.currentJobCompany}` : ""}
            </p>
          )}

          <nav
            ref={navRef}
            className="flex max-w-xs flex-wrap justify-center gap-x-4 gap-y-2 text-base tracking-[0.05em] text-[#8a8378] sm:max-w-md sm:gap-x-6 lg:w-80 lg:max-w-none lg:justify-end lg:text-lg xl:text-[28px]"
          >
            {NAV_ITEMS.map((item, index) => (
              <span
                key={item.href}
                ref={(el) => {
                  navItemRefs.current[index] = el;
                }}
                className="inline-block"
              >
                <NavLink href={item.href}>
                  <span className="text-[0.67em] text-[#e2451f]">{String(index + 1).padStart(2, "0")}</span>{" "}
                  {item.label.toUpperCase()}
                </NavLink>
              </span>
            ))}
          </nav>

          <a
            ref={emailRef}
            href="mailto:dtareev123@gmail.com"
            className="text-sm text-[#ece5d6] underline underline-offset-4"
          >
            dtareev123@gmail.com
          </a>
        </div>
      </div>

      <p
        ref={scrollHintRef}
        className="px-6 pb-10 font-hand text-xl text-[#8a8378] sm:px-12 lg:fixed lg:bottom-10 lg:left-12 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mb-2 lg:pb-2"
      >
        Листай вниз ↓
      </p>

      <a
        ref={backToTopRef}
        href="#top"
        className="group hidden lg:fixed lg:left-12 lg:top-32 lg:z-10 lg:-ml-3 lg:flex lg:flex-col lg:items-center lg:gap-2 lg:bg-[#141312] lg:px-3 lg:py-3 lg:text-[#8a8378] lg:transition-colors lg:hover:text-[#ece5d6]"
      >
        <span
          aria-hidden="true"
          className="text-base leading-none transition-transform duration-200 group-hover:-translate-y-1"
        >
          ↑
        </span>
        <span className="text-xs tracking-[0.25em] [writing-mode:vertical-rl]">НАВЕРХ</span>
      </a>

      {/* lg:pl-20 reserves a permanent left gutter so the fixed "back to top"
          rail never sits on top of scrolling content (project images etc). */}
      <div ref={leftColumnRef} className="lg:col-start-1 lg:row-start-1 lg:pl-20">
        {/* id lives on the heading, not the section — the section's own
            border-box top sits at the very top of the page regardless of its
            lg:pt-[130vh] padding (padding shifts content inward, not the
            element's own position), so an #about anchor jump there would land
            back at the hero instead of at the actual visible content. */}
        <section className="border-t border-[#2a2824] px-6 py-24 sm:px-12 lg:border-t-0 lg:pt-[130vh]">
          <h2 id="about" ref={aboutHeadingRef} className="font-display text-4xl leading-[1.05] text-[#ece5d6] sm:text-5xl">
            Создаю интерфейсы,
            <br />
            <span className="text-[#e2451f]">которые работают</span>
          </h2>
          <p className="mt-4 max-w-md text-[#b8b1a3]">
            Разрабатываю быстрые, аккуратные продукты — от идеи до продакшена.
          </p>

          <div className="mt-10 flex flex-wrap gap-x-12 gap-y-6">
            <div>
              <span className="font-hand text-xl text-[#e2451f]">↗</span>
              <p className="font-display text-4xl text-[#ece5d6]">3+</p>
              <p className="text-xs tracking-[0.15em] text-[#8a8378]">ГОДА ОПЫТА</p>
            </div>
            <div>
              <p className="font-display text-4xl text-[#ece5d6]">{profile.skills.length}+</p>
              <p className="text-xs tracking-[0.15em] text-[#8a8378]">ТЕХНОЛОГИЙ</p>
            </div>
            <div>
              <p className="font-display text-4xl text-[#ece5d6]">{projects.length}</p>
              <p className="text-xs tracking-[0.15em] text-[#8a8378]">ПРОЕКТА</p>
            </div>
          </div>

          <div className="mt-16 border-t border-[#2a2824] pt-16">
            <p className="text-xs tracking-[0.25em] text-[#8a8378]">ОБО МНЕ</p>
            <p className="mt-6 max-w-xl text-3xl leading-[1.15] text-[#ece5d6] sm:text-4xl">{about}</p>
            {profile.skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {profile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-[#3a372f] px-3 py-1 text-xs tracking-wide text-[#b8b1a3]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>

        <div id="projects">
          <ProjectsGrid projects={projects} />
        </div>

        <section id="contact" className="border-t border-[#2a2824] px-6 py-24 sm:px-12">
          <p className="text-xs tracking-[0.25em] text-[#8a8378]">КОНТАКТЫ</p>
          <a
            href="mailto:dtareev123@gmail.com"
            className="mt-6 block break-all font-display text-2xl text-[#ece5d6] hover:text-[#e2451f] sm:text-3xl lg:text-4xl"
          >
            dtareev123@gmail.com
          </a>
        </section>
      </div>
    </div>
  );
}
