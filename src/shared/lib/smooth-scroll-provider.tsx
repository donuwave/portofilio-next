"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Lenis from "lenis";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const LenisContext = createContext<RefObject<Lenis | null> | null>(null);

// Anchor links must scroll through Lenis's own scrollTo, not native/CSS
// smooth-scroll — Lenis keeps its own internal target position and eases
// toward it every frame, so a native jump gets fought (and visually appears
// to do nothing) for as long as Lenis is still mid-animation from the last
// scroll. Consumers read `.current` at click-time (the instance is only
// needed inside event handlers, never for rendering), so this is a ref —
// not state — and never triggers a render.
export function useLenis() {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis();
    instance.on("scroll", ScrollTrigger.update);

    function raf(time: number) {
      instance.raf(time * 1000);
    }
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    lenisRef.current = instance;

    // Lenis eases toward a target that every wheel tick pushes further out, so
    // a fast flick leaves the target far ahead of where the page visually is.
    // Reversing direction then only chips away at that lead — the page keeps
    // travelling the old way for many ticks before it turns. On a reversal the
    // target is pulled back to the page's real position so the very first tick
    // the other way already moves it. Capture phase, so this runs before
    // Lenis's own wheel handler reads the target.
    let lastDirection = 0;
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const direction = Math.sign(event.deltaY);
      if (lastDirection !== 0 && direction !== lastDirection && !instance.isLocked && !instance.isStopped) {
        instance.targetScroll = instance.animatedScroll;
      }
      lastDirection = direction;
    };
    window.addEventListener("wheel", onWheel, { capture: true, passive: true });

    // Lenis measures the page's height once and then re-measures when its
    // content element resizes — by default <html>. Here <html> is h-full, so
    // its box never changes when the content does, and after client-side
    // navigation Lenis keeps the previous page's scroll limit: a short page
    // inherits a huge one (scrolling back up has to unwind the excess), and a
    // tall page inherits a short one (it simply stops scrolling). <body> does
    // grow with its content, so it's the element to watch.
    let resizeFrame = 0;
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => instance.resize());
    });
    resizeObserver.observe(document.body);

    return () => {
      cancelAnimationFrame(resizeFrame);
      resizeObserver.disconnect();
      window.removeEventListener("wheel", onWheel, { capture: true });
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Navigating to another page while Lenis is still gliding after a scroll
  // leaves it animating toward the old page's position: the new page opens
  // part-way down, and its first wheel ticks only chip away at the stale
  // target. A route change throws all of that away and starts from the top.
  const pathname = usePathname();
  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    lenis.scrollTo(0, { immediate: true, force: true });
    // The new page's content is in place by now; measure it rather than
    // waiting for the observer to notice.
    lenis.resize();
  }, [pathname]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
