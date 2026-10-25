/** A technology's brand icon from Simple Icons (24x24 viewBox, single path), drawn in the text colour. */
export function TechIcon({ path, className = "h-4 w-4" }: { path: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d={path} />
    </svg>
  );
}
