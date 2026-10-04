"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useDictionary } from "@/shared/i18n/locale-provider";
import { format } from "@/shared/i18n/localize-path";
import { FramedImage } from "@/shared/ui/framed-image";
import type { CaseMediaItem } from "../model/types";
import { CaseLightbox } from "./case-lightbox";

// Dragging past this fraction of the viewport's own width counts as a
// committed swipe, regardless of screen size.
const SWIPE_THRESHOLD = 0.12;
// A press that moves less than this is a click, not the start of a drag.
const DRAG_START = 6;
const AUTOPLAY_MS = 5000;

export function CaseMediaCarousel({ media, title }: { media: CaseMediaItem[]; title: string }) {
  const dict = useDictionary().media;
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; id: number; dragging: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [lightboxId, setLightboxId] = useState<string | null>(null);
  const images = media.filter((item) => item.type === "image");
  const lightboxIndex = images.findIndex((item) => item.id === lightboxId);

  // Autoplay only runs while nobody is interacting and the slider can be
  // seen: pointer over it, keyboard focus inside, a drag in progress, a video
  // playing or the slider being scrolled out of view all hold it.
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  function slideWidth() {
    return containerRef.current?.clientWidth ?? window.innerWidth;
  }

  // GSAP owns trackRef's transform exclusively from here on — drag updates
  // it via gsap.set every pointermove, snapping animates it via gsap.to.
  // Mixing that with a React-driven inline style on the same element (an
  // earlier pass at this did) makes the two fight over the same CSS
  // property every frame, since React re-applies its own style on each
  // render while GSAP is mid-tween.
  function snapTo(nextIndex: number) {
    const clamped = Math.max(0, Math.min(media.length - 1, nextIndex));
    setIndex(clamped);
    gsap.to(trackRef.current, { x: -clamped * slideWidth(), duration: 0.5, ease: "power3.out", overwrite: true });
  }

  useLayoutEffect(() => {
    gsap.set(trackRef.current, { x: -index * slideWidth() });
    // Pixel-based positioning (not percentage) needs re-anchoring on resize.
    const onResize = () => gsap.set(trackRef.current, { x: -index * slideWidth() });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const playing = media.length > 1 && visible && !hovered && !focused && !dragging && !videoPlaying && lightboxId === null;

  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setTimeout(() => snapTo(index === media.length - 1 ? 0 : index + 1), AUTOPLAY_MS);
    return () => clearTimeout(timer);
    // snapTo only reads refs and `media`; index is what re-arms the timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, index, media.length]);

  function handlePointerDown(e: React.PointerEvent) {
    suppressClick.current = false;
    if (media.length < 2) return;
    // Presses on the arrows and dots are clicks, never the start of a drag.
    if ((e.target as HTMLElement).closest("button")) return;
    drag.current = { startX: e.clientX, id: e.pointerId, dragging: false };
  }

  function handlePointerMove(e: React.PointerEvent) {
    const state = drag.current;
    if (!state) return;
    const delta = e.clientX - state.startX;
    if (!state.dragging) {
      if (Math.abs(delta) < DRAG_START) return;
      // Capture only once it's really a drag: capturing on press would
      // redirect the eventual click away from whatever was pressed.
      state.dragging = true;
      setDragging(true);
      gsap.killTweensOf(trackRef.current);
      (e.currentTarget as HTMLElement).setPointerCapture(state.id);
    }
    gsap.set(trackRef.current, { x: -index * slideWidth() + delta });
  }

  function handlePointerUp(e: React.PointerEvent) {
    const state = drag.current;
    drag.current = null;
    if (!state?.dragging) return;
    suppressClick.current = true;
    setDragging(false);
    const fraction = (e.clientX - state.startX) / slideWidth();
    if (fraction < -SWIPE_THRESHOLD) snapTo(index + 1);
    else if (fraction > SWIPE_THRESHOLD) snapTo(index - 1);
    else snapTo(index);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") snapTo(index - 1);
    if (e.key === "ArrowRight") snapTo(index + 1);
  }

  if (media.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative aspect-[21/10] w-full overflow-hidden rounded-sm bg-[#0d0c0a] outline-none"
      tabIndex={0}
      role="group"
      aria-roledescription="carousel"
      aria-label={format(dict.carouselLabel, { title, index: index + 1, total: media.length })}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => {
        // Keyboard focus holds autoplay; the focus a mouse click leaves on an
        // arrow does not, or it would stop the moment anyone used a button.
        if ((e.target as HTMLElement).matches(":focus-visible")) setFocused(true);
      }}
      onBlur={() => setFocused(false)}
      onClickCapture={(e) => {
        // A drag that ends over a control must not also press it.
        if (suppressClick.current) {
          suppressClick.current = false;
          e.stopPropagation();
          e.preventDefault();
        }
      }}
    >
      <div ref={trackRef} className="flex h-full cursor-grab touch-pan-y select-none active:cursor-grabbing">
        {media.map((item) => (
          <div
            key={item.id}
            className={`relative h-full w-full shrink-0 overflow-hidden ${item.type === "image" ? "cursor-zoom-in" : ""}`}
            onClick={() => item.type === "image" && setLightboxId(item.id)}
          >
            {item.type === "image" ? (
              <FramedImage path={item.path} alt={title} zoom={item.zoom} x={item.x} y={item.y} />
            ) : (
              <video
                src={item.path}
                controls
                onPlay={() => setVideoPlaying(true)}
                onPause={() => setVideoPlaying(false)}
                onEnded={() => setVideoPlaying(false)}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {images.length > 0 && (
        <button
          type="button"
          onClick={() => {
            const current = media[index];
            setLightboxId((current.type === "image" ? current : images[0]).id);
          }}
          aria-label={dict.openFullscreen}
          className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] sm:left-6 sm:top-5"
        >
          ⛶
        </button>
      )}

      {lightboxIndex >= 0 && (
        <CaseLightbox
          images={images}
          index={lightboxIndex}
          title={title}
          onIndexChange={(i) => setLightboxId(images[i].id)}
          onClose={() => setLightboxId(null)}
        />
      )}

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => snapTo(index - 1)}
            disabled={index === 0}
            aria-label={dict.prevSlide}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] disabled:opacity-30 sm:left-6"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => snapTo(index + 1)}
            disabled={index === media.length - 1}
            aria-label={dict.nextSlide}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] disabled:opacity-30 sm:right-6"
          >
            →
          </button>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2">
            {media.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => snapTo(i)}
                aria-label={format(dict.slide, { index: i + 1 })}
                className="flex h-6 items-center"
              >
                <span
                  className={`block h-1.5 rounded-full transition-all ${
                    i === index ? "w-6 bg-[#e2451f]" : "w-1.5 bg-[#ece5d6]/40 hover:bg-[#ece5d6]/70"
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="absolute right-4 top-4 z-10 rounded-full bg-[#141312]/70 px-2.5 py-1 text-xs tracking-[0.1em] text-[#b8b1a3] sm:right-6 sm:top-5">
            {index + 1} / {media.length}
          </div>
        </>
      )}
    </div>
  );
}
