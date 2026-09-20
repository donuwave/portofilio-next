"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode, type RefObject } from "react";
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

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}
