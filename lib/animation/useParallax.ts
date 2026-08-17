"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type UseParallaxOptions = {
  /** yPercent shift applied across the scroll range — positive drifts down, negative up. */
  speed?: number;
  /** Defaults to the element's parent (matches the original HeroBackground behavior). */
  trigger?: RefObject<HTMLElement | null>;
  start?: string;
  end?: string;
};

/**
 * Reusable scroll-scrub parallax — the pattern originally inlined in
 * HeroBackground.tsx, extracted so other decorative/media layers can move at
 * their own speed for a layered-depth effect. Respects prefers-reduced-motion.
 */
export function useParallax<T extends HTMLElement>({
  speed = 14,
  trigger,
  start = "top bottom",
  end = "bottom top",
}: UseParallaxOptions = {}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;

    registerGsap();

    const triggerEl = trigger?.current ?? el.parentElement ?? el;

    const animation = gsap.to(el, {
      yPercent: speed,
      ease: "none",
      scrollTrigger: {
        trigger: triggerEl,
        start,
        end,
        scrub: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [speed, start, end, trigger]);

  return ref;
}

export default useParallax;
