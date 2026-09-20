"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const HOLD_DURATION = 1.4; // pause once a phrase is fully typed, before erasing
const TYPE_SPEED = 0.045; // seconds per character while typing
const ERASE_SPEED = 0.03; // seconds per character while erasing
const MIN_DURATION = 0.15;

export function TypewriterText({ phrases, className = "" }: { phrases: string[]; className?: string }) {
  const textRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const el = textRef.current;
    if (!el || phrases.length === 0) return;

    // Drives el.textContent directly via a numeric proxy instead of GSAP's
    // TextPlugin — TextPlugin's own diffing shrinks a string by trimming
    // characters off the *front*, which reads as text sliding rather than a
    // backspace. Slicing from a proxy count gives an exact, predictable
    // "type left-to-right, erase right-to-left" in both directions.
    const tl = gsap.timeline({ repeat: -1 });
    phrases.forEach((phrase, i) => {
      const next = phrases[(i + 1) % phrases.length];
      const erase = { chars: phrase.length };
      const type = { chars: 0 };
      tl.to(
        erase,
        {
          chars: 0,
          duration: Math.max(phrase.length * ERASE_SPEED, MIN_DURATION),
          ease: "none",
          onUpdate: () => {
            el.textContent = phrase.slice(0, Math.round(erase.chars));
          },
        },
        `+=${HOLD_DURATION}`
      );
      tl.to(type, {
        chars: next.length,
        duration: Math.max(next.length * TYPE_SPEED, MIN_DURATION),
        ease: "none",
        onUpdate: () => {
          el.textContent = next.slice(0, Math.round(type.chars));
        },
      });
    });

    return () => {
      tl.kill();
    };
  }, [phrases]);

  const longest = Math.max(...phrases.map((p) => p.length));

  return (
    <span className={className}>
      {/* Screen readers get the full set at once — the visible span types/erases
          one phrase at a time via direct textContent mutation, which doesn't
          map to anything meaningful being read aloud mid-transition. */}
      <span className="sr-only">{phrases.join(", ")}</span>
      {/* Reserved to the longest phrase's width and left-aligned so the
          shorter phrases don't shrink this box — whatever contains this
          component (e.g. the hero tagline) is right-anchored on its own
          outer edge, calibrated once for a fixed width; if this inner box's
          width changed with every phrase, that outer position would drift.
          Keeping the width constant and aligning text left inside it is what
          actually makes the type/erase read as emerging left-to-right,
          without moving the whole element around the page. */}
      <span className="inline-block text-left" style={{ minWidth: `${longest}ch` }} aria-hidden="true">
        <span ref={textRef}>{phrases[0]}</span>
        <span className="ml-0.5 inline-block" style={{ animation: "cursor-blink 1s step-end infinite" }}>
          |
        </span>
      </span>
    </span>
  );
}
