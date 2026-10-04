"use client";

import { useRef, type PointerEvent } from "react";
import { Button } from "@/shared/ui/button";
import { FramedImage } from "@/shared/ui/framed-image";

type Framing = { zoom: number; x: number; y: number };

type ImageFramerProps = Framing & {
  path: string;
  onChange: (framing: Framing) => void;
  /** Frame sizing classes; must match the aspect ratio of the frame on the site. */
  frameClassName?: string;
  fit?: "contain" | "cover";
};

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 4;

/** Frame matching the one on the site: drag to move the image, slider to zoom. */
export function ImageFramer({
  path,
  zoom,
  x,
  y,
  onChange,
  frameClassName = "h-40 w-40",
  fit = "contain",
}: ImageFramerProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { startX: event.clientX, startY: event.clientY, originX: x, originY: y };
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!drag.current || !frameRef.current) return;
    const rect = frameRef.current.getBoundingClientRect();
    onChange({
      zoom,
      x: drag.current.originX + (event.clientX - drag.current.startX) / rect.width,
      y: drag.current.originY + (event.clientY - drag.current.startY) / rect.height,
    });
  }

  // The zoom at which the image just fills the frame (cropping the overflow).
  function fillFrame() {
    const frame = frameRef.current?.getBoundingClientRect();
    const img = imageRef.current?.querySelector("img");
    if (!frame || !img?.naturalWidth) return;
    const scaleX = frame.width / img.naturalWidth;
    const scaleY = frame.height / img.naturalHeight;
    onChange({ zoom: Math.max(scaleX, scaleY) / Math.min(scaleX, scaleY), x: 0, y: 0 });
  }

  return (
    <div className="mt-3 space-y-3">
      <div
        ref={frameRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
        className={`relative cursor-grab touch-none overflow-hidden rounded-xl border border-[#3a372f] bg-[#1c1a17] active:cursor-grabbing ${frameClassName}`}
      >
        <div ref={imageRef}>
          <FramedImage path={path} alt="" fit={fit} zoom={zoom} x={x} y={y} />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="range"
          min={MIN_ZOOM}
          max={MAX_ZOOM}
          step={0.01}
          value={zoom}
          onChange={(e) => onChange({ zoom: Number(e.target.value), x, y })}
          aria-label="Масштаб"
          className="w-40"
        />
        <span className="w-12 text-xs text-zinc-500">{Math.round(zoom * 100)}%</span>
        {fit === "contain" && (
          <Button type="button" variant="secondary" onClick={fillFrame}>
            Заполнить кадр
          </Button>
        )}
        <Button type="button" variant="secondary" onClick={() => onChange({ zoom: 1, x: 0, y: 0 })}>
          Сбросить
        </Button>
      </div>
      <p className="text-xs text-zinc-500">Перетаскивайте картинку мышкой, ползунок — масштаб.</p>
    </div>
  );
}
