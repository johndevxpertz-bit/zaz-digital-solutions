"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";
import { getPlaceholderVariant, getLetterform } from "@/lib/placeholderVariants";

type ImageLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string | null;
  alt: string;
  label?: string;
  /** Seed for the generated placeholder pattern when no real image exists yet. */
  placeholderSeed?: string;
};

/**
 * Premium fullscreen image viewer: dark backdrop, smooth scale/fade open,
 * closes via the X button, Escape, or a backdrop click. Locks page scroll
 * (via the same lockPageScroll/unlockPageScroll used by the mobile nav and
 * page loader, so Lenis doesn't drift while it's open) and restores it on
 * close, including on unmount mid-animation.
 *
 * Rendered via a portal into document.body — a CSS animation on any
 * ancestor (e.g. the zaz-tile-enter entrance animation on the grid tiles)
 * leaves a non-"none" `transform` behind even after it finishes, which per
 * the CSS spec turns that ancestor into the containing block for any
 * `position: fixed` descendant. Without the portal, this lightbox would
 * render "fixed" relative to that ancestor instead of the real viewport —
 * still visible, but wrong-sized/positioned, and a backdrop click outside
 * its (mis-sized) bounds would silently miss it entirely.
 */
export default function ImageLightbox({ open, onClose, src, alt, label, placeholderSeed }: ImageLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    lockPageScroll();
    closeBtnRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    let tl: gsap.core.Timeline | null = null;
    if (!prefersReducedMotion()) {
      tl = gsap.timeline();
      tl.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }).fromTo(
        panel,
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" },
        "-=0.15"
      );
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      tl?.kill();
      unlockPageScroll();
    };
  }, [open, onClose]);

  if (!open) return null;

  const variant = placeholderSeed ? getPlaceholderVariant(placeholderSeed) : null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? alt}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-zaz-bg-deep/95 p-6 backdrop-blur-sm sm:p-12"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <button
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full border border-zaz-border-strong text-zaz-text transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 sm:right-8 sm:top-8"
      >
        <svg aria-hidden width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M1 1L15 15M15 1L1 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div ref={panelRef} className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/60">
        {src ? (
          <Image src={src} alt={alt} fill sizes="(min-width: 640px) 512px, 100vw" className="object-cover" priority />
        ) : (
          <div
            className="relative flex h-full w-full items-center justify-center"
            style={variant ? { backgroundImage: variant.backgroundImage, backgroundSize: variant.backgroundSize } : undefined}
          >
            <span
              aria-hidden
              className="flex h-20 w-20 items-center justify-center rounded-full border border-zaz-border-strong bg-zaz-bg-deep/50 font-heading text-3xl font-semibold text-zaz-accent backdrop-blur-sm"
            >
              {getLetterform(label ?? alt)}
            </span>
          </div>
        )}
      </div>

      {label && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm font-medium text-zaz-text-secondary sm:bottom-10">
          {label}
        </p>
      )}
    </div>,
    document.body
  );
}
