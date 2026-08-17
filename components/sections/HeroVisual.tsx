"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import useTilt from "@/lib/animation/useTilt";
import BrowserFrame from "@/components/ui/BrowserFrame";

/**
 * Abstract three-panel composition for the hero's visual half — intentionally
 * not a fake screenshot, logo, or photo (no real assets exist yet): a
 * letterform card, an empty browser-chrome frame, and a signal-bar graphic,
 * each standing in for one discipline abstractly. Floats independently
 * (existing zaz-float-a/b keyframes) plus a shared pointer-driven parallax
 * and a subtle group tilt. Purely atmospheric — never claims to be real work.
 */
export default function HeroVisual() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const tiltRef = useTilt<HTMLDivElement>({ max: 4, scale: 1.01 });

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const section = wrapper.closest("section");
    if (!section) return;

    registerGsap();
    const setX = gsap.quickTo(wrapper, "x", { duration: 0.9, ease: "power3.out" });
    const setY = gsap.quickTo(wrapper, "y", { duration: 0.9, ease: "power3.out" });

    function handlePointerMove(event: Event) {
      const { clientX, clientY } = event as PointerEvent;
      const rect = section!.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      setX(px * 16);
      setY(py * 16);
    }

    section.addEventListener("pointermove", handlePointerMove);
    return () => section.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div ref={wrapperRef} className="relative h-full w-full">
        {/* Logo panel — abstract letterform, not a real mark */}
        <div
          className="zaz-float-a absolute left-0 top-0 flex h-[46%] w-[52%] items-center justify-center overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--zaz-accent) 18%, transparent) 0%, transparent 60%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
          }}
        >
          <span
            aria-hidden
            className="font-heading font-semibold text-zaz-accent"
            style={{ fontSize: "clamp(2.75rem, 7vw, 4rem)" }}
          >
            Z
          </span>
        </div>

        {/* Website panel — empty browser chrome, no fake content */}
        <div className="zaz-float-b absolute right-0 top-[8%] h-[42%] w-[58%] -rotate-2 overflow-hidden rounded-[var(--zaz-radius)] shadow-2xl shadow-black/40">
          <BrowserFrame>
            <div
              className="h-full w-full"
              style={{ background: "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)" }}
            />
          </BrowserFrame>
        </div>

        {/* Marketing panel — abstract signal bars, no invented numbers */}
        <div
          className="zaz-float-a absolute bottom-0 left-[8%] flex h-[34%] w-[48%] items-end gap-2 overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border p-6 shadow-2xl shadow-black/40"
          style={{
            animationDelay: "-6s",
            background: "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
          }}
        >
          {[38, 62, 46, 80, 54].map((height, index) => (
            <span
              key={index}
              aria-hidden
              className="flex-1 rounded-sm bg-zaz-accent"
              style={{ height: `${height}%`, opacity: 0.5 + index * 0.08 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
