"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const SATELLITES = [
  { label: "Logo" },
  { label: "Website" },
  { label: "Marketing" },
];
const RING_RADIUS = 118;
const DOCK_RADIUS = 22;

// Math.sin/cos aren't guaranteed bit-identical across JS engines (server
// Node vs. browser V8 can differ in the last few decimal places) — rounding
// keeps the server-rendered inline style and the client's first computed
// value identical, avoiding a hydration mismatch on this SSR'd component.
function round(n: number) {
  return Math.round(n * 1000) / 1000;
}

function satelliteTransform(angleDeg: number, radius: number, scale: number) {
  const a = (angleDeg * Math.PI) / 180;
  const x = round(Math.sin(a) * radius);
  const z = round(Math.cos(a) * radius);
  return { x, z, scale };
}

/**
 * Pricing hero: a fixed central "core" (the studio itself) with three named
 * value satellites (Logo / Website / Marketing) connected to it by spokes —
 * a hub-and-spoke engine, not free-floating cards. The satellites orbit the
 * core together at a steady pace forever; independently, an autonomous
 * cycle periodically pulls ONE satellite inward along its spoke to dock
 * into the core (growing, brightening, its label prominent) while the other
 * two recede and dim, holds, then releases it back to the ring and moves to
 * the next satellite. Hovering a satellite docks it immediately, overriding
 * the autonomous cycle; releasing hands control back.
 */
export default function PricingValueEngine() {
  const stageRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const coreGlowRef = useRef<HTMLDivElement>(null);
  const coreInnerRef = useRef<HTMLDivElement>(null);
  const satRefs = useRef<(HTMLDivElement | null)[]>([]);
  const spokeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pulseRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const core = coreRef.current;
    const sats = satRefs.current;
    const spokes = spokeRefs.current;
    if (!core || sats.some((s) => !s) || spokes.some((s) => !s)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const n = SATELLITES.length;
      const ring = { angle: 0 };
      const sat = SATELLITES.map((_, i) => ({ radius: RING_RADIUS, scale: 1, opacity: 1, dockOffset: (360 / n) * i }));

      function render() {
        sat.forEach((s, i) => {
          const angle = ring.angle + s.dockOffset;
          const { x, z, scale } = satelliteTransform(angle, s.radius, s.scale);
          gsap.set(sats[i], { x, z, scale, opacity: s.opacity, zIndex: Math.round(z + 200) });
          const spoke = spokes[i];
          if (spoke) {
            gsap.set(spoke, { rotation: -angle, scaleX: s.radius / RING_RADIUS, opacity: 0.25 + (1 - s.radius / RING_RADIUS) * 0.35 });
          }
          const label = labelRefs.current[i];
          if (label) gsap.set(label, { opacity: s.radius < RING_RADIUS * 0.6 ? 1 : 0 });
        });
      }
      render();

      // Continuous shared-ring rotation, always running.
      gsap.to(ring, { angle: 360, duration: 34, ease: "none", repeat: -1, onUpdate: render });
      // Core's own independent slow spin/pulse.
      gsap.to(core, { rotationY: 360, duration: 16, ease: "none", repeat: -1 });
      gsap.to(core, { scale: 1.06, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1 });

      function sendPulse(i: number) {
        const pulse = pulseRefs.current[i];
        if (!pulse) return;
        gsap.set(pulse, { left: "0%", opacity: 1 });
        gsap.to(pulse, {
          left: "100%",
          duration: 0.55,
          ease: "power1.in",
          onComplete: () => {
            gsap.to(pulse, { opacity: 0, duration: 0.15 });
            // Energy arrives — the core visibly reacts rather than the
            // satellite simply sliding to the center.
            if (coreRef.current) gsap.to(coreRef.current, { scale: 1.16, duration: 0.16, ease: "power1.out", yoyo: true, repeat: 1 });
            if (coreInnerRef.current) gsap.to(coreInnerRef.current, { rotationZ: "+=35", duration: 0.5, ease: "power2.out" });
            if (coreGlowRef.current) gsap.fromTo(coreGlowRef.current, { opacity: 0.9 }, { opacity: 0, duration: 0.6, ease: "power1.out" });
          },
        });
      }

      function dock(i: number) {
        sendPulse(i);
        gsap.to(sat[i], { radius: DOCK_RADIUS, scale: 1.35, opacity: 1, duration: 0.9, ease: "power2.inOut", onUpdate: render });
        sat.forEach((s, j) => {
          if (j === i) return;
          gsap.to(s, { radius: RING_RADIUS * 1.15, scale: 0.82, opacity: 0.55, duration: 0.9, ease: "power2.inOut", onUpdate: render });
        });
      }
      function release() {
        sat.forEach((s) => {
          gsap.to(s, { radius: RING_RADIUS, scale: 1, opacity: 1, duration: 0.8, ease: "power2.inOut", onUpdate: render });
        });
      }

      // Autonomous cycle: dock each satellite in turn, forever, unless a
      // hover is currently overriding it.
      let hoveredIndex = -1;
      let autoIndex = 0;
      const autoTl = gsap.timeline({ repeat: -1, delay: 1 });
      for (let step = 0; step < n; step++) {
        autoTl.call(() => {
          if (hoveredIndex === -1) dock(autoIndex);
        });
        autoTl.to({}, { duration: 1.6 });
        autoTl.call(() => {
          if (hoveredIndex === -1) release();
          autoIndex = (autoIndex + 1) % n;
        });
        autoTl.to({}, { duration: 0.9 });
      }

      sats.forEach((el, i) => {
        el?.addEventListener("pointerenter", () => {
          hoveredIndex = i;
          dock(i);
        });
        el?.addEventListener("pointerleave", () => {
          hoveredIndex = -1;
          release();
        });
      });

      // Drag rotates the whole engine.
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
        ring.angle += dx * 0.4;
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
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[400px]" style={{ perspective: 1000 }}>
      <div className="relative flex h-full w-full items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {/* Spokes */}
        {SATELLITES.map((_, i) => (
          <div
            key={`spoke-${i}`}
            ref={(el) => {
              spokeRefs.current[i] = el;
            }}
            aria-hidden
            className="absolute left-1/2 top-1/2 h-px origin-left bg-zaz-border-strong"
            style={{ width: RING_RADIUS, transform: `rotate(${(360 / SATELLITES.length) * i}deg)` }}
          >
            <span
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
              aria-hidden
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zaz-accent opacity-0"
              style={{ boxShadow: "0 0 6px 1px var(--zaz-accent)" }}
            />
          </div>
        ))}

        {/* Core */}
        <div
          ref={coreRef}
          className="relative z-20 flex h-[30%] w-[30%] items-center justify-center overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-accent-dim shadow-2xl shadow-black/50"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--zaz-accent) 30%, transparent) 0%, transparent 70%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-bg-deep) 100%)",
            transformStyle: "preserve-3d",
          }}
        >
          <div
            ref={coreGlowRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0"
            style={{ background: "radial-gradient(circle, color-mix(in srgb, var(--zaz-accent) 65%, transparent) 0%, transparent 75%)" }}
          />
          <div
            ref={coreInnerRef}
            aria-hidden
            className="pointer-events-none absolute h-[70%] w-[70%] rounded-[3px] border border-zaz-accent-dim opacity-40"
            style={{ transformStyle: "preserve-3d" }}
          />
          <span aria-hidden className="relative font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Z
          </span>
        </div>

        {/* Satellites */}
        {SATELLITES.map((s, i) => {
          const angle = (360 / SATELLITES.length) * i;
          const { x, z, scale } = satelliteTransform(angle, RING_RADIUS, 1);
          return (
            <div
              key={s.label}
              ref={(el) => {
                satRefs.current[i] = el;
              }}
              className="absolute flex h-[22%] w-[22%] cursor-pointer touch-pan-y flex-col items-center justify-center gap-1 rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface shadow-2xl shadow-black/40"
              style={{
                transform: `translate3d(${x}px, 0px, ${z}px) scale(${scale})`,
                transformStyle: "preserve-3d",
              }}
            >
              <span
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="zaz-label px-1 text-center text-zaz-accent opacity-0"
                style={{ fontSize: "0.6rem" }}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
