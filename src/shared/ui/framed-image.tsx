type FramedImageProps = {
  path: string;
  alt: string;
  /** How the image sits in the frame at zoom 1: whole image visible, or filling it. */
  fit?: "contain" | "cover";
  zoom?: number;
  /** Pan offset as a fraction of the frame size, so the framing survives any frame size. */
  x?: number;
  y?: number;
};

/** Fills its (relative, overflow-hidden) parent with the image, scaled and shifted as chosen in the admin. */
export function FramedImage({ path, alt, fit = "contain", zoom = 1, x = 0, y = 0 }: FramedImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={path}
      alt={alt}
      draggable={false}
      className={`absolute inset-0 h-full w-full select-none ${fit === "cover" ? "object-cover" : "object-contain"}`}
      style={{ transform: `translate(${x * 100}%, ${y * 100}%) scale(${zoom})` }}
    />
  );
}
