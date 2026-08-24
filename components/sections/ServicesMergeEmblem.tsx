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

// Each discipline rendered as a distinct "material" rather than a plain
// icon — logo as vector/line energy, website as structured grid geometry,
// marketing as a small particle cluster — so the three read as genuinely
// different substances before they merge into one.
function GlyphMaterial({ glyph }: { glyph: (typeof GLYPHS)[number] }) {
  if (glyph === "logo") {
    return (
      <svg aria-hidden viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <path
          d="M20 3 L37 20 L20 37 L3 20 Z"
          stroke="var(--zaz-accent)"
          strokeWidth="1.4"
          style={{ filter: "drop-shadow(0 0 3px color-mix(in srgb, var(--zaz-accent) 60%, transparent))" }}
        />
        <path d="M20 12 L28 20 L20 28 L12 20 Z" stroke="var(--zaz-accent-dim)" strokeWidth="1" />
      </svg>
    );
  }
  if (glyph === "website") {
    return (
      <svg aria-hidden viewBox="0 0 40 40" className="h-8 w-8" fill="none">
        <rect x="4" y="6" width="32" height="28" rx="2" stroke="var(--zaz-accent)" strokeWidth="1.3" />
        <line x1="4" y1="14" x2="36" y2="14" stroke="var(--zaz-accent)" strokeWidth="1.3" />
        <line x1="16" y1="14" x2="16" y2="34" stroke="var(--zaz-accent-dim)" strokeWidth="1" />
        <line x1="4" y1="24" x2="16" y2="24" stroke="var(--zaz-accent-dim)" strokeWidth="1" />
      </svg>
    );
  }
  return (
    <div aria-hidden className="relative h-8 w-8">
      {[
        { x: 6, y: 22, s: 5 },
        { x: 16, y: 10, s: 7 },
        { x: 26, y: 18, s: 4 },
        { x: 20, y: 26, s: 6 },
        { x: 30, y: 6, s: 3 },
      ].map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-zaz-accent"
          style={{ left: p.x, top: p.y, width: p.s, height: p.s, opacity: 0.5 + (i % 3) * 0.15 }}
        />
      ))}
    </div>
  );
}

/**
 * Services hero: three "materials" — a vector-line logo mark, a
 * structured UI/grid shape, and a small particle cluster, standing in for
 * Logo Design / Website Design / Digital Marketing as visibly different
 * substances — orbit independently around a shared center forever.
 * Periodically all three converge to the center and interlock; right as
 * they merge, a composite ZAZ emblem materializes at the shared point (the
 * three disciplines literally becoming one studio mark), holds, fades as
 * the three release back out to independent orbit — reversing spin
 * direction each release, so it never repeats identically. Dragging rotates
 * the whole composition.
 */
export default function ServicesMergeEmblem() {
  const stageRef = useRef<HTMLDivElement>(null);
  const glyphRefs = useRef<(HTMLDivElement | null)[]>([]);
  const emblemRef = useRef<HTMLDivElement>(null);

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

      // Periodic converge → hold → release cycle, with the composite emblem
      // materializing right as the three disciplines interlock.
      const cycle = gsap.timeline({ repeat: -1, delay: 1.2 });
      cycle
        .call(() => orbitTweens.forEach((t) => t.pause()))
        .to(state, { radius: 0, duration: 1.1, ease: "power3.inOut", stagger: 0.06, onUpdate: render })
        .to(emblemRef.current, { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .to({}, { duration: 1 }) // hold, merged — the emblem is the moment
        .to(emblemRef.current, { opacity: 0, scale: 0.7, duration: 0.4, ease: "power1.in" })
        .to(state, { radius: RADIUS, duration: 1, ease: "power2.inOut", stagger: 0.06, onUpdate: render }, "-=0.15")
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
        {/* Composite emblem — materializes only at the merge point */}
        <div
          ref={emblemRef}
          aria-hidden
          className="pointer-events-none absolute z-30 flex h-[26%] w-[26%] scale-75 items-center justify-center rounded-[var(--zaz-radius)] border border-zaz-accent opacity-0 shadow-2xl shadow-black/50"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--zaz-accent) 45%, transparent) 0%, transparent 70%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-bg-deep) 100%)",
          }}
        >
          <span className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2rem)" }}>
            Z
          </span>
        </div>

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
              <GlyphMaterial glyph={glyph} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
