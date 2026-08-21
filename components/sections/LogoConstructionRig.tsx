"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const cardBg = "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)";

/**
 * Logo Design hero: a small "construction rig" for the ZAZ mark's own
 * component shapes — not a one-time entrance. A master GSAP timeline loops
 * forever: the circle/wordmark/dot drift apart into a scattered, tumbling
 * arrangement, hold there with a slow independent self-rotation each, then
 * converge back into the clean assembled mark, hold with a light sweep
 * across it, and scatter again. Dragging the whole rig rotates it in 3D;
 * hovering a single piece lifts and highlights it independent of whichever
 * phase the cycle is in. Pure CSS 3D transforms + GSAP (no WebGL) — this and
 * the Home Rubik cube are deliberately different technology as well as
 * different concepts.
 */
export default function LogoConstructionRig() {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rig = rigRef.current;
    const circle = circleRef.current;
    const wordmark = wordmarkRef.current;
    const dot = dotRef.current;
    const sweep = sweepRef.current;
    if (!rig || !circle || !wordmark || !dot || !sweep) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      // Independent slow self-spin on each piece, always running underneath
      // the phase cycle — this is what keeps the "hold" phases from ever
      // looking frozen.
      gsap.to(circle, { rotationY: 360, duration: 14, ease: "none", repeat: -1 });
      gsap.to(wordmark, { rotationY: -360, duration: 18, ease: "none", repeat: -1 });
      gsap.to(dot, { rotationZ: 360, duration: 9, ease: "none", repeat: -1 });

      const scattered = {
        circle: { x: -70, y: -55, z: 40, rotationZ: -18 },
        wordmark: { x: 85, y: 60, z: -35, rotationZ: 24 },
        dot: { x: -35, y: 85, z: 55, rotationZ: -40 },
      };
      const assembled = { circle: { x: 0, y: 0, z: 0, rotationZ: 0 }, wordmark: { x: 0, y: 0, z: 0, rotationZ: 3 }, dot: { x: 0, y: 0, z: 0, rotationZ: -6 } };

      const tl = gsap.timeline({ repeat: -1, delay: 0.3 });
      tl.to([circle, wordmark, dot], { opacity: 1 }, 0)
        .to(circle, { ...scattered.circle, duration: 1.6, ease: "power2.inOut" }, 0)
        .to(wordmark, { ...scattered.wordmark, duration: 1.6, ease: "power2.inOut" }, 0.1)
        .to(dot, { ...scattered.dot, duration: 1.6, ease: "power2.inOut" }, 0.2)
        .to({}, { duration: 1.6 }) // hold, scattered — self-spins keep it alive
        .to(circle, { ...assembled.circle, duration: 1.3, ease: "power3.inOut" }, "+=0")
        .to(wordmark, { ...assembled.wordmark, duration: 1.3, ease: "power3.inOut" }, "<0.08")
        .to(dot, { ...assembled.dot, duration: 1.3, ease: "power3.inOut" }, "<0.08")
        .fromTo(sweep, { xPercent: -130, opacity: 0 }, { xPercent: 130, opacity: 0.9, duration: 1, ease: "power1.inOut" }, "-=0.3")
        .to({}, { duration: 1.8 }); // hold, assembled

      // Drag rotates the rig; snaps back to a gentle idle tilt on release.
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      let velX = 0;

      function onDown(e: PointerEvent) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = 0;
        gsap.killTweensOf(rig, "rotationY,rotationX");
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        velX = dx;
        gsap.set(rig, {
          rotationY: `+=${dx * 0.4}`,
          rotationX: gsap.utils.clamp(-20, 20, (gsap.getProperty(rig, "rotationX") as number) - dy * 0.3),
        });
      }
      function onUp() {
        if (!isDragging) return;
        isDragging = false;
        gsap.to(rig, { rotationY: `+=${velX * 3}`, duration: 0.8, ease: "power2.out" });
      }

      const stage = stageRef.current;
      stage?.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      // Hover lift/highlight, independent of the phase cycle.
      [circle, wordmark, dot].forEach((piece) => {
        piece.addEventListener("pointerenter", () => {
          gsap.to(piece, { z: "+=45", scale: 1.08, duration: 0.4, ease: "power2.out" });
        });
        piece.addEventListener("pointerleave", () => {
          gsap.to(piece, { z: "-=45", scale: 1, duration: 0.5, ease: "power2.out" });
        });
      });

      return () => {
        stage?.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[400px]" style={{ perspective: 1100 }}>
      <div
        ref={rigRef}
        className="relative h-full w-full cursor-grab touch-none active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div
          ref={circleRef}
          className="absolute left-[6%] top-[4%] flex h-[54%] w-[54%] items-center justify-center rounded-full border border-zaz-border shadow-2xl shadow-black/40"
          style={{
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--zaz-accent) 20%, transparent) 0%, transparent 65%), " + cardBg,
            transformStyle: "preserve-3d",
          }}
        >
          <span aria-hidden className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(3rem, 7vw, 4.5rem)" }}>
            Z
          </span>
        </div>
        <div
          ref={wordmarkRef}
          className="absolute bottom-[6%] right-[2%] flex h-[40%] w-[46%] items-center justify-center overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40"
          style={{ background: cardBg, transformStyle: "preserve-3d" }}
        >
          <span aria-hidden className="relative z-10 font-heading text-2xl font-semibold tracking-wide text-zaz-text">
            ZDS
          </span>
          <div
            ref={sweepRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 opacity-0"
            style={{ background: "linear-gradient(100deg, transparent, color-mix(in srgb, var(--zaz-accent) 55%, transparent), transparent)" }}
          />
        </div>
        <div
          ref={dotRef}
          className="absolute bottom-0 left-0 flex h-[26%] w-[26%] items-center justify-center rounded-[var(--zaz-radius-pill)] border border-zaz-accent-dim shadow-xl shadow-black/30"
          style={{ background: "var(--zaz-bg-deep)", transformStyle: "preserve-3d" }}
        >
          <span aria-hidden className="h-3 w-3 rounded-full bg-zaz-accent" />
        </div>
      </div>
    </div>
  );
}
