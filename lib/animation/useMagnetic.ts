"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";

type UseMagneticOptions = {
  /** Max translate offset in px. */
  strength?: number;
  enabled?: boolean;
  /**
   * Extra upward lift (px) applied while hovered, on top of the magnetic
   * pull. Once GSAP drives x/y on an element it takes over the transform and
   * writes the native `translate`/`rotate`/`scale` CSS properties to "none"
   * inline (highest specificity short of !important) to prevent double
   * transforms — which silently cancels any CSS `hover:-translate-y-*`
   * utility on the same element. The lift belongs here, in the same system
   * that now owns the transform, rather than in a competing CSS class.
   */
  liftOnHover?: number;
};

/**
 * Pointer-proximity magnetic pull: translates the element a few px toward
 * the pointer while hovered, springs back on leave. Transform-only via
 * gsap.quickTo; disabled under prefers-reduced-motion and on coarse pointers.
 */
export function useMagnetic<T extends HTMLElement>({
  strength = 10,
  enabled = true,
  liftOnHover = 0,
}: UseMagneticOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const setX = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3.out" });
    const setY = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3.out" });

    function handlePointerEnter() {
      setY(-liftOnHover);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = el!.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setX(px * strength);
      setY(py * strength - liftOnHover);
    }

    function handlePointerLeave() {
      setX(0);
      setY(0);
    }

    el.addEventListener("pointerenter", handlePointerEnter);
    el.addEventListener("pointermove", handlePointerMove);
    el.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      el.removeEventListener("pointerenter", handlePointerEnter);
      el.removeEventListener("pointermove", handlePointerMove);
      el.removeEventListener("pointerleave", handlePointerLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength, enabled, liftOnHover]);

  return ref;
}

export default useMagnetic;
