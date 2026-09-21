"use client";

import { useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import type { CaseMediaItem } from "../model/types";

// Dragging past this fraction of the viewport's own width counts as a
// committed swipe, regardless of screen size.
const SWIPE_THRESHOLD = 0.12;

export function CaseMediaCarousel({ media, title }: { media: CaseMediaItem[]; title: string }) {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; active: boolean } | null>(null);

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
    gsap.to(trackRef.current, { x: -clamped * slideWidth(), duration: 0.5, ease: "power3.out" });
  }

  useLayoutEffect(() => {
    gsap.set(trackRef.current, { x: -index * slideWidth() });
    // Pixel-based positioning (not percentage) needs re-anchoring on resize.
    const onResize = () => gsap.set(trackRef.current, { x: -index * slideWidth() });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    if (media.length < 2) return;
    drag.current = { startX: e.clientX, active: true };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!drag.current?.active) return;
    const delta = e.clientX - drag.current.startX;
    gsap.set(trackRef.current, { x: -index * slideWidth() + delta });
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (!drag.current?.active) return;
    const delta = e.clientX - drag.current.startX;
    drag.current.active = false;
    const fraction = delta / slideWidth();
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
      className="relative h-screen w-full overflow-hidden bg-[#0d0c0a] outline-none"
      tabIndex={0}
      role="group"
      aria-label={`Медиа кейса «${title}», слайд ${index + 1} из ${media.length}`}
      onKeyDown={handleKeyDown}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div ref={trackRef} className="flex h-full cursor-grab touch-pan-y select-none active:cursor-grabbing">
        {media.map((item) => (
          <div key={item.id} className="h-full w-full shrink-0">
            {item.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.path} alt={title} draggable={false} className="h-full w-full object-cover" />
            ) : (
              <video src={item.path} controls className="h-full w-full object-cover" />
            )}
          </div>
        ))}
      </div>

      {media.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => snapTo(index - 1)}
            disabled={index === 0}
            aria-label="Предыдущий слайд"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] disabled:opacity-30 sm:left-8"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => snapTo(index + 1)}
            disabled={index === media.length - 1}
            aria-label="Следующий слайд"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] disabled:opacity-30 sm:right-8"
          >
            →
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {media.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => snapTo(i)}
                aria-label={`Слайд ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? "w-6 bg-[#e2451f]" : "w-1.5 bg-[#ece5d6]/40 hover:bg-[#ece5d6]/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute right-4 top-4 rounded-full bg-[#141312]/70 px-2.5 py-1 text-xs tracking-[0.1em] text-[#b8b1a3] sm:right-8 sm:top-6">
            {index + 1} / {media.length}
          </div>
        </>
      )}
    </div>
  );
}
