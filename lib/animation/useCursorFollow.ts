"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";

/**
 * Tracks pointer position within a container and moves a follower element to
 * match, fading it in/out on enter/leave. Used for the portfolio "View
 * project" pill. Transform-only via gsap.quickTo; disabled under
 * prefers-reduced-motion and on coarse/touch pointers (the static overlay
 * already shipped on the tile remains the fallback affordance there).
 */
export function useCursorFollow<C extends HTMLElement, F extends HTMLElement>() {
  const containerRef = useRef<C>(null);
  const followerRef = useRef<F>(null);

  useEffect(() => {
    const container = containerRef.current;
    const follower = followerRef.current;
    if (!container || !follower) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    gsap.set(follower, { xPercent: -50, yPercent: -50, scale: 0.8 });

    const setX = gsap.quickTo(follower, "x", { duration: 0.35, ease: "power3.out" });
    const setY = gsap.quickTo(follower, "y", { duration: 0.35, ease: "power3.out" });

    function handlePointerMove(event: PointerEvent) {
      const rect = container!.getBoundingClientRect();
      setX(event.clientX - rect.left);
      setY(event.clientY - rect.top);
    }

    function handlePointerEnter(event: PointerEvent) {
      handlePointerMove(event);
      gsap.to(follower, { opacity: 1, scale: 1, duration: 0.3, ease: "power3.out" });
    }

    function handlePointerLeave() {
      gsap.to(follower, { opacity: 0, scale: 0.8, duration: 0.25, ease: "power3.out" });
    }

    container.addEventListener("pointermove", handlePointerMove);
    container.addEventListener("pointerenter", handlePointerEnter);
    container.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerenter", handlePointerEnter);
      container.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return { containerRef, followerRef };
}

export default useCursorFollow;
