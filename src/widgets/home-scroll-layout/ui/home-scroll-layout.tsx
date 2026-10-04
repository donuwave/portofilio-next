"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { Profile } from "@/entities/profile/model/types";
import type { Project } from "@/entities/project/model/types";
import { ProfilePhoto } from "@/entities/profile/ui/profile-photo";
import { NAV_ITEMS } from "@/shared/config/nav-items";
import { SOCIAL_LINKS } from "@/shared/config/social-links";
import { useCookieConsent } from "@/features/cookie-consent/ui/cookie-consent";
import { useDictionary, useLocale, useLocalizedPath } from "@/shared/i18n/locale-provider";
import { pickLocalized } from "@/shared/lib/localized-text";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";
import { splitName } from "@/shared/lib/split-name";
import { NavLink } from "@/shared/ui/nav-link";
import { ScribbleUnderline } from "@/shared/ui/scribble-underline";
import { SectionHeading } from "@/shared/ui/section-heading";
import { SocialIcon } from "@/shared/ui/social-icon";
import { Marquee } from "@/shared/ui/marquee";
import { ContactForm } from "@/features/contact-form/ui/contact-form";
import { TypewriterText } from "@/shared/ui/typewriter-text";
import { ExperienceTimeline } from "@/widgets/experience-timeline/ui/experience-timeline";
import { ProjectsShowcase } from "@/widgets/projects-showcase/ui/projects-showcase";

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
  const dict = useDictionary();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const cookieConsent = useCookieConsent();
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

  const leftColumnRef = useRef<HTMLDivElement>(null);
  // leftColumnRef's own top edge sits at the very top of the page regardless
  // of the section's lg:pt-[130vh] padding (padding shifts content inward,
  // not the element's own border-box position) — so a trigger's "content has
  // actually scrolled into view" needs to watch the padded content itself.
  const aboutHeadingRef = useRef<HTMLHeadingElement>(null);

  // The profile copy enters with the about heading.
  const aboutCopyRef = useRef<HTMLDivElement>(null);

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
  const position = profile.currentJobPosition ? pickLocalized(profile.currentJobPosition, locale) : null;

  // Bumped once a resize settles, to rebuild the hero layout at the new size.
  const [layoutKey, setLayoutKey] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let width = window.innerWidth;
    let height = window.innerHeight;
    const onResize = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (window.innerWidth === width && window.innerHeight === height) return;
        width = window.innerWidth;
        height = window.innerHeight;
        setLayoutKey((key) => key + 1);
      }, 200);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, []);

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
      // Assigned by setup() once the hero timeline exists. Lets this listener —
      // which lives out here so cleanup can still reach it — hand a nav click
      // over to the hero transition; returns true when it takes the click.
      let heroNavigate: ((href: string) => boolean) | null = null;
      const onAnchorClick = (event: MouseEvent) => {
        const link = event.target instanceof Element ? event.target.closest("a[href^='#']") : null;
        const href = link?.getAttribute("href");
        if (!href || !heroNavigate?.(href)) return;
        // NavLink's own onClick fires its lenis.scrollTo immediately after this
        // and would override the transition's scroll mid-flight. Stopping
        // propagation here in the capture phase keeps that bubble-phase React
        // handler from running at all.
        event.preventDefault();
        event.stopPropagation();
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
        // Width without the scrollbar (innerWidth includes it, which would push the right-hand
        // elements 12px under the custom scrollbar).
        const vw = document.documentElement.clientWidth;
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
        // Row layout: name -- gap-10 -- (tagline above / surname) -- gap-8 --
        // photo, centered as a whole within inset-x-12, matching the old
        // absolute inset-x-12 + justify-center row exactly.
        const GAP_NAME_SURNAME = 40; // gap-10
        const GAP_GROUP_PHOTO = 32; // gap-8

        // 9vw is the hero size on a wide screen, but on a narrower one the
        // whole row — name, surname, photo and the gaps between — no longer
        // fits, and the pieces end up laid over each other. Shrink the type
        // until the row fits inside the 48px side insets. Set in px (not vw)
        // so it can't drift away from the offsets below when the window
        // changes; a resize rebuilds all of this instead.
        let heroFontSize = vw * 0.09;
        gsap.set([nameRef.current, surnameRef.current], { fontSize: heroFontSize, x: 0, y: 0 });
        gsap.set(photoRef.current, { width: PHOTO_HERO_WIDTH, height: photoHeroHeight, x: 0, y: 0 });
        const textWidth =
          nameRef.current!.getBoundingClientRect().width + (surnameRef.current?.getBoundingClientRect().width ?? 0);
        const roomForText = vw - 96 - GAP_NAME_SURNAME - GAP_GROUP_PHOTO - PHOTO_HERO_WIDTH;
        if (textWidth > roomForText) {
          heroFontSize *= roomForText / textWidth;
          gsap.set([nameRef.current, surnameRef.current], { fontSize: heroFontSize });
        }
        gsap.set(taglineRef.current, { x: 0, y: 0 });
        gsap.set(underlineWrapRef.current, { width: 480, x: 0, y: 0 });
        gsap.set(socialRef.current, { x: 0, y: 0 });

        // Every offset below is a position in the pinned sidebar's frame, i.e.
        // the viewport as it is at scroll 0. Before the pin exists the sidebar
        // still scrolls with the page, so a rebuild after a resize mid-page
        // would read everything shifted up by however far it's scrolled.
        const scrolled = window.scrollY;
        const atTop = (el: Element) => {
          const rect = el.getBoundingClientRect();
          return { left: rect.left, top: rect.top + scrolled, width: rect.width, height: rect.height };
        };
        const nameRect = atTop(nameRef.current!);
        const surnameRect = surnameRef.current ? atTop(surnameRef.current) : nameRect;
        const taglineRect = atTop(taglineRef.current!);
        const underlineRect = atTop(underlineWrapRef.current!);
        const photoRect = atTop(photoRef.current!);
        const socialRect = atTop(socialRef.current!);
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
        const NAV_GAP = window.innerWidth >= 1280 ? 24 : 16; // gap-x-6 : gap-x-4
        const navItemRects = navItems.map(atTop);
        const navRowWidth =
          navItemRects.reduce((sum, r) => sum + r.width, 0) + NAV_GAP * Math.max(navItemRects.length - 1, 0);
        let navCursor = vw - 48 - navRowWidth;
        navItems.forEach((el, i) => {
          const rect = navItemRects[i];
          gsap.set(el, { x: navCursor - rect.left, y: 40 - rect.top });
          navCursor += rect.width + NAV_GAP;
        });

        gsap.set(descRef.current, { autoAlpha: 0, y: 16 });

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
          .to(descRef.current, { autoAlpha: 1, y: 0, ease: "power2.out", duration: 0.25 }, LINE_DRAWN + 1.1);

        // Each nav item is its own frame with a wide staggered start and a short
        // duration, so they arrive one after another — only one or two ever in
        // flight together — instead of all four converging on the same small
        // final cluster at once.
        navItems.forEach((el, i) => {
          tl.to(el, { x: 0, y: 0, ease: "power2.out", duration: 0.4 }, LINE_DRAWN + 0.06 + i * 0.1);
        });

        // Going back is its own timeline rather than tl.reverse(). The forward
        // pass is stacked so the name and photo *finish* first — they're the
        // pieces that settle fastest — which on reverse means they only start
        // moving once the tail of everything else has played out, and the page
        // slides back while the sidebar still sits there. This mirrors the
        // forward pass instead: every piece starts travelling at once, so
        // coming back reads at the same pace as going in. Its targets are the
        // hero frame each piece is sitting in right now, read back rather than
        // restated, so there's still only one definition of that layout.
        const heroOf = (el: Element | null, props: string[]): gsap.TweenVars =>
          el ? Object.fromEntries(props.map((p) => [p, gsap.getProperty(el, p, "px")])) : {};

        const backTl = gsap.timeline({ paused: true });
        backTl
          // Sidebar-only text has nowhere to travel, so it just clears out.
          .to(descRef.current, { autoAlpha: 0, y: 16, duration: 0.2 }, 0)
          .to(nameRef.current, { ...heroOf(nameRef.current, ["x", "y", "fontSize"]), ease: "power2.out", duration: 0.5 }, 0.02)
          .to(surnameRef.current, { ...heroOf(surnameRef.current, ["x", "y", "fontSize"]), ease: "power2.out", duration: 0.5 }, 0.06)
          .to(underlineWrapRef.current, { ...heroOf(underlineWrapRef.current, ["x", "y", "width"]), ease: "power2.out", duration: 0.5 }, 0.04)
          .to(photoRef.current, { ...heroOf(photoRef.current, ["x", "y", "width", "height"]), ease: "power2.out", duration: 0.5 }, 0.05)
          // Furthest to travel of anything — back out to the bottom-right corner.
          .to(socialRef.current, { ...heroOf(socialRef.current, ["x", "y"]), ease: "power2.out", duration: 0.65 }, 0.02)
          // Hero-only chrome fades back in behind the travel, once there's
          // something recognisable for it to belong to.
          .to(taglineRef.current, { ...heroOf(taglineRef.current, ["x", "y"]), autoAlpha: 1, duration: 0.25 }, 0.4)
          .to([tagRef.current, scrollHintRef.current], { autoAlpha: 1, duration: 0.3 }, 0.45);

        navItems.forEach((el, i) => {
          backTl.to(el, { ...heroOf(el, ["x", "y"]), ease: "power2.out", duration: 0.4 }, 0.04 + i * 0.07);
        });

        let assembled = false;
        // A nav link clicked while a transition is already running.
        let pendingHref: string | null = null;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const contentTop = () => {
          const label = aboutHeadingRef.current?.previousElementSibling;
          return Math.max(0, (label?.getBoundingClientRect().top ?? 0) + window.scrollY - 96);
        };
        const duration = reducedMotion ? 0 : 0.8;
        // A nav click is a request to *get somewhere*, not to watch the
        // transition — same choreography, roughly twice the pace.
        const navDuration = duration / 2;
        // How much scroll draws the underline — and with it, where the hero
        // region ends: past this point the assembly has taken over.
        const drawRange = () => window.innerHeight * 0.22;
        // Coming back up lands at the very top with the underline fully
        // undrawn, so every trip into the hero starts from the same clean
        // state: scrolling down draws the line first, and only then does the
        // assembly take over.
        const heroReturnScroll = () => 0;
        // A selector target is resolved by Lenis itself, so a nav destination
        // lands in exactly the same place whether the hero transition took the
        // click over or an ordinary link handled it.
        // `lock` keeps the user's own scrolling out until the move lands. Left
        // off, a wheel or swipe mid-flight simply takes over from it — and
        // since Lenis never reports an interrupted move as complete, the
        // callback then runs on a timer at the moment the move would have
        // ended instead.
        const movePage = (target: number | string, onComplete: () => void, span = duration, lock = true) => {
          scrollTween?.kill();
          const lenis = lenisRef?.current;
          if (lenis) {
            let done = false;
            const finish = () => {
              if (done) return;
              done = true;
              onComplete();
            };
            lenis.scrollTo(target, {
              duration: span,
              immediate: reducedMotion,
              lock,
              force: true,
              easing: (t: number) => 1 - Math.pow(1 - t, 3),
              onComplete: finish,
            });
            if (!lock) gsap.delayedCall(span, finish);
          } else {
            const resolved =
              typeof target === "number"
                ? target
                : (document.querySelector(target)?.getBoundingClientRect().top ?? 0) + window.scrollY;
            const position = { y: window.scrollY };
            scrollTween = gsap.to(position, {
              y: resolved, duration: span, ease: "power2.out",
              onUpdate: () => window.scrollTo(0, position.y),
              onComplete,
            });
          }
        };
        const assemble = () => {
          if (assembled || transitioning || cancelled) return;
          assembled = true;
          const target = contentTop();
          if (window.scrollY >= target - 8) {
            tl.progress(1).pause();
            return;
          }
          transitioning = true;
          if (reducedMotion) tl.progress(1).pause();
          else tl.timeScale(tl.duration() / duration).play(0);
          // Locked: the transition can't be outrun by scrolling. The wheel is
          // ignored until the sidebar has assembled and the page has landed on
          // the content, so nothing is skipped.
          movePage(target, () => {
            transitioning = false;
          });
        };
        // `target` is where the page itself should end up: the near-drawn
        // landing point for ordinary upward scrolling, or the very top when
        // that's what was actually asked for (the back-to-top link).
        const returnToHero = (target = heroReturnScroll()) => {
          if (!assembled || transitioning || cancelled) return;
          transitioning = true;
          // invalidate() re-reads each piece's current position, so an
          // interrupted transition travels from where it actually is.
          if (!reducedMotion) backTl.invalidate().timeScale(backTl.duration() / duration).play(0);
          // The underline stays on its own scrub, which follows the scroll
          // position — so it's the last thing to visibly move, landing either
          // near-complete or fully undrawn depending on the target.
          movePage(target, () => {
            tl.pause(0);
            backTl.pause();
            assembled = false;
            transitioning = false;
            flushPendingNav();
          });
        };
        // A nav click from the hero has no scroll gesture behind it, so nothing
        // has drawn the line or started the assembly. Left alone it scrolls the
        // full-size hero name up the page and only then snaps it into the
        // sidebar, so instead: draw the line, run the assembly, and only then
        // travel on to the section the link actually points at.
        const runHeroNavigate = (href: string) => {
          if (cancelled) return false;
          if (href === "#top") {
            // "Наверх" means the actual top of the page — not the landing point
            // that keeps the underline drawn ready for another run. Handled here
            // rather than left to the link so it animates back like any other
            // return instead of racing this transition with its own scroll.
            if (!assembled || transitioning) return false;
            returnToHero(0);
            return true;
          }
          if (transitioning) {
            // Mid-transition the nav is still flying into place. Swallow the
            // click rather than let a second scroll fight this one, and honour
            // it once we've landed.
            pendingHref = href;
            return true;
          }
          if (assembled) return false;
          assembled = true;
          transitioning = true;
          // The scrub owns dashoffset from scroll position alone, so left
          // enabled it would undraw the line and redraw it again as movePage
          // scrolls the page down. It goes back on once we've arrived, where
          // scroll is past the range's end and it agrees with what's on screen.
          const scrub = underlineTrigger.scrollTrigger;
          scrub?.disable(false);
          const runAssembly = () => {
            if (cancelled) return;
            if (reducedMotion) tl.progress(1).pause();
            else tl.timeScale(tl.duration() / navDuration).play(0);
            // One continuous move all the way to the section. Landing on the
            // content first and setting off again put a dead stop between the
            // assembly and the actual navigation; instead the assembly plays
            // over the opening stretch of this same scroll.
            const landing = contentTop();
            const elementTop =
              (document.querySelector(href)?.getBoundingClientRect().top ?? 0) + window.scrollY;
            // "Обо мне" *is* the content the assembly lands on, and that
            // landing keeps the section's own label in frame — so stop there
            // rather than scrolling on past it to the heading.
            const target = elementTop <= landing + 400 ? landing : href;
            const travel = Math.abs((typeof target === "number" ? target : elementTop) - window.scrollY);
            movePage(
              target,
              () => {
                scrub?.enable();
                transitioning = false;
                flushPendingNav();
              },
              // Long trips get proportionally more time so the pace stays the
              // same whether the section is just below or at the far end.
              Math.min(1.2, Math.max(navDuration, travel / 4000))
            );
          };
          if (reducedMotion) {
            gsap.set(underlinePathRef.current, { attr: { "stroke-dashoffset": 0 } });
            runAssembly();
          } else {
            gsap.to(underlinePathRef.current, {
              attr: { "stroke-dashoffset": 0 },
              ease: "power2.out",
              duration: 0.22,
              onComplete: runAssembly,
            });
          }
          return true;
        };
        heroNavigate = runHeroNavigate;
        function flushPendingNav() {
          const href = pendingHref;
          pendingHref = null;
          if (!href) return;
          if (!runHeroNavigate(href)) lenisRef?.current?.scrollTo(href);
        }
        // A small dead zone below the landing point prevents a refresh or
        // subpixel rounding from immediately reversing the forward transition.
        // Ordinary upward scrolling inside the content remains untouched.
        //
        // This used to be a 1px-tall ScrollTrigger with onLeaveBack, which
        // sounds right but isn't: onLeaveBack fires on any crossing of that
        // boundary, and a single fast wheel-driven scroll frame (or a refresh
        // recomputing contentTop() as the page's height settles) can jump
        // clean over a 1px band in one tick, which GSAP can register as a
        // backward crossing even while net motion is downward — reopening the
        // hero mid-scroll, on top of the very content it had just revealed.
        // Checking scroll position and direction explicitly on every frame
        // has no boundary to jump over, so there's nothing to misfire.
        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (assembled && !transitioning && self.direction < 0 && self.scroll() < contentTop() - 16) {
              returnToHero();
              return;
            }
            // A fast flick can carry the page well past the underline's range
            // before the scrubbed draw has even reported completion. Catch it
            // as soon as it leaves the hero: pull the page back to the edge of
            // that range and start the assembly from there, so it always plays
            // in full instead of being run away from.
            if (!assembled && !transitioning && !cancelled && self.direction > 0 && self.scroll() > drawRange()) {
              lenisRef?.current?.scrollTo(drawRange(), { immediate: true, force: true });
              gsap.set(underlinePathRef.current, { attr: { "stroke-dashoffset": 0 } });
              assemble();
            }
          },
        });
        // Re-arming (assembled = false) used to also happen here, directly, the
        // instant scroll reached the very top — a plain position check with no
        // regard for whether a transition was genuinely in flight. That's the
        // same class of bug as the onLeaveBack one above: it fired off of a
        // single scroll reading rather than sustained motion, so a fast flick
        // through the whole page (or a scrub update landing on a stale reading
        // the same tick scroll happened to sit near 0) could snap tl back to
        // its hero frame — instantly, with no scroll to match — while the page
        // stayed deep in the content it had just reversed on top of. The
        // direction-checked trigger above already re-arms correctly for every
        // real case, including landing at the very top, so this only needs to
        // draw the line.
        const underlineTrigger = gsap.to(underlinePathRef.current, {
          attr: { "stroke-dashoffset": 0 },
          ease: "none",
          onComplete: assemble,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${drawRange()}`,
            scrub: reducedMotion ? true : 0.15,
          },
        });

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: "top top",
          end: "bottom bottom",
          pin: sidebarRef.current,
        });

        // A resize rebuilds this whole setup from the hero frame, which on
        // first load always matches scroll 0. Rebuilt while already reading
        // the content, the sidebar has to come back assembled, not as a
        // full-size hero laid over the text.
        if (window.scrollY > drawRange()) {
          assembled = true;
          tl.progress(1).pause();
        }

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

        // Heading and profile copy enter together.
        headingSplit = aboutHeadingRef.current
          ? SplitText.create(aboutHeadingRef.current, { type: "words", mask: "words" })
          : null;

        if (headingSplit) gsap.set(headingSplit.words, { yPercent: 110 });
        gsap.set(aboutCopyRef.current, { autoAlpha: 0, y: 24 });

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
          aboutCopyRef.current,
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
            // The whole underline-draw range still *is* the hero — including the
            // point coming back up lands on — so the repel stays live across it
            // instead of dying one pixel below the top.
            start: () => drawRange(),
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
    // layoutKey isn't read inside: it's there so a resize re-runs the whole
    // setup, since every hero offset above is measured once in px.
  }, [profile.skills.length, projects.length, lenisRef, layoutKey]);

  return (
    <div id="top" ref={sectionRef} className="lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
      {tag && (
        <div
          ref={tagRef}
          className="px-6 pt-10 sm:px-12 lg:invisible lg:fixed lg:left-12 lg:top-10 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mt-2 lg:pt-2"
        >
          <p className="text-xs tracking-[0.25em] text-[#8a8378]">{tag}</p>
          <p className="mt-1 text-xs tracking-[0.15em] text-[#5c584f]">{dict.hero.indexLabel} / {new Date().getFullYear()}</p>
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
              <TypewriterText phrases={dict.tagline} />
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
          <div className="pointer-events-none relative z-30 hidden text-right lg:block">
            <p ref={taglineRef} className="absolute -top-10 right-0 whitespace-nowrap font-hand text-2xl text-[#8a8378]">
              <span className="inline-block" style={{ animation: "arrow-bounce 1.6s ease-in-out infinite" }}>
                ↙
              </span>{" "}
              <TypewriterText phrases={dict.tagline} />
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

          {(position || profile.currentJobCompany) && (
            <p ref={descRef} className="text-center text-sm text-[#b8b1a3] lg:text-right">
              {position}
              {profile.currentJobCompany ? ` · ${profile.currentJobCompany}` : ""}
            </p>
          )}

          <nav
            ref={navRef}
            className="flex flex-col items-center gap-y-2 text-base tracking-[0.05em] text-[#8a8378] lg:w-80 lg:items-end lg:text-lg xl:text-[28px] [@media(max-height:860px)]:gap-y-0 [@media(max-height:860px)]:text-lg! [@media(max-height:860px)]:xl:text-lg!"
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
                  {dict.nav[item.key].toUpperCase()}
                </NavLink>
              </span>
            ))}
          </nav>

          <div ref={socialRef} className="flex gap-5 text-[#8a8378] lg:mt-3">
            {SOCIAL_LINKS.map((link) => (
              <a key={link.label} href={link.href} aria-label={link.label} className="transition-colors hover:text-[#ece5d6]">
                <SocialIcon name={link.icon} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <p
        ref={scrollHintRef}
        className="px-6 pb-10 font-hand text-xl text-[#8a8378] sm:px-12 lg:invisible lg:fixed lg:bottom-10 lg:left-12 lg:z-10 lg:bg-[#141312] lg:px-3 lg:py-2 lg:-ml-3 lg:-mb-2 lg:pb-2"
      >
        {dict.hero.scrollHint}
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
        <span className="text-xs tracking-[0.25em] [writing-mode:vertical-rl]">{dict.hero.backToTop}</span>
      </a>

      {/* lg:pl-20 reserves a permanent left gutter so the fixed "back to top"
          rail never sits on top of scrolling content (project images etc). */}
      <div ref={leftColumnRef} className="lg:col-start-1 lg:row-start-1 lg:pl-20">
        {/* id lives on the heading, not the section — the section's own
            border-box top sits at the very top of the page regardless of its
            lg:pt-[130vh] padding (padding shifts content inward, not the
            element's own position), so an #about anchor jump there would land
            back at the hero instead of at the actual visible content. */}
        <section className="px-6 py-24 sm:px-12 lg:pt-[130vh]">
          <SectionHeading index={0} label={dict.nav.about} headingId="about" headingRef={aboutHeadingRef} />
          <div ref={aboutCopyRef}>
            <p className="mt-10 max-w-[20ch] text-balance text-[clamp(1.875rem,3.4vw,3.25rem)] leading-[1.1] text-[#ece5d6]">
              {dict.about.heading} <span className="text-[#e2451f]">{dict.about.headingAccent}</span>
            </p>
            <p className="mt-5 max-w-[36rem] text-lg text-[#8a8378]">
              {dict.about.lead}
            </p>
          </div>

          <ul className="mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {dict.about.services.map((service) => (
              <li key={service.title} className="border-t border-[#3a372f] pt-5">
                <h3 className="text-lg font-medium text-[#ece5d6]">{service.title}</h3>
                <p className="mt-3 leading-[1.6] text-[#b8b1a3]">{service.text}</p>
              </li>
            ))}
          </ul>

          {profile.skills.length > 0 && (
            <div id="skills" className="mt-16 text-lg text-[#cfc8b8]">
              <Marquee items={profile.skills} />
            </div>
          )}
        </section>

        {profile.experience.length > 0 && (
          <section id="experience" className="px-6 py-24 sm:px-12">
            <SectionHeading index={1} label={dict.experience.heading} />
            <ExperienceTimeline items={profile.experience} />
          </section>
        )}

        <div id="projects">
          <ProjectsShowcase projects={projects} />
        </div>

        <section id="contact" className="px-6 pt-24 sm:px-12">
          <SectionHeading index={3} label={dict.contact.heading} />
          <div className="mt-12 grid gap-14 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:gap-20">
            <div>
              <p className="max-w-[24rem] text-[clamp(1.375rem,2vw,1.875rem)] leading-[1.25] text-[#ece5d6]">
                {dict.contact.lead}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                {SOCIAL_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="inline-flex items-center gap-2.5 rounded-full border border-[#3a372f] px-5 py-2.5 text-[#ece5d6] transition-colors hover:border-[#e2451f] hover:text-[#e2451f]"
                  >
                    <SocialIcon name={link.icon} className="h-4 w-4" />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <ContactForm />
          </div>

          <footer className="mt-24 flex flex-col gap-2 border-t border-[#2a2824] py-8 text-sm text-[#8a8378] sm:flex-row sm:items-center sm:justify-between">
            <span>
              © {new Date().getFullYear()} {profile.name}
            </span>
            <nav className="flex flex-wrap gap-x-6 gap-y-1">
              <a href={localizedPath("/privacy")} className="hover:text-[#ece5d6]">
                {dict.footer.privacy}
              </a>
              <a href={localizedPath("/consent")} className="hover:text-[#ece5d6]">
                {dict.footer.consent}
              </a>
              {cookieConsent.enabled && (
                <button type="button" onClick={cookieConsent.openSettings} className="hover:text-[#ece5d6]">
                  {dict.footer.cookieSettings}
                </button>
              )}
            </nav>
            {position && <span>{position}</span>}
          </footer>
        </section>
      </div>
    </div>
  );
}
