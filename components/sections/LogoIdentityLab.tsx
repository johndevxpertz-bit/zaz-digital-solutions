"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type LogoIdentityLabProps = {
  logos: { src: string; alt: string }[];
};

// Fixed 3D "pinboard" positions — a loose cluster at varying depth, not an
// orbit or a grid — so this reads as a designer's exploration wall rather
// than a mechanism. Real client logo work only (passed in, never invented).
const LAYOUT = [
  { x: -95, y: -60, z: 30, rotate: -4 },
  { x: 100, y: -75, z: -20, rotate: 5 },
  { x: -85, y: 80, z: -10, rotate: 3 },
  { x: 90, y: 65, z: 40, rotate: -6 },
];

// Loose "workspace" debris behind the pinboard — letterform fragments,
// geometric primitives, and small dimension/annotation marks — never
// attached to any single card, drifting independently, so the scene reads
// as a working identity lab rather than four framed logos on a wall.
const FRAGMENTS: { kind: "letter" | "primitive" | "tick"; x: number; y: number; z: number; rotate: number; content?: string }[] = [
  { kind: "letter", x: -140, y: 10, z: -60, rotate: -8, content: "A" },
  { kind: "letter", x: 145, y: 5, z: -80, rotate: 6, content: "G" },
  { kind: "primitive", x: 0, y: -110, z: -50, rotate: 0 },
  { kind: "primitive", x: 10, y: 115, z: -40, rotate: 45 },
  { kind: "tick", x: -30, y: -5, z: 55, rotate: 0 },
  { kind: "tick", x: 35, y: 8, z: -25, rotate: 90 },
];

function Fragment({ kind, content }: { kind: "letter" | "primitive" | "tick"; content?: string }) {
  if (kind === "letter") {
    return (
      <span aria-hidden className="font-heading select-none text-zaz-accent-dim opacity-25" style={{ fontSize: "3.2rem" }}>
        {content}
      </span>
    );
  }
  if (kind === "primitive") {
    return <span aria-hidden className="block h-10 w-10 rounded-full border border-zaz-border-strong opacity-30" />;
  }
  return <span aria-hidden className="block h-px w-8 bg-zaz-border-strong opacity-40" />;
}

/**
 * Logo Design hero: a living identity laboratory. Real client logo work
 * (never invented shapes) pinned in a loose 3D cluster at varying depth,
 * surrounded by loose workspace debris — letterform fragments, geometric
 * primitives, small annotation ticks — drifting independently in the space
 * around the pinboard. An autonomous cycle brings each mark into focus in
 * turn: as it scales up and sharpens, its construction guides actually
 * trace across it stroke-by-stroke (crosshair, then circle, then bounding
 * frame drawing on in sequence, like a designer measuring the concept)
 * rather than simply flashing, while the other marks recede and soften.
 * Hovering a mark brings it into focus on demand; dragging tilts the whole
 * board to explore it from another angle. The whole board also drifts on a
 * slow, continuous multi-axis idle so it's never static even mid-hold.
 */
export default function LogoIdentityLab({ logos }: LogoIdentityLabProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const guideWrapRefs = useRef<(SVGSVGElement | null)[]>([]);
  const fragmentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = logos.slice(0, 4);

  useEffect(() => {
    const board = boardRef.current;
    const cards = cardRefs.current.filter((c): c is HTMLDivElement => !!c);
    if (!board || cards.length === 0) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      // Independent gentle bob per card, always running.
      cards.forEach((card, i) => {
        gsap.to(card, { y: `+=${8 + (i % 2) * 4}`, duration: 3.2 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      // Workspace debris: slow independent drift, always running.
      fragmentRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.to(el, {
          x: `+=${(i % 2 === 0 ? 1 : -1) * (10 + i * 2)}`,
          y: `+=${(i % 3 === 0 ? -1 : 1) * (8 + i)}`,
          rotation: `+=${8 + i * 3}`,
          duration: 8 + i * 1.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      });

      // Slow ambient multi-axis drift of the whole board.
      const idleDrift = [
        gsap.to(board, { rotationY: "+=8", duration: 7, ease: "sine.inOut", yoyo: true, repeat: -1 }),
        gsap.to(board, { rotationX: "+=4", duration: 9, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 0.5 }),
      ];

      function focus(i: number) {
        cards.forEach((card, j) => {
          const guide = guideWrapRefs.current[j];
          if (j === i) {
            gsap.to(card, { z: 90, scale: 1.22, filter: "blur(0px) brightness(1.08)", duration: 0.9, ease: "power2.inOut" });
            if (guide) {
              const shapes = Array.from(guide.querySelectorAll<SVGGeometryElement>("[data-trace]"));
              const tl = gsap.timeline();
              tl.set(guide, { opacity: 1 });
              shapes.forEach((shape, si) => {
                const len = shape.getTotalLength();
                gsap.set(shape, { strokeDasharray: len, strokeDashoffset: len });
                tl.to(shape, { strokeDashoffset: 0, duration: 0.55, ease: "power1.inOut" }, si * 0.18);
              });
            }
          } else {
            gsap.to(card, { z: LAYOUT[j].z - 30, scale: 0.82, filter: "blur(1.5px) brightness(0.72)", duration: 0.9, ease: "power2.inOut" });
          }
        });
      }
      function release() {
        cards.forEach((card, j) => {
          gsap.to(card, { z: LAYOUT[j].z, scale: 1, filter: "blur(0px) brightness(1)", duration: 0.8, ease: "power2.inOut" });
          const guide = guideWrapRefs.current[j];
          if (guide) gsap.to(guide, { opacity: 0, duration: 0.4 });
        });
      }

      // Autonomous focus cycle.
      let hoveredIndex = -1;
      let autoIndex = 0;
      const cycle = gsap.timeline({ repeat: -1, delay: 1 });
      for (let step = 0; step < cards.length; step++) {
        cycle.call(() => {
          if (hoveredIndex === -1) focus(autoIndex);
        });
        cycle.to({}, { duration: 2.1 });
        cycle.call(() => {
          if (hoveredIndex === -1) release();
          autoIndex = (autoIndex + 1) % cards.length;
        });
        cycle.to({}, { duration: 0.7 });
      }

      cards.forEach((card, i) => {
        card.addEventListener("pointerenter", () => {
          hoveredIndex = i;
          focus(i);
        });
        card.addEventListener("pointerleave", () => {
          hoveredIndex = -1;
          release();
        });
      });

      // Drag tilts the board (a bounded explore, not a full orbit).
      const stage = stageRef.current;
      let isDragging = false;
      let lastX = 0;
      let lastY = 0;
      function onDown(e: PointerEvent) {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        idleDrift.forEach((t) => t.pause());
        (e.target as Element).setPointerCapture?.(e.pointerId);
      }
      function onMove(e: PointerEvent) {
        if (!isDragging) return;
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        gsap.set(board, {
          rotationY: gsap.utils.clamp(-24, 24, (gsap.getProperty(board, "rotationY") as number) + dx * 0.25),
          rotationX: gsap.utils.clamp(-16, 16, (gsap.getProperty(board, "rotationX") as number) - dy * 0.2),
        });
      }
      function onUp() {
        if (!isDragging) return;
        isDragging = false;
        gsap.delayedCall(0.6, () => idleDrift.forEach((t) => t.resume()));
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
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[440px]" style={{ perspective: 1100 }}>
      <div
        ref={boardRef}
        className="relative flex h-full w-full cursor-grab touch-none items-center justify-center active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        {FRAGMENTS.map((frag, i) => (
          <div
            key={`fragment-${i}`}
            ref={(el) => {
              fragmentRefs.current[i] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute"
            style={{ transform: `translate3d(${frag.x}px, ${frag.y}px, ${frag.z}px) rotate(${frag.rotate}deg)`, transformStyle: "preserve-3d" }}
          >
            <Fragment kind={frag.kind} content={frag.content} />
          </div>
        ))}

        {items.map((logo, i) => (
          <div
            key={logo.src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute flex h-[42%] w-[42%] items-center justify-center overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/50"
            style={{
              transform: `translate3d(${LAYOUT[i].x}px, ${LAYOUT[i].y}px, ${LAYOUT[i].z}px) rotate(${LAYOUT[i].rotate}deg)`,
              transformStyle: "preserve-3d",
              background: "linear-gradient(160deg, #f4f1ea 0%, #e4e0d6 100%)",
            }}
          >
            <div className="relative h-[70%] w-[70%]">
              <Image src={logo.src} alt={logo.alt} fill sizes="180px" className="object-contain" />
            </div>
            <svg
              ref={(el) => {
                guideWrapRefs.current[i] = el;
              }}
              aria-hidden
              viewBox="0 0 100 100"
              className="pointer-events-none absolute inset-0 h-full w-full opacity-0"
            >
              <line data-trace x1="0" y1="50" x2="100" y2="50" stroke="var(--zaz-accent)" strokeWidth="0.5" />
              <line data-trace x1="50" y1="0" x2="50" y2="100" stroke="var(--zaz-accent)" strokeWidth="0.5" />
              <circle data-trace cx="50" cy="50" r="30" fill="none" stroke="var(--zaz-accent)" strokeWidth="0.5" />
              <rect data-trace x="6" y="6" width="88" height="88" fill="none" stroke="var(--zaz-accent)" strokeWidth="0.5" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
