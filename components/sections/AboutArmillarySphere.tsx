"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion, gateContextToViewport } from "@/lib/animation/gsap";

// Math.sin/cos aren't guaranteed bit-identical across JS engines (server
// Node vs. browser V8 can differ in the last few decimal places) — rounding
// keeps the server-rendered inline style and the client's first computed
// value identical, avoiding a hydration mismatch on this SSR'd component.
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}
function restXZ(angleDeg: number, radius: number) {
  const a = (angleDeg * Math.PI) / 180;
  return { x: round(Math.sin(a) * radius), z: round(Math.cos(a) * radius) };
}

// Three orbital planes, each at its own tilt/radius/base-speed — the paths
// the digital objects below travel along. Rendered as thin rings so the
// silhouette reads as an orbital system at a glance.
const RINGS = [
  { radius: 150, tiltX: 62, tiltY: 8, duration: 30 },
  { radius: 112, tiltX: 18, tiltY: 56, duration: 22 },
  { radius: 78, tiltX: -46, tiltY: 32, duration: 15 },
];

// Digital/creative objects riding those planes — never literal planets.
// Each has its own orbital speed independent of its ring's own rotation, so
// nothing in the system moves in lockstep — the "organic, not mechanical"
// requirement. angle is the resting (t=0) position.
const OBJECTS = [
  { ring: 0, kind: "browser" as const, angle: 20, duration: 24, size: 30 },
  { ring: 0, kind: "glow" as const, angle: 205, duration: 33, size: 10 },
  { ring: 1, kind: "logo" as const, angle: 95, duration: 17, size: 24 },
  { ring: 1, kind: "data" as const, angle: 260, duration: 26, size: 22 },
  { ring: 2, kind: "grid" as const, angle: 150, duration: 12, size: 19 },
  { ring: 2, kind: "ui" as const, angle: 330, duration: 16.5, size: 21 },
];

function OrbitBody({ kind }: { kind: (typeof OBJECTS)[number]["kind"] }) {
  switch (kind) {
    case "browser":
      return (
        <div className="h-full w-full rounded-[4px] border border-zaz-accent bg-zaz-surface-alt shadow-lg shadow-black/25">
          <div className="flex h-[30%] items-center gap-[2px] border-b border-zaz-border px-[3px]">
            <span className="h-[3px] w-[3px] rounded-full bg-zaz-accent-dim" />
            <span className="h-[3px] w-[3px] rounded-full bg-zaz-accent-dim opacity-60" />
          </div>
        </div>
      );
    case "logo":
      return (
        <div
          className="h-full w-full rotate-45 rounded-[3px] border-2 border-zaz-accent bg-zaz-bg-deep shadow-lg shadow-black/25"
          style={{ boxShadow: "0 0 10px color-mix(in srgb, var(--zaz-accent) 45%, transparent)" }}
        />
      );
    case "grid":
      return (
        <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-[2px]">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="rounded-[1px] border border-zaz-accent" style={{ opacity: 0.65 + (i % 2) * 0.3 }} />
          ))}
        </div>
      );
    case "data":
      return (
        <div className="flex h-full w-full items-end gap-[2px] rounded-[3px] border border-zaz-accent-dim bg-zaz-surface-alt/80 px-[3px] pb-[2px] shadow-lg shadow-black/25">
          {[45, 75, 60, 90].map((h, i) => (
            <span key={i} className="flex-1 rounded-[1px] bg-zaz-accent" style={{ height: `${h}%`, opacity: 0.5 + i * 0.1 }} />
          ))}
        </div>
      );
    case "ui":
      return (
        <div
          className="h-full w-full rounded-full border border-zaz-accent bg-zaz-surface-alt shadow-lg shadow-black/25"
          style={{
            background:
              "radial-gradient(circle at 32% 28%, color-mix(in srgb, var(--zaz-accent) 35%, transparent) 0%, transparent 62%), linear-gradient(140deg, var(--zaz-surface-alt), var(--zaz-bg-deep))",
          }}
        />
      );
    case "glow":
    default:
      return (
        <div
          className="h-full w-full rounded-full bg-zaz-accent"
          style={{ boxShadow: "0 0 12px 3px color-mix(in srgb, var(--zaz-accent) 60%, transparent)" }}
        />
      );
  }
}

/**
 * About hero: a ZAZ digital universe — a glowing layered core at the center
 * with three tilted orbital rings around it, each carrying two small
 * digital/creative objects (a browser glyph, a logo mark, a design-grid
 * fragment, a data node, a UI chip, a glow point) that travel their ring's
 * plane at their own independent speed. From a distance it reads as a small
 * orbital/solar system; on a second look every "planet" turns out to be a
 * piece of the studio's craft. Depth-based scale/opacity brings each object
 * forward as it swings to the front of its orbit and recedes as it passes
 * behind the core. The core itself slowly evolves (independent nested
 * rotation + a periodic pulse), a light sweep drifts across the outer ring,
 * and the whole assembly tumbles through a slow multi-axis idle. A separate
 * outer layer responds to mouse position with a small perspective
 * parallax; dragging lets the visitor rotate the whole system directly;
 * hovering an object brings it forward with a soft glow.
 */
export default function AboutArmillarySphere() {
  const stageRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const ringRefs = useRef<(HTMLDivElement | null)[]>([]);
  const highlightRef = useRef<HTMLDivElement>(null);
  const bodyRefs = useRef<(HTMLDivElement | null)[]>([]);
  const coreInnerRef = useRef<HTMLDivElement>(null);
  const coreGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parallax = parallaxRef.current;
    const group = groupRef.current;
    const rings = ringRefs.current;
    const bodies = bodyRefs.current;
    if (!parallax || !group || rings.some((r) => !r) || bodies.some((b) => !b)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      rings.forEach((ring, i) => {
        gsap.set(ring, { rotationX: RINGS[i].tiltX, rotationY: RINGS[i].tiltY });
        gsap.to(ring, { rotationZ: 360, duration: RINGS[i].duration, ease: "none", repeat: -1 });
      });

      // Each orbit body travels its ring's plane at its own independent
      // speed via a proxy angle tween — never in lockstep with the others.
      const bodyState = OBJECTS.map((o) => ({ angle: o.angle }));
      let hoveredIndex = -1;
      bodies.forEach((body, i) => {
        const { radius } = RINGS[OBJECTS[i].ring];
        gsap.to(bodyState[i], {
          angle: bodyState[i].angle + 360,
          duration: OBJECTS[i].duration,
          ease: "none",
          repeat: -1,
          onUpdate: () => {
            const a = (bodyState[i].angle * Math.PI) / 180;
            const x = Math.sin(a) * radius;
            const z = Math.cos(a) * radius;
            const depth = (z + radius) / (2 * radius);
            const isHovered = hoveredIndex === i;
            gsap.set(body, {
              x,
              z,
              scale: (0.68 + depth * 0.55) * (isHovered ? 1.35 : 1),
              opacity: 0.65 + depth * 0.35,
              zIndex: Math.round(depth * 100) + 10,
              filter: `brightness(${0.88 + depth * 0.42})${isHovered ? " drop-shadow(0 0 6px var(--zaz-accent))" : ""}`,
            });
          },
        });
        body!.addEventListener("pointerenter", () => (hoveredIndex = i));
        body!.addEventListener("pointerleave", () => (hoveredIndex = -1));
      });

      // The core slowly evolves: independent inner-layer rotation plus a
      // periodic pulse, rather than sitting static behind the orbits.
      if (coreInnerRef.current) gsap.to(coreInnerRef.current, { rotationZ: 360, duration: 40, ease: "none", repeat: -1 });
      if (coreGlowRef.current) {
        gsap.to(coreGlowRef.current, { scale: 1.14, opacity: 0.85, duration: 3.6, ease: "sine.inOut", yoyo: true, repeat: -1 });
      }

      // Slow ambient multi-axis tumble of the whole system.
      const idleTumble = [
        gsap.to(group, { rotationY: "+=40", duration: 10, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        gsap.to(group, { rotationX: "+=14", duration: 13, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.6 }),
      ];

      // Light sweep across the outer ring.
      if (highlightRef.current) {
        gsap.to(highlightRef.current, { rotate: 360, duration: 24, ease: "none", repeat: -1, transformOrigin: "50% 50%" });
      }

      // Mouse-driven parallax on a separate outer layer.
      const quickX = gsap.quickTo(parallax, "rotationX", { duration: 0.9, ease: "power3.out" });
      const quickY = gsap.quickTo(parallax, "rotationY", { duration: 0.9, ease: "power3.out" });
      function onWindowMove(e: PointerEvent) {
        const rect = stageRef.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const nx = gsap.utils.clamp(-1, 1, (e.clientX - cx) / (window.innerWidth / 2));
        const ny = gsap.utils.clamp(-1, 1, (e.clientY - cy) / (window.innerHeight / 2));
        quickY(nx * 8);
        quickX(-ny * 6);
      }
      window.addEventListener("pointermove", onWindowMove);

      // Drag reorients the whole system; ambient tumble resumes after release.
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
        gsap.set(group, { rotationY: `+=${dx * 0.4}`, rotationX: `+=${-dy * 0.3}` });
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
        window.removeEventListener("pointermove", onWindowMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, stageRef);

    // Pauses the idle ring/orbit/core/tumble loops (repeat: -1) while this
    // hero is scrolled out of view — same tween instances, just paused and
    // resumed, nothing recreated.
    const disconnectVisibilityGate = gateContextToViewport(ctx, stageRef.current!);

    return () => {
      disconnectVisibilityGate();
      ctx.revert();
    };
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[400px]" style={{ perspective: 1100 }}>
      <div ref={parallaxRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
        <div
          ref={groupRef}
          className="relative flex h-full w-full cursor-grab touch-pan-y items-center justify-center active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Ambient glow behind the whole system — soft fill light so the
              orbit bodies and rings read clearly rather than sitting in
              shadow against the dark backdrop. */}
          <div
            aria-hidden
            className="pointer-events-none absolute h-[78%] w-[78%] rounded-full"
            style={{ background: "radial-gradient(circle at 32% 30%, color-mix(in srgb, var(--zaz-accent) 30%, transparent) 0%, transparent 72%)" }}
          />

          {/* Orbit bodies */}
          {OBJECTS.map((obj, i) => {
            const ring = RINGS[obj.ring];
            const { x, z } = restXZ(obj.angle, ring.radius);
            return (
              <div
                key={i}
                aria-hidden
                className="pointer-events-auto absolute cursor-pointer"
                style={{
                  transform: `rotateX(${ring.tiltX}deg) rotateY(${ring.tiltY}deg)`,
                  transformStyle: "preserve-3d",
                }}
              >
                <div
                  ref={(el) => {
                    bodyRefs.current[i] = el;
                  }}
                  style={{ width: obj.size, height: obj.size, transform: `translate3d(${x}px, 0px, ${z}px)`, transformStyle: "preserve-3d" }}
                >
                  <OrbitBody kind={obj.kind} />
                </div>
              </div>
            );
          })}

          {/* Orbit rings (paths) */}
          {RINGS.map((ring, i) => (
            <div
              key={i}
              ref={(el) => {
                ringRefs.current[i] = el;
              }}
              aria-hidden
              className="absolute rounded-full border"
              style={{
                width: ring.radius * 2,
                height: ring.radius * 2,
                borderColor: "var(--zaz-border-strong)",
                borderWidth: 1.25,
                transform: `rotateX(${ring.tiltX}deg) rotateY(${ring.tiltY}deg)`,
                transformStyle: "preserve-3d",
              }}
            >
              {i === 0 && (
                <div
                  ref={highlightRef}
                  aria-hidden
                  className="absolute -inset-[8%] rounded-full opacity-90"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0%, color-mix(in srgb, var(--zaz-accent) 85%, transparent) 4%, transparent 13%)",
                  }}
                />
              )}
            </div>
          ))}

          {/* Core: layered geometric ZAZ nucleus — the scene's key light
              source, so its glow and the nucleus layers around it carry a
              real highlight rather than sitting as flat dark shapes. */}
          <div
            ref={coreGlowRef}
            aria-hidden
            className="pointer-events-none absolute h-[34%] w-[34%] rounded-full opacity-80"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--zaz-accent) 68%, transparent) 0%, transparent 72%)" }}
          />
          <div
            ref={coreInnerRef}
            aria-hidden
            className="pointer-events-none absolute h-[19%] w-[19%] rounded-[6px] border border-zaz-accent"
            style={{
              transformStyle: "preserve-3d",
              background:
                "radial-gradient(circle at 28% 24%, color-mix(in srgb, var(--zaz-accent) 40%, transparent) 0%, transparent 60%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-bg-deep) 100%)",
            }}
          />
          <div
            className="relative z-10 flex h-[17%] w-[17%] items-center justify-center rounded-[5px] border border-zaz-accent shadow-2xl shadow-black/35"
            style={{
              background:
                "radial-gradient(circle at 32% 26%, color-mix(in srgb, var(--zaz-accent) 50%, transparent) 0%, transparent 68%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-bg-deep) 100%)",
            }}
          >
            <span aria-hidden className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(1.1rem, 2.6vw, 1.5rem)" }}>
              Z
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
