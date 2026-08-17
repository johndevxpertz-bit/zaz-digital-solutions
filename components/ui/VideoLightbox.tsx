"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";

type VideoLightboxProps = {
  open: boolean;
  onClose: () => void;
  src: string | null;
  type?: string;
  label?: string;
};

/**
 * Fullscreen video viewer for the Animated Logos category — same premium
 * open/close treatment and portal-into-body pattern as ImageLightbox (see
 * that file for why the portal matters: a completed CSS entrance animation
 * on an ancestor tile leaves behind a non-"none" transform, which becomes
 * the containing block for a `position: fixed` descendant otherwise).
 * Scroll is locked while open and always restored on close/unmount via the
 * shared reentrant lockPageScroll/unlockPageScroll pair.
 */
export default function VideoLightbox({ open, onClose, src, type, label }: VideoLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    const overlay = overlayRef.current;
    const panel = panelRef.current;
    if (!overlay || !panel) return;

    const video = videoRef.current;

    lockPageScroll();
    closeBtnRef.current?.focus();
    video?.play().catch(() => {
      // Autoplay-with-sound can be rejected by the browser; the visible
      // native controls let the visitor start playback manually instead.
    });

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
      video?.pause();
      unlockPageScroll();
    };
  }, [open, onClose]);

  if (!open || !src) return null;

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={label ?? "Animated logo"}
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

      <div
        ref={panelRef}
        className="relative aspect-[4/5] w-full max-w-lg overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-bg-deep shadow-2xl shadow-black/60"
      >
        <video
          ref={videoRef}
          className="h-full w-full object-contain"
          controls
          playsInline
          loop
          preload="metadata"
        >
          <source src={src} type={type} />
        </video>
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
