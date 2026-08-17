"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";

type UseTiltOptions = {
  /** Max rotation in degrees. */
  max?: number;
  /** Scale applied while hovered. */
  scale?: number;
};

/**
 * Pointer-position 3D tilt + scale, for card hover depth. Transform-only
 * (GPU-friendly, no layout reflow); uses gsap.quickTo so updates are
 * smoothed on GSAP's own ticker rather than applied synchronously per event.
 * Disabled under prefers-reduced-motion and on coarse/touch pointers.
 */
export function useTilt<T extends HTMLElement>({ max = 8, scale = 1.02 }: UseTiltOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    gsap.set(el, { transformPerspective: 800, transformStyle: "preserve-3d" });

    // GSAP's transform shorthands are "rotationX"/"rotationY" — "rotateX"/
    // "rotateY" (no "ion") are not recognized, so quickTo would silently no-op.
    const setRotateX = gsap.quickTo(el, "rotationX", { duration: 0.4, ease: "power3.out" });
    const setRotateY = gsap.quickTo(el, "rotationY", { duration: 0.4, ease: "power3.out" });
    // Combined "scale" can't be reset to 1 once GSAP has it split across the
    // native scaleX/scaleY transform properties (GSAP warns "scale not
    // eligible for reset. Try splitting into individual properties" and
    // silently drops the reset) — so scaleX/scaleY are driven individually
    // instead of via the "scale" shorthand, exactly as GSAP's own message
    // recommends. Uniform scale, same visual result.
    const setScaleX = gsap.quickTo(el, "scaleX", { duration: 0.4, ease: "power3.out" });
    const setScaleY = gsap.quickTo(el, "scaleY", { duration: 0.4, ease: "power3.out" });

    function handlePointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setRotateY(px * max);
      setRotateX(-py * max);
      setScaleX(scale);
      setScaleY(scale);
    }

    function handlePointerLeave() {
      setRotateX(0);
      setRotateY(0);
      setScaleX(1);
      setScaleY(1);
    }

    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      gsap.set(el, { rotationX: 0, rotationY: 0, scaleX: 1, scaleY: 1 });
    };
  }, [max, scale]);

  return ref;
}

export default useTilt;
