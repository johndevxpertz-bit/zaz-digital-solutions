"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type PortfolioOrbitGalleryProps = {
  thumbnails: { src: string; alt: string }[];
};

const RADIUS = 130;

// Math.sin/cos aren't guaranteed bit-identical across JS engines (server
// Node vs. browser V8 can differ in the last few decimal places) — rounding
// keeps the server-rendered inline style and the client's first computed
// value identical, avoiding a hydration mismatch on this SSR'd component.
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

/** Matches exactly what the orbit's own render() computes at angle=0 — the
 * resting composition for reduced-motion users and the instant before this
 * component's effect runs. */
function restingTransform(i: number, n: number): React.CSSProperties {
  const a = ((360 / n) * i * Math.PI) / 180;
  const z = round(Math.cos(a) * RADIUS);
  const x = round(Math.sin(a) * RADIUS);
  const depth = (z + RADIUS) / (2 * RADIUS);
  const scale = 0.72 + depth * 0.4;
  return {
    transform: `translate3d(${x}px, 0px, ${z}px) scale(${scale})`,
    opacity: 0.55 + depth * 0.45,
    zIndex: Math.round(depth * 100),
    filter: `brightness(${0.75 + depth * 0.4})`,
  };
}

/**
 * Portfolio hero: real project thumbnails on a continuous 3D orbit around a
 * central point — genuine circular motion (angle-driven, not phase
 * keyframes), so it never "finishes" and always has something moving. The
 * frontmost tile (closest to the viewer in the orbit) reads largest and
 * brightest; tiles swing through back and front continuously. Dragging spins
 * the orbit manually with inertia (same feel as the Home cube's drag);
 * hovering a tile pauses the orbit and brings that tile forward.
 */
export default function PortfolioOrbitGallery({ thumbnails }: PortfolioOrbitGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = thumbnails.slice(0, 4);

  useEffect(() => {
    const stage = stageRef.current;
    const tiles = tileRefs.current.filter((t): t is HTMLDivElement => !!t);
    if (!stage || tiles.length === 0) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const n = tiles.length;
      const radius = 130;
      const state = { angle: 0 };
      let hovered = -1;

      function render() {
        tiles.forEach((tile, i) => {
          const a = ((state.angle + (360 / n) * i) * Math.PI) / 180;
          const z = Math.cos(a) * radius;
          const x = Math.sin(a) * radius;
          const depth = (z + radius) / (2 * radius); // 0 (back) .. 1 (front)
          const scale = 0.72 + depth * 0.4;
          const isHovered = hovered === i;
          gsap.set(tile, {
            x,
            z: isHovered ? radius + 40 : z,
            scale: isHovered ? scale * 1.12 : scale,
            opacity: 0.55 + depth * 0.45,
            zIndex: Math.round(depth * 100),
            filter: `brightness(${0.75 + depth * 0.4})`,
          });
        });
      }
      render();

      // Continuous orbit — a proxy angle tween, eased "none" so it's a
      // perfectly steady rotation, with GSAP driving frame updates.
      const orbitTween = gsap.to(state, { angle: 360, duration: 26, ease: "none", repeat: -1, onUpdate: render });

      // Drag: kill the auto-orbit, follow the pointer with a direct angle
      // offset, then resume auto-orbit with inertia on release.
      let isDragging = false;
      let lastX = 0;
      let dragVelocity = 0;

      function onDown(e: PointerEvent) {
        isDragging = true;
        lastX = e.clientX;
        dragVelocity = 0;
        orbitTween.pause();
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        dragVelocity = dx;
        state.angle += dx * 0.5;
        render();
      }
      function onUp() {
        if (!isDragging) return;
        isDragging = false;
        const flick = { v: dragVelocity };
        gsap.to(flick, {
          v: 0,
          duration: 1,
          ease: "power2.out",
          onUpdate: () => {
            state.angle += flick.v * 0.5 * 0.06;
            render();
          },
          onComplete: () => {
            orbitTween.resume();
          },
        });
      }
      stage.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      // Hover: pause rotation, bring that tile forward.
      tiles.forEach((tile, i) => {
        tile.addEventListener("pointerenter", () => {
          hovered = i;
          orbitTween.pause();
          render();
        });
        tile.addEventListener("pointerleave", () => {
          hovered = -1;
          if (!isDragging) orbitTween.resume();
          render();
        });
      });

      return () => {
        stage.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, stageRef);

    return () => ctx.revert();
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[420px]" style={{ perspective: 1000 }}>
      <div className="relative flex h-full w-full items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {items.map((thumb, i) => (
          <div
            key={thumb.src}
            ref={(el) => {
              tileRefs.current[i] = el;
            }}
            className="absolute h-[54%] w-[54%] cursor-grab touch-none overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40 active:cursor-grabbing"
            style={{ transformStyle: "preserve-3d", ...restingTransform(i, items.length) }}
          >
            <Image src={thumb.src} alt={thumb.alt} fill sizes="230px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
