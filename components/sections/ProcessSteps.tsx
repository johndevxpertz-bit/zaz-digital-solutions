"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const steps = [
  {
    number: "01",
    name: "Discover",
    description: "We learn the business, the audience, and what success actually looks like.",
  },
  {
    number: "02",
    name: "Strategize",
    description: "Scope, structure, and priorities get defined before any design work starts.",
  },
  {
    number: "03",
    name: "Design",
    description: "Concepts take shape — visual direction, layout, and language, refined with feedback.",
  },
  {
    number: "04",
    name: "Build",
    description: "Design becomes a real, working product — coded, tested, and built to last.",
  },
  {
    number: "05",
    name: "Launch",
    description: "Final QA, then a controlled release with everything in place.",
  },
  {
    number: "06",
    name: "Grow",
    description: "Ongoing marketing and iteration keep momentum going after launch.",
  },
];

/**
 * Vertical scroll-linked timeline: a progress line fills as the section
 * scrolls through view (GSAP ScrollTrigger, scrub, transform-only) and the
 * step whose midpoint crosses the viewport center is highlighted
 * (IntersectionObserver, not a scroll listener — cheap, no per-frame work).
 * Both effects are purely transform/color state; reduced-motion keeps every
 * step fully visible and simply skips the scrubbed line-fill animation.
 */
export default function ProcessSteps() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    let cleanupLine: (() => void) | undefined;

    if (!prefersReducedMotion()) {
      registerGsap();
      const anim = gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top 75%",
            end: "bottom 65%",
            scrub: true,
          },
        }
      );
      cleanupLine = () => {
        anim.scrollTrigger?.kill();
        anim.kill();
      };
    } else {
      gsap.set(line, { scaleY: 1 });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index);
            setActiveIndex(index);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );
    for (const el of stepRefs.current) {
      if (el) observer.observe(el);
    }

    return () => {
      cleanupLine?.();
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div aria-hidden className="absolute left-4 top-1 h-[calc(100%-8px)] w-px bg-zaz-border md:left-5" />
      <div
        ref={lineRef}
        aria-hidden
        className="absolute left-4 top-1 h-[calc(100%-8px)] w-px origin-top bg-zaz-accent md:left-5"
        style={{ transform: "scaleY(0)" }}
      />

      <div className="flex flex-col gap-10 md:gap-12">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={step.number}
              ref={(el) => {
                stepRefs.current[index] = el;
              }}
              data-index={index}
              className="relative pl-12 md:pl-16"
            >
              <span
                aria-hidden
                className={`absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full border font-heading text-xs font-semibold transition-all duration-500 ease-[var(--zaz-ease)] md:h-10 md:w-10 ${
                  isActive
                    ? "scale-110 border-zaz-accent bg-zaz-accent text-zaz-bg-deep"
                    : "border-zaz-border-strong bg-zaz-bg-deep text-zaz-text-secondary"
                }`}
              >
                {step.number}
              </span>
              <h3
                className={`font-heading text-lg font-semibold transition-colors duration-500 ease-[var(--zaz-ease)] ${
                  isActive ? "text-zaz-accent" : "text-zaz-text"
                }`}
              >
                {step.name}
              </h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-zaz-text-secondary">{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
