/**
 * An endlessly scrolling row of short labels. Pure CSS: the items are
 * rendered twice and the track slides by half its width (see `marquee` in
 * globals.css). Pauses on hover, and stands still for reduced motion.
 */
export function Marquee({ items, durationSeconds = 40 }: { items: string[]; durationSeconds?: number }) {
  const row = (hidden: boolean) =>
    items.map((item, i) => (
      <li key={`${hidden ? "b" : "a"}-${i}`} aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
        <span className="whitespace-nowrap">{item}</span>
        <span className="h-1.5 w-1.5 rounded-full bg-[#e2451f]" aria-hidden="true" />
      </li>
    ));

  return (
    <div className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <ul
        className="flex w-max motion-safe:animate-[marquee_var(--marquee-duration)_linear_infinite] group-hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": `${durationSeconds}s` } as React.CSSProperties}
      >
        {row(false)}
        {row(true)}
      </ul>
    </div>
  );
}
