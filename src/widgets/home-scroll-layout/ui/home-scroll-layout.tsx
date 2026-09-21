"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Profile } from "@/entities/profile/model/types";
import type { Project } from "@/entities/project/model/types";
import { ProfilePhoto } from "@/entities/profile/ui/profile-photo";
import { NAV_ITEMS } from "@/shared/config/nav-items";
import { SOCIAL_LINKS } from "@/shared/config/social-links";
import { TAGLINE_PHRASES } from "@/shared/config/tagline-phrases";
import { pickLocalized } from "@/shared/lib/localized-text";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";
import { splitName } from "@/shared/lib/split-name";
import { NavLink } from "@/shared/ui/nav-link";
import { ScribbleUnderline } from "@/shared/ui/scribble-underline";
import { SectionLabel } from "@/shared/ui/section-label";
import { TypewriterText } from "@/shared/ui/typewriter-text";
import { ExperienceTimeline } from "@/widgets/experience-timeline/ui/experience-timeline";
import { ProjectsGrid } from "@/widgets/projects-grid/ui/projects-grid";

gsap.registerPlugin(ScrollTrigger, SplitText);

// Uppercase text renders "i" as a dotless capital I, swallowing the dot — this
// stands two decorative dots back in above the first "ii" it finds. Each dot
// is two nested elements: an outer "wrap" (pushed around by the mouse) and an
// inner "dot" (driven by the idle leapfrog timeline) — nesting them lets both
// animations apply independently and compose visually instead of fighting
// over the same transform. Color matches the surrounding text (bg-current).
function NameWithDots({
  text,
  dotWrapRefs,
  dotRefs,
}: {
  text: string;
  dotWrapRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  dotRefs: React.MutableRefObject<(HTMLSpanElement | null)[]>;
}) {
  const match = text.match(/ii/i);
  if (!match || match.index === undefined) return <>{text}</>;
  const start = match.index;
  const before = text.slice(0, start);
  const after = text.slice(start + 2);
  return (
    <>
      {before}
      {[0, 1].map((i) => (
        <span key={i} className="relative inline-block">
          i
          <span
            ref={(el) => {
              dotWrapRefs.current[i] = el;
            }}
            aria-hidden="true"
            className="absolute top-[-0.55em] left-1/2 h-[0.16em] w-[0.16em]"
            style={{ marginLeft: "-0.08em" }}
          >
            <span
              ref={(el) => {
                dotRefs.current[i] = el;
              }}
              className="block h-full w-full rounded-full bg-current"
            />
          </span>
        </span>
      ))}
      {after}
    </>
  );
}

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
  // The two decorative dots above "ii" — see NameWithDots.
  const dotWrapRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
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

  // Stats block (heading + subtitle + the 3 metrics right below it) — a
  // single cascading reveal played once, the first time it scrolls into
  // view. aboutHeadingRef doubles as the split-text target; these cover the
  // rest of the block.
  const statsSubtitleRef = useRef<HTMLParagraphElement>(null);

  // Fixed hero chrome (top-left tag, bottom-left scroll hint) — has no final
  // counterpart anywhere in the sidebar, so it simply fades out as the hero
  // starts leaving, rather than travelling anywhere.
  const tagRef = useRef<HTMLDivElement>(null);
  const scrollHintRef = useRef<HTMLParagraphElement>(null);
  // Appears once the page has scrolled into the left column's content — by
  // then the hero's own left-side chrome has already faded out, so it never
  // shares the screen with the tag/scroll-hint above.
  const backToTopRef = useRef<HTMLAnchorElement>(null);

  const lenisRef = useLenis();
  // Native/CSS smooth-scroll fights Lenis's own animation loop while it's
  // still settling from the last scroll, making the click feel dead until it
  // stops — routing through Lenis's own scrollTo keeps it responsive no
  // matter what Lenis is doing when the click happens.
  function handleBackToTopClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const lenis = lenisRef?.current;
    if (!lenis) return;
    e.preventDefault();
    lenis.scrollTo("#top");
  }

  const { first, rest } = splitName(profile.name);
  const tag = profile.skills.slice(0, 3).join(" / ").toUpperCase();
  const about = pickLocalized(profile.about);
  const position = profile.currentJobPosition ? pickLocalized(profile.currentJobPosition) : null;

  // useLayoutEffect (not useEffect) — this sets every element's hero-frame
  // starting position via gsap.set. With useEffect, the browser paints the
  // elements' plain CSS (final/settled) layout first, then this runs a frame
  // later and snaps them to the hero look — a visible flash of the wrong
  // layout on every load. useLayoutEffect runs before that first paint.
  useLayoutEffect(() => {
    const mm = gsap.matchMedia();

    mm.add("(min-width: 1024px)", () => {
      // Declared here (not inside the gsap.context callback below) so the
      // cleanup at the bottom of this function — which runs outside that
      // callback's scope — can still reach them to remove the listener/ticker.
      let onDotsMouseMove: ((e: MouseEvent) => void) | null = null;
      let dotsTicker: (() => void) | null = null;
      // SplitText mutates the DOM (wraps words in masking spans) — gsap.context's
      // revert() only undoes animations/ScrollTriggers it created, not that DOM
      // surgery, so this needs its own explicit revert() in cleanup below.
      let headingSplit: SplitText | null = null;
      let ctx: gsap.Context | null = null;
      let cancelled = false;
      let transitioning = false;
      let navigationRequested = false;
      const onAnchorClick = (event: MouseEvent) => {
        const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
        if (link) navigationRequested = link.getAttribute("href") !== "#top";
      };
      sectionRef.current?.addEventListener("click", onAnchorClick, true);
      const transitionRoot = sectionRef.current;
      let scrollTween: gsap.core.Tween | null = null;

      function setup() {
        if (cancelled) return;
        ctx = gsap.context(() => {
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

        // The sidebar/tag/scroll-hint default to invisible (lg:invisible in
        // the JSX) precisely so the server-rendered markup — final-size text,
        // final photo size, a fully visible back-to-top button — is never
        // painted for that first frame before this effect has run: the
        // browser paints the raw SSR HTML well before the JS bundle finishes
        // loading/hydrating, a gap useLayoutEffect alone can't close since it
        // only prevents a flash *between* React commits, not before the very
        // first one. Revealing only now, after every piece above has already
        // been snapped into its correct hero-frame position, means the very
        // first visible frame is already the finished hero arrangement.
        gsap.set([sidebarRef.current, tagRef.current, scrollHintRef.current], { autoAlpha: 1 });

        // The scroll gesture only draws the underline. Once complete, the
        // assembly runs on its own clock, independent of further wheel input.
        const tl = gsap.timeline({ paused: true });
        const LINE_DRAWN = 0;

        tl          .to(taglineRef.current, { autoAlpha: 0, y: "-=20", duration: 0.15 }, LINE_DRAWN)
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

        let assembled = false;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const contentTop = () => {
          const label = aboutHeadingRef.current?.previousElementSibling;
          return Math.max(0, (label?.getBoundingClientRect().top ?? 0) + window.scrollY - 96);
        };
        const duration = reducedMotion ? 0 : 1.1;
        const movePage = (target: number, onComplete: () => void) => {
          scrollTween?.kill();
          const lenis = lenisRef?.current;
          if (lenis) {
            lenis.scrollTo(target, {
              duration,
              immediate: reducedMotion,
              lock: true,
              force: true,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
              onComplete,
            });
          } else {
            const position = { y: window.scrollY };
            scrollTween = gsap.to(position, {
              y: target, duration, ease: "power2.out",
              onUpdate: () => window.scrollTo(0, position.y),
              onComplete,
            });
          }
        };
        const assemble = () => {
          if (assembled || transitioning || cancelled) return;
          assembled = true;
          const target = contentTop();
          // A direct link to projects/contact must keep its own destination.
          if (navigationRequested || window.scrollY >= target - 8) {
            tl.progress(1).pause();
            return;
          }
          transitioning = true;
          if (reducedMotion) tl.progress(1).pause();
          else tl.timeScale(tl.duration() / duration).play(0);
          movePage(target, () => { transitioning = false; });
        };
        const returnToHero = () => {
          if (!assembled || transitioning || cancelled) return;
          transitioning = true;
          navigationRequested = false;
          if (reducedMotion) tl.pause(0);
          else tl.timeScale(tl.duration() / duration).reverse();
          movePage(0, () => {
            tl.pause(0);
            assembled = false;
            transitioning = false;
          });
        };
        // A small dead zone below the landing point prevents a refresh or
        // subpixel rounding from immediately reversing the forward transition.
        // Ordinary upward scrolling inside the content remains untouched.
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: () => Math.max(1, contentTop() - 16),
          end: "+=1",
          onLeaveBack: returnToHero,
        });
        gsap.to(underlinePathRef.current, {
          attr: { "stroke-dashoffset": 0 },
          ease: "none",
          onComplete: assemble,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${window.innerHeight * 0.22}`,
            scrub: reducedMotion ? true : 0.15,
            onUpdate: (self) => {
              // Returning fully to the hero re-arms the next transition.
              if (self.scroll() <= 1 && assembled && !transitioning) {
                assembled = false;
                navigationRequested = false;
                tl.pause(0);
              }
            },
          },
        });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: sidebarRef.current,
        });

        // Images (project covers, the profile photo) and web fonts can still be
        // loading when this effect first runs, so the page's real height isn't
        // known yet — ScrollTrigger's "bottom bottom" end gets calculated short,
        // and correcting it later (once everything's actually loaded) unpins and
        // re-pins the sidebar right at the bottom of the page, which reads as a
        // jerk. Refreshing once loading has genuinely finished fixes the end
        // value before that boundary can ever be reached.
        const refresh = () => ScrollTrigger.refresh();
        if (document.readyState === "complete") {
          refresh();
        } else {
          window.addEventListener("load", refresh, { once: true });
        }

        // Left column (headline/stats/about/projects) is a normal scrolling column
        // that starts below the hero's settle point — its own light, non-scrubbed
        // reveal fires once when it naturally scrolls into view.
        gsap.set(leftColumnRef.current, { autoAlpha: 0 });
        gsap.timeline({
          scrollTrigger: { trigger: aboutHeadingRef.current, start: "top 95%", once: true },
        }).to(leftColumnRef.current, { autoAlpha: 1, ease: "power2.out", duration: 0.6 });

        // Heading and subtitle enter together; AboutStats owns the metrics animation.
        headingSplit = aboutHeadingRef.current
          ? SplitText.create(aboutHeadingRef.current, { type: "words", mask: "words" })
          : null;

        if (headingSplit) gsap.set(headingSplit.words, { yPercent: 110 });
        gsap.set(statsSubtitleRef.current, { autoAlpha: 0, y: 24 });

        const statsTl = gsap.timeline({
          scrollTrigger: { trigger: aboutHeadingRef.current, start: "top 85%", once: true },
        });

        let statsCursor = 0;

        if (headingSplit) {
          statsTl.to(
            headingSplit.words,
            { yPercent: 0, duration: 0.7, ease: "power3.out", stagger: 0.05 },
            statsCursor
          );
          statsCursor += 0.35; // next piece starts before the split finishes settling
        }

        statsTl.to(
          statsSubtitleRef.current,
          { autoAlpha: 1, y: 0, duration: 0.5, ease: "power2.out" },
          statsCursor
        );
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

        // --- Decorative "ii" dots: a measured leapfrog hop, one dot at a time,
        // plus a subtle mouse-pull — active only while genuinely at the very
        // top of the hero. ---
        const dot0 = dotRefs.current[0];
        const dot1 = dotRefs.current[1];
        const wrap0 = dotWrapRefs.current[0];
        const wrap1 = dotWrapRefs.current[1];

        if (dot0 && dot1 && wrap0 && wrap1) {
          // A genuine swap always requires one dot to land exactly where the
          // other currently sits — no amount of stagger timing avoids a
          // collision right at that landing instant. Simpler and reliably
          // collision-free: each dot only ever hops straight up in place,
          // taking turns, and never changes its own horizontal anchor.
          // "bounce.out" on the landing half gives each hop a real ricochet —
          // the dot overshoots the baseline and settles through a couple of
          // shrinking rebounds instead of just easing straight down.
          const HOP = 14;
          const UP_DURATION = 0.22;
          const LAND_DURATION = 0.42;
          const GAP = 0.16;
          const leapfrogTl = gsap.timeline({ repeat: -1, paused: true });
          leapfrogTl
            .to(dot0, { y: -HOP, duration: UP_DURATION, ease: "power2.out" })
            .to(dot0, { y: 0, duration: LAND_DURATION, ease: "bounce.out" })
            .to(dot1, { y: -HOP, duration: UP_DURATION, ease: "power2.out" }, `+=${GAP}`)
            .to(dot1, { y: 0, duration: LAND_DURATION, ease: "bounce.out" });

          // Dots flee the cursor instead of chasing it — and the longer the
          // cursor keeps hovering near one, the further it keeps creeping
          // away (an accumulator that builds up while the cursor is close),
          // strongly enough to shove a dot clean off-screen if chased, and
          // eases back to rest once the cursor moves off.
          const MAX_FLEE = Math.max(window.innerWidth, window.innerHeight); // strong enough to clear the viewport
          const FLEE_RADIUS = 110;
          const BUILD_PER_SEC = 260; // px/sec of drift growth while hovered, closer = faster
          const DECAY_PER_SEC = 1.6; // exponential ease-back rate once the cursor leaves

          const pullX0 = gsap.quickTo(wrap0, "x", { duration: 0.35, ease: "power2.out" });
          const pullY0 = gsap.quickTo(wrap0, "y", { duration: 0.35, ease: "power2.out" });
          const pullX1 = gsap.quickTo(wrap1, "x", { duration: 0.35, ease: "power2.out" });
          const pullY1 = gsap.quickTo(wrap1, "y", { duration: 0.35, ease: "power2.out" });

          let heroActive = true;
          let mouseX = -9999;
          let mouseY = -9999;
          const flee0 = { x: 0, y: 0 };
          const flee1 = { x: 0, y: 0 };

          onDotsMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
          };
          window.addEventListener("mousemove", onDotsMouseMove);

          // Runs every frame (not just on mousemove) so "holding the cursor
          // still near a dot" keeps building the drift over time too, not
          // only while the cursor is actively moving.
          let lastT = performance.now();
          dotsTicker = () => {
            const now = performance.now();
            const dt = Math.min((now - lastT) / 1000, 0.05);
            lastT = now;
            if (!heroActive) return;

            const step = (dot: HTMLSpanElement, flee: { x: number; y: number }, qx: typeof pullX0, qy: typeof pullY0) => {
              const rect = dot.getBoundingClientRect();
              const cx = rect.left + rect.width / 2;
              const cy = rect.top + rect.height / 2;
              const dxm = mouseX - cx;
              const dym = mouseY - cy;
              const dist = Math.hypot(dxm, dym);
              if (dist < FLEE_RADIUS && dist > 0.01) {
                const nx = -dxm / dist;
                const ny = -dym / dist;
                const closeness = 1 - dist / FLEE_RADIUS;
                flee.x += nx * BUILD_PER_SEC * closeness * dt;
                flee.y += ny * BUILD_PER_SEC * closeness * dt;
                const mag = Math.hypot(flee.x, flee.y);
                if (mag > MAX_FLEE) {
                  flee.x = (flee.x / mag) * MAX_FLEE;
                  flee.y = (flee.y / mag) * MAX_FLEE;
                }
              } else {
                const decay = Math.exp(-DECAY_PER_SEC * dt);
                flee.x *= decay;
                flee.y *= decay;
                if (Math.hypot(flee.x, flee.y) < 0.05) {
                  flee.x = 0;
                  flee.y = 0;
                }
              }
              qx(flee.x);
              qy(flee.y);
            };
            step(dot0, flee0, pullX0, pullY0);
            step(dot1, flee1, pullX1, pullY1);
          };
          gsap.ticker.add(dotsTicker);

          // The hop keeps playing everywhere on the page — only the mouse
          // repel is hero-only. Leaving the very top just stops the cursor
          // from being tracked and resets the *repel* offset (the wrap), never
          // touching dot0/dot1 — those belong entirely to leapfrogTl, which
          // keeps running the whole time, so killing tweens on them here would
          // also kill the hop itself.
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top top",
            end: "+=1",
            onLeave: () => {
              // Set the flag first, then hand the reset to 0 back to the
              // quickTo functions themselves rather than fighting them with
              // gsap.killTweensOf/gsap.set — quickTo reuses one internal tween
              // per call, and externally killing that tween leaves it broken
              // for good: every later call silently no-ops, which is why the
              // repel used to permanently stop working after the first scroll
              // away and back. Calling pullX0(0) etc. retargets that same
              // internal tween the way it's meant to be driven.
              heroActive = false;
              flee0.x = 0;
              flee0.y = 0;
              flee1.x = 0;
              flee1.y = 0;
              pullX0(0);
              pullY0(0);
              pullX1(0);
              pullY1(0);
            },
            onEnterBack: () => {
              heroActive = true;
            },
          });

          leapfrogTl.play();
        }
        }, sectionRef);
      }

      // Every measurement above (name/surname widths, underline sizing, nav
      // item positions, the pin's own "bottom bottom" end) is only correct
      // once the real custom fonts (Unbounded/Neucha, not the fallback
      // they're swapped in for) are what's actually rendered — otherwise
      // this runs once against fallback-font metrics, and the later
      // ScrollTrigger.refresh() below has to visibly correct the page's
      // height/positions once the real font swaps in, which is what read as
      // a jerk + the scrollbar jumping right after load (worse the more
      // text there is to reflow, e.g. after the About bio got longer).
      // Everything's already hidden via lg:invisible in the JSX until this
      // runs, so waiting here costs nothing visible — it just guarantees a
      // single, correct measurement pass instead of a visible correction.
      if (document.fonts?.status === "loaded") {
        setup();
      } else if (document.fonts?.ready) {
        document.fonts.ready.then(setup);
      } else {
        setup();
      }

      return () => {
        cancelled = true;
        transitionRoot?.removeEventListener("click", onAnchorClick, true);
        scrollTween?.kill();
        if (transitioning) lenisRef?.current?.start();
        ctx?.revert();
        if (onDotsMouseMove) window.removeEventListener("mousemove", onDotsMouseMove);
        if (dotsTicker) gsap.ticker.remove(dotsTicker);
        headingSplit?.revert();
      };
    });

    return () => mm.revert();
    // profile.skills.length/projects.length are the only prop values read
    // inside this effect (for the stat targets) — everything else the effect
    // touches is either a ref or module-scope config, so this pair is the
    // full, accurate dependency list despite the effect's size.
  }, [profile.skills.length, projects.length, lenisRef]);

  return (
    <div id="top" ref={sectionRef} className="lg:grid lg:grid-cols-2 lg:items-start">
      {tag && (
        <div
          ref={tagRef}
          className="px-6 pt-10 sm:px-12 lg:invisible lg:fixed lg:left-12 lg:top-10 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mt-2 lg:pt-2"
        >
          <p className="text-xs tracking-[0.25em] text-[#8a8378]">{tag}</p>
          <p className="mt-1 text-xs tracking-[0.15em] text-[#5c584f]">INDEX — ПОРТФОЛИО / {new Date().getFullYear()}</p>
        </div>
      )}

      {/* lg:z-20 — z-index only ever competes within the same stacking level,
          so the name-group's z-30 (below) only won against its OWN siblings
          (photo, nav…) inside here; sidebarRef itself had no z-index, so the
          whole pinned subtree — dots included — was still stacking below
          sibling fixed chrome like the tag/scroll-hint (z-10) whenever a dot
          flew near them. */}
      <div ref={sidebarRef} className="lg:invisible lg:z-20 lg:col-start-2 lg:row-start-1 lg:h-screen">
        <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-16 sm:px-12 lg:items-end lg:gap-3 lg:py-10">
          {/* Mobile-only static hero (no scroll animation below lg) */}
          <div className="flex flex-col items-center gap-6 lg:hidden">
            <p className="font-hand text-2xl text-[#8a8378] sm:text-3xl">
              <TypewriterText phrases={TAGLINE_PHRASES} />
            </p>
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
          {/* z-30 — the "ii" dots live inside this group and can fly well
              outside the name's own footprint via the mouse-repel; without an
              explicit stacking order here they'd paint underneath whichever
              later sibling (photo, nav, social…) they happened to cross. */}
          <div className="relative z-30 hidden text-right lg:block">
            <p ref={taglineRef} className="absolute -top-10 right-0 whitespace-nowrap font-hand text-2xl text-[#8a8378]">
              <span className="inline-block" style={{ animation: "arrow-bounce 1.6s ease-in-out infinite" }}>
                ↙
              </span>{" "}
              <TypewriterText phrases={TAGLINE_PHRASES} />
            </p>
            <h1
              ref={nameRef}
              className="ml-auto w-max font-display text-5xl uppercase leading-[0.9] tracking-tight text-[#ece5d6]"
            >
              <NameWithDots text={first || "—"} dotWrapRefs={dotWrapRefs} dotRefs={dotRefs} />
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
        className="px-6 pb-10 font-hand text-xl text-[#8a8378] sm:px-12 lg:invisible lg:fixed lg:bottom-10 lg:left-12 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mb-2 lg:pb-2"
      >
        Листай вниз ↓
      </p>

      <a
        ref={backToTopRef}
        href="#top"
        onClick={handleBackToTopClick}
        className="group hidden lg:invisible lg:fixed lg:left-12 lg:top-32 lg:z-10 lg:-ml-3 lg:flex lg:flex-col lg:items-center lg:gap-2 lg:bg-[#141312] lg:px-3 lg:py-3 lg:text-[#8a8378] lg:transition-colors lg:hover:text-[#ece5d6]"
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
          <SectionLabel>ОБО МНЕ</SectionLabel>
          <h2
            id="about"
            ref={aboutHeadingRef}
            className="mt-6 font-display text-4xl leading-[1.05] text-[#ece5d6] sm:text-5xl"
          >
            Создаю интерфейсы,
            <br />
            <span className="text-[#e2451f]">которые работают</span>
          </h2>
          <p ref={statsSubtitleRef} className="mt-4 max-w-md text-[#b8b1a3]">
            Разрабатываю быстрые, аккуратные продукты — от идеи до продакшена.
          </p>

          {/* AboutStats ("Опыт разработки" card) removed for now — user didn't
              like how it looked; widget file kept as-is in case it comes back. */}

          <div className="mt-16 border-t border-[#2a2824] pt-16">
            <div className="max-w-xl space-y-4 text-3xl leading-[1.15] text-[#ece5d6] sm:text-4xl">
              {about.split(/\n{2,}/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            {profile.skills.length > 0 && (
              <div id="skills" className="mt-6 flex flex-wrap gap-2">
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

        {profile.experience.length > 0 && (
          <section id="experience" className="border-t border-[#2a2824] px-6 py-24 sm:px-12">
            <SectionLabel>ОПЫТ</SectionLabel>
            <h2 className="mt-6 font-display text-3xl text-[#ece5d6] sm:text-4xl">Мой путь</h2>
            <ExperienceTimeline items={profile.experience} />
          </section>
        )}

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
