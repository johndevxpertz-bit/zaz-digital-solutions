"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Pauses/resumes a gsap.context()'s infinite-repeat decorative tweens
 * (orbit/drift/pulse-style `repeat: -1` loops) while `element` is scrolled
 * out of view, using GSAP's own `context.getTweens()` — nothing is
 * recreated or re-authored, the exact same tween/timeline instances are
 * just paused and resumed. Deliberately excludes anything with an attached
 * `scrollTrigger`: those one-shot reveal/scrub animations are already
 * managed by ScrollTrigger itself, and pausing them here would fight that.
 * Call once per gsap.context(), passing its root element, and add the
 * returned cleanup to the same effect's existing cleanup.
 */
export function gateContextToViewport(ctx: gsap.Context, element: Element): () => void {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const loops = ctx
        .getTweens()
        .filter((tween: gsap.core.Tween) => tween.repeat() === -1 && !tween.scrollTrigger);
      loops.forEach((tween: gsap.core.Tween) => (entry.isIntersecting ? tween.resume() : tween.pause()));
    },
    { threshold: 0 }
  );
  observer.observe(element);
  return () => observer.disconnect();
}

export { gsap, ScrollTrigger };
