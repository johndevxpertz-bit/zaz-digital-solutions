"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const GLYPHS = ["logo", "website", "marketing"] as const;
const RADIUS = 100;

// Math.sin/cos aren't guaranteed bit-identical across JS engines (server
// Node vs. browser V8 can differ in the last few decimal places) — rounding
// keeps the server-rendered inline style and the client's first computed
// value identical, avoiding a hydration mismatch on this SSR'd component.
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

function glyphTransform(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: round(Math.sin(a) * radius), z: round(Math.cos(a) * radius) };
}

/**
 * Services hero: three glyphs (logo mark, browser-window shape, growth-bar
 * shape — one per discipline) orbit independently around a shared center
 * forever. Periodically all three simultaneously converge to the center,
 * interlocking into one composite emblem (design + development + marketing
 * becoming one studio, made literal), hold there, then release back out to
 * independent orbit — reversing spin direction each release, so it never
 * repeats identically. Dragging rotates the whole composition.
 */
export default function ServicesMergeEmblem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const glyphRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const glyphs = glyphRefs.current;
    if (glyphs.some((g) => !g)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const n = GLYPHS.length;
      const state = glyphs.map((_, i) => ({ angle: (360 / n) * i, radius: RADIUS, spin: 0 }));

      function render() {
        state.forEach((s, i) => {
          const { x, z } = glyphTransform(s.angle, s.radius);
          const merged = s.radius < RADIUS * 0.3;
          gsap.set(glyphs[i], {
            x,
            z,
            rotationZ: s.spin,
            scale: merged ? 1.1 : 0.9,
            opacity: merged ? 1 : 0.85,
            zIndex: Math.round(z + 200),
          });
        });
      }
      render();

      // Independent continuous orbit per glyph, always running. Each is an
      // infinite tween whose playback direction gets flipped (via
      // timeScale, not by recreating the tween) after every merge cycle
      // below, for genuine reversal rather than a no-op variable flip.
      const orbitTweens = state.map((s, i) =>
        gsap.to(s, { angle: "+=360", duration: 20 + i * 3, ease: "none", repeat: -1, onUpdate: render })
      );
      state.forEach((s, i) => {
        gsap.to(s, { spin: 360, duration: 12 + i * 2, ease: "none", repeat: -1, onUpdate: render });
      });

      // Periodic converge → hold → release cycle.
      const cycle = gsap.timeline({ repeat: -1, delay: 1.2 });
      cycle
        .call(() => orbitTweens.forEach((t) => t.pause()))
        .to(state, { radius: 0, duration: 1.1, ease: "power3.inOut", stagger: 0.06, onUpdate: render })
        .to({}, { duration: 1.4 }) // hold, merged
        .to(state, { radius: RADIUS, duration: 1, ease: "power2.inOut", stagger: 0.06, onUpdate: render })
        .call(() => {
          orbitTweens.forEach((t) => {
            t.timeScale(t.timeScale() * -1);
            t.resume();
          });
        })
        .to({}, { duration: 3.5 }); // continue orbiting before next merge

      // Drag rotates the whole composition (offsets every glyph's angle).
      const stage = stageRef.current;
      let isDragging = false;
      let lastX = 0;
      function onDown(e: PointerEvent) {
        isDragging = true;
        lastX = e.clientX;
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        state.forEach((s) => (s.angle += dx * 0.4));
        render();
      }
      function onUp() {
        isDragging = false;
      }
      stage?.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      return () => {
        stage?.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[380px]" style={{ perspective: 900 }}>
      <div className="relative flex h-full w-full items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {GLYPHS.map((glyph, i) => {
          const { x, z } = glyphTransform((360 / GLYPHS.length) * i, RADIUS);
          return (
            <div
              key={glyph}
              ref={(el) => {
                glyphRefs.current[i] = el;
              }}
              className="absolute flex h-[30%] w-[30%] cursor-grab touch-none items-center justify-center rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface shadow-2xl shadow-black/40 active:cursor-grabbing"
              style={{ transform: `translate3d(${x}px, 0px, ${z}px)`, transformStyle: "preserve-3d" }}
            >
              {glyph === "logo" && (
                <span aria-hidden className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)" }}>
                  Z
                </span>
              )}
              {glyph === "website" && (
                <svg aria-hidden viewBox="0 0 24 24" className="h-7 w-7" fill="none">
                  <rect x="3" y="4" width="18" height="16" rx="2" stroke="var(--zaz-accent)" strokeWidth="1.4" />
                  <line x1="3" y1="8.5" x2="21" y2="8.5" stroke="var(--zaz-accent)" strokeWidth="1.4" />
                </svg>
              )}
              {glyph === "marketing" && (
                <div aria-hidden className="flex h-7 items-end gap-1">
                  {[40, 70, 55, 90].map((h, idx) => (
                    <span key={idx} className="w-1.5 rounded-sm bg-zaz-accent" style={{ height: `${h}%`, opacity: 0.5 + idx * 0.12 }} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
