import { forwardRef } from "react";

type ScribbleUnderlineProps = {
  className?: string;
  /** Extra classes for the <path> itself — e.g. an initial hidden state for a scroll-driven draw-in animation. */
  pathClassName?: string;
};

export const ScribbleUnderline = forwardRef<SVGPathElement, ScribbleUnderlineProps>(function ScribbleUnderline(
  { className = "", pathClassName = "" },
  ref
) {
  return (
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        ref={ref}
        d="M2 12 C 40 4, 80 18, 120 10 S 200 4, 240 12 S 290 16, 298 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        // A round cap can bleed a visible sliver past the dash boundary right at
        // dashoffset:1 (fully hidden) due to how the cap's rounding is computed
        // at the pattern's wrap-around edge — butt avoids that artifact.
        strokeLinecap="butt"
        pathLength={1}
        className={pathClassName}
      />
    </svg>
  );
});
