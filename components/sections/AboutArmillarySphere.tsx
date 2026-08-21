"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const RINGS = [
  { size: 88, rotationX: 62, rotationY: 8, duration: 22 },
  { size: 70, rotationX: 22, rotationY: 58, duration: 28 },
  { size: 52, rotationX: -48, rotationY: 36, duration: 17 },
];

/**
 * About hero: a slowly tumbling "armillary sphere" — nested rings on
 * different fixed tilts, each continuously spinning around its own axis, so
 * they pass in front of and behind each other and the ZAZ mark at the
 * center for real depth (not a single flat spin). The whole sphere also
 * drifts through a slow multi-axis tumble as a group. Deliberately slower
 * and calmer than the service pages, with a soft highlight sweeping across
 * the geometry as it turns. Dragging reorients it; it always settles back
 * into ambient tumble a moment after release, the same "always alive"
 * quality as the Home cube.
 */
export default function AboutArmillarySphere() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const highlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const group = groupRef.current;
    const rings = ringRefs.current;
    const highlight = highlightRef.current;
    if (!group || rings.some((r) => !r) || !highlight) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      // Re-establish each ring's base tilt through GSAP's own tracked
      // rotation properties (matching the plain-CSS resting transform
      // exactly) so the continuous per-ring spin layered on top composes
      // correctly instead of clobbering the tilt.
      rings.forEach((ring, i) => {
        gsap.set(ring, { rotationX: RINGS[i].rotationX, rotationY: RINGS[i].rotationY });
        gsap.to(ring, { rotationZ: 360, duration: RINGS[i].duration, ease: "none", repeat: -1 });
      });

      // Slow ambient multi-axis tumble of the whole sphere.
      const idleTumble = [
        gsap.to(group, { rotationY: "+=40", duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        gsap.to(group, { rotationX: "+=14", duration: 12, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 }),
      ];

      // Highlight sweep, synced loosely to the tumble via its own loop.
      gsap.to(highlight, { rotate: 360, duration: 20, ease: "none", repeat: -1, transformOrigin: "50% 50%" });

      // Drag reorients the sphere; ambient tumble resumes after release.
      const stage = stageRef.current;
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;

      function onDown(e: PointerEvent) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        idleTumble.forEach((t) => t.pause());
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        gsap.set(group, {
          rotationY: `+=${dx * 0.4}`,
          rotationX: `+=${-dy * 0.3}`,
        });
      }
      function onUp() {
        if (!isDragging) return;
        isDragging = false;
        gsap.delayedCall(0.5, () => idleTumble.forEach((t) => t.resume()));
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
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[380px]" style={{ perspective: 1000 }}>
      <div
        ref={groupRef}
        className="relative flex h-full w-full cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute h-[74%] w-[74%] rounded-full"
          style={{ background: "radial-gradient(circle at 32% 30%, color-mix(in srgb, var(--zaz-accent) 16%, transparent) 0%, transparent 68%)" }}
        />
        {RINGS.map((ring, i) => (
          <div
            key={i}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            aria-hidden
            className="absolute rounded-full border"
            style={{
              width: `${ring.size}%`,
              height: `${ring.size}%`,
              borderColor: "var(--zaz-border-strong)",
              borderWidth: 1.25,
              transform: `rotateX(${ring.rotationX}deg) rotateY(${ring.rotationY}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            <div
              ref={i === 0 ? highlightRef : undefined}
              aria-hidden
              className="absolute -inset-[10%] rounded-full opacity-70"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0%, color-mix(in srgb, var(--zaz-accent) 70%, transparent) 4%, transparent 10%)",
              }}
            />
          </div>
        ))}
        <span aria-hidden className="relative z-10 font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.25rem)" }}>
          ZAZ
        </span>
      </div>
    </div>
  );
}
