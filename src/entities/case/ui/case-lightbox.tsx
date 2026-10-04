"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useDictionary } from "@/shared/i18n/locale-provider";
import { format } from "@/shared/i18n/localize-path";
import { useLenis } from "@/shared/lib/smooth-scroll-provider";
import type { CaseMediaItem } from "../model/types";

type CaseLightboxProps = {
  /** Images only — video has its own native fullscreen. */
  images: CaseMediaItem[];
  index: number;
  title: string;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/** Full-screen viewer: the whole image, uncropped, however the slider frames it. */
export function CaseLightbox({ images, index, title, onIndexChange, onClose }: CaseLightboxProps) {
  const lenis = useLenis();
  const dict = useDictionary().media;
  const current = images[index];

  useEffect(() => {
    const instance = lenis?.current;
    instance?.stop();
    return () => instance?.start();
  }, [lenis]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onIndexChange(Math.max(0, index - 1));
      if (e.key === "ArrowRight") onIndexChange(Math.min(images.length - 1, index + 1));
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, images.length, onClose, onIndexChange]);

  if (!current) return null;

  const buttonClass =
    "absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[#141312]/70 text-[#ece5d6] transition-colors hover:text-[#e2451f] disabled:opacity-30";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={format(dict.lightboxLabel, { title, index: index + 1, total: images.length })}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d0c0a]/95 p-4 sm:p-8"
      onClick={onClose}
      // The portal still bubbles React events into the slider; its drag handlers must not see them.
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={current.path}
        alt={title}
        className="max-h-full max-w-full select-none object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <button type="button" onClick={onClose} aria-label={dict.close} className={`${buttonClass} right-4 top-4 sm:right-6 sm:top-6`}>
        ✕
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(index - 1);
            }}
            disabled={index === 0}
            aria-label={dict.prevImage}
            className={`${buttonClass} left-4 top-1/2 -translate-y-1/2 sm:left-6`}
          >
            ←
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onIndexChange(index + 1);
            }}
            disabled={index === images.length - 1}
            aria-label={dict.nextImage}
            className={`${buttonClass} right-4 top-1/2 -translate-y-1/2 sm:right-6`}
          >
            →
          </button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-[#141312]/70 px-3 py-1 text-xs tracking-[0.1em] text-[#b8b1a3]">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>,
    document.body
  );
}
