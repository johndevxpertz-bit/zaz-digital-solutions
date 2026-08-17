"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import { useParallax } from "@/lib/animation/useParallax";

/**
 * Layered hero atmosphere: a scroll-parallax layer (existing glow + grid,
 * now via the shared useParallax hook) plus a second glow that ambiently
 * floats on its own and gently follows the cursor for depth. CSS/transform
 * only — no particle/canvas work.
 */
export default function HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useParallax<HTMLDivElement>({ speed: 14 });
  const followGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const glow = followGlowRef.current;
    if (!wrapper || !glow) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    // Listener lives on the ancestor <section> (has normal pointer-events;
    // this wrapper is pointer-events-none so it never blocks hero content).
    const section = wrapper.closest("section");
    if (!section) return;

    registerGsap();

    const setX = gsap.quickTo(glow, "x", { duration: 0.8, ease: "power3.out" });
    const setY = gsap.quickTo(glow, "y", { duration: 0.8, ease: "power3.out" });

    function handlePointerMove(event: Event) {
      const { clientX, clientY } = event as PointerEvent;
      const rect = section!.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      setX(px * 40);
      setY(py * 40);
    }

    section.addEventListener("pointermove", handlePointerMove);
    return () => section.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div
      ref={wrapperRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      {/* Scroll-parallax layer: original glow + grid texture. */}
      <div ref={parallaxRef} className="absolute inset-0">
        <div
          className="absolute left-1/2 top-[-10%] h-[70vh] w-[70vh] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)",
            opacity: 0.08,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(var(--zaz-text) 1px, transparent 1px), linear-gradient(90deg, var(--zaz-text) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 30%, black 0%, transparent 75%)",
          }}
        />
      </div>

      {/* Ambient-float + mouse-follow layer: independent second glow for depth. */}
      <div
        ref={followGlowRef}
        className="zaz-float-b absolute right-[8%] top-[20%] h-[55vh] w-[55vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)",
          opacity: 0.06,
        }}
      />
    </div>
  );
}
