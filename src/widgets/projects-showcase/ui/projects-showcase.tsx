"use client";

import Link from "next/link";
import { useEffect, useRef, type PointerEvent, type WheelEvent } from "react";
import gsap from "gsap";
import type { Project } from "@/entities/project/model/types";
import { useDictionary, useLocale, useLocalizedPath } from "@/shared/i18n/locale-provider";
import { pickLocalized } from "@/shared/lib/localized-text";
import { SectionHeading } from "@/shared/ui/section-heading";

const DRAG_THRESHOLD = 6;
// Share of a slide's width a drag has to cover to move to the neighbour.
const ADVANCE_RATIO = 0.15;
// Horizontal wheel (trackpad swipe) distance that counts as one step.
const WHEEL_STEP = 60;

/**
 * The home page's taste of the work, handing off to /projects for the full
 * list. The track is moved with a GSAP transform rather than native scrolling:
 * native smooth-scroll + scroll-snap is driven by the browser and settles with
 * its own abrupt timing, while here every release eases into place on the same
 * curve regardless of how the drag ended.
 */
export function ProjectsShowcase({ projects }: { projects: Project[] }) {
  const dict = useDictionary();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const index = useRef(0);
  const drag = useRef<{ x: number; y: number; base: number; moved: boolean; locked: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ sum: 0, busy: false });

  function bounds() {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return { min: 0, offsets: [0] };
    const min = Math.min(0, viewport.clientWidth - track.scrollWidth);
    const offsets = (Array.from(track.children) as HTMLElement[]).map((slide) => Math.max(min, -slide.offsetLeft));
    return { min, offsets };
  }

  function goTo(next: number, duration = 0.75) {
    const { offsets } = bounds();
    index.current = Math.min(Math.max(next, 0), offsets.length - 1);
    gsap.to(trackRef.current, { x: offsets[index.current], duration, ease: "power3.out", overwrite: true });
  }

  useEffect(() => {
    const onResize = () => goTo(index.current, 0);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // goTo reads everything it needs from refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    suppressClick.current = false;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x: e.clientX, y: e.clientY, base: Number(gsap.getProperty(trackRef.current, "x")), moved: false, locked: false };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    if (!state || state.locked) return;
    const dx = e.clientX - state.x;
    const dy = e.clientY - state.y;
    if (!state.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD && Math.abs(dy) < DRAG_THRESHOLD) return;
      // A mostly vertical touch gesture is the page scrolling — let it go.
      if (Math.abs(dy) > Math.abs(dx)) {
        state.locked = true;
        return;
      }
      state.moved = true;
      gsap.killTweensOf(trackRef.current);
      viewportRef.current?.setPointerCapture(e.pointerId);
    }
    const { min } = bounds();
    let x = state.base + dx;
    // Past either end the track resists instead of stopping dead.
    if (x > 0) x *= 0.35;
    else if (x < min) x = min + (x - min) * 0.35;
    gsap.set(trackRef.current, { x });
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const state = drag.current;
    drag.current = null;
    if (!state?.moved) return;
    suppressClick.current = true;
    const slide = trackRef.current?.children[index.current] as HTMLElement | undefined;
    const pulled = (state.x - e.clientX) / (slide?.offsetWidth ?? 1);
    goTo(index.current + (pulled > ADVANCE_RATIO ? 1 : pulled < -ADVANCE_RATIO ? -1 : 0));
  }

  function onWheel(e: WheelEvent<HTMLDivElement>) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    const state = wheel.current;
    if (state.busy) return;
    state.sum += e.deltaX;
    if (Math.abs(state.sum) < WHEEL_STEP) return;
    goTo(index.current + Math.sign(state.sum));
    state.sum = 0;
    // One trackpad swipe fires a long tail of wheel events; ignore it.
    state.busy = true;
    setTimeout(() => (state.busy = false), 650);
  }

  if (projects.length === 0) return null;

  return (
    <section className="py-24">
      <div className="px-6 sm:px-12">
        <SectionHeading index={2} label={dict.projects.sectionLabel}>
          <Link
            href={localizedPath("/projects")}
            className="decoration-[#e2451f] decoration-2 underline-offset-[0.15em] transition-colors hover:text-[#e2451f] hover:underline"
          >
            {dict.projects.featured}
          </Link>
        </SectionHeading>
      </div>

      <div
        ref={viewportRef}
        data-lenis-prevent-horizontal
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
        onClickCapture={(e) => {
          // A drag that ends over a card must not also open it.
          if (suppressClick.current) {
            suppressClick.current = false;
            e.preventDefault();
          }
        }}
        className="mx-6 mt-12 cursor-grab touch-pan-y select-none overflow-hidden active:cursor-grabbing sm:mx-12"
      >
        <div ref={trackRef} className="relative flex gap-6 will-change-transform">
          {projects.map((project) => {
            const title = pickLocalized(project.title, locale);
            return (
              <Link
                key={project.slug}
                href={localizedPath(`/projects/${project.slug}`)}
                draggable={false}
                className="group w-[82%] shrink-0 sm:w-[78%]"
              >
                <h3 className="truncate font-display text-2xl text-[#ece5d6] transition-colors group-hover:text-[#e2451f]">
                  {title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#8a8378]">
                  {pickLocalized(project.description, locale)}
                </p>
                <div className="mt-5 aspect-[16/10] overflow-hidden bg-[#1a1816]">
                  {project.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={project.cover.path}
                      alt={title}
                      draggable={false}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
