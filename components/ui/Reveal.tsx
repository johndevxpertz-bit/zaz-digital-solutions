"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

export type RevealVariant = "fade-up" | "fade-scale" | "blur-up" | "clip-reveal";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Animate immediately on mount instead of waiting for scroll (e.g. hero content). */
  immediate?: boolean;
  /** Motion pattern — defaults to the original fade+rise so existing call sites are unaffected. */
  variant?: RevealVariant;
};

/** GSAP tween targets — uses GSAP's own shorthands (y, scale), not raw CSS. */
function gsapHidden(variant: RevealVariant, y: number): gsap.TweenVars {
  switch (variant) {
    case "fade-scale":
      return { opacity: 0, scale: 0.94 };
    case "blur-up":
      return { opacity: 0, y, filter: "blur(8px)" };
    case "clip-reveal":
      return { clipPath: "inset(0% 0% 100% 0%)" };
    case "fade-up":
    default:
      return { opacity: 0, y };
  }
}

function gsapVisible(variant: RevealVariant): gsap.TweenVars {
  switch (variant) {
    case "fade-scale":
      return { opacity: 1, scale: 1 };
    case "blur-up":
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    case "clip-reveal":
      return { clipPath: "inset(0% 0% 0% 0%)" };
    case "fade-up":
    default:
      return { opacity: 1, y: 0 };
  }
}

/** Plain-CSS equivalent of gsapHidden, for the SSR-safe initial inline style
 * (must match gsapHidden's visual result exactly so there's no flash — see
 * the hydration-flash fix from the previous session). */
function cssHidden(variant: RevealVariant, y: number): React.CSSProperties {
  switch (variant) {
    case "fade-scale":
      return { opacity: 0, transform: "scale(0.94)" };
    case "blur-up":
      return { opacity: 0, transform: `translateY(${y}px)`, filter: "blur(8px)" };
    case "clip-reveal":
      return { clipPath: "inset(0% 0% 100% 0%)" };
    case "fade-up":
    default:
      return { opacity: 0, transform: `translateY(${y}px)` };
  }
}

export default function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  immediate = false,
  variant = "fade-up",
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      gsap.set(el, gsapVisible(variant));
      return;
    }

    registerGsap();

    const animation = gsap.fromTo(el, gsapHidden(variant, y), {
      ...gsapVisible(variant),
      duration: 0.9,
      delay,
      ease: "power3.out",
      scrollTrigger: immediate
        ? undefined
        : {
            trigger: el,
            start: "top 85%",
            once: true,
          },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [delay, y, immediate, variant]);

  return (
    <div ref={ref} data-reveal className={className} style={cssHidden(variant, y)}>
      {children}
    </div>
  );
}
