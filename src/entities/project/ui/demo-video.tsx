/** The project's demo clip, shown first on its page: plays silently on a loop, with controls to unmute. */
export function DemoVideo({ path, poster, label }: { path: string; poster?: string | null; label: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-sm bg-[#0d0c0a]">
      <video
        src={path}
        poster={poster ?? undefined}
        aria-label={label}
        className="h-full w-full object-contain"
        autoPlay
        muted
        loop
        playsInline
        controls
        preload="metadata"
      />
    </div>
  );
}
