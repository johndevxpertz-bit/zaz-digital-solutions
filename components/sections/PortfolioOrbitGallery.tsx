"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion, gateContextToViewport } from "@/lib/animation/gsap";

export type PortfolioOrbitItem =
  | { kind: "logo"; src: string; alt: string }
  | { kind: "website"; src: string; alt: string }
  | { kind: "marketing"; alt: string };

type PortfolioOrbitGalleryProps = {
  items: PortfolioOrbitItem[];
};

const RADIUS = 130;
// Website tiles read largest (they're the most visually dense format),
// logo tiles smallest/squarest (presentation-card style), marketing in
// between — so the mix reads as genuinely different formats, not three
// identically-sized cards.
const SIZE: Record<PortfolioOrbitItem["kind"], number> = { website: 0.6, marketing: 0.5, logo: 0.42 };
const LABEL: Record<PortfolioOrbitItem["kind"], string> = { logo: "Logo", website: "Website", marketing: "Marketing" };

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

// A campaign/growth visualization, distinct from a "card" — a dotted signal
// field behind a rising trend line and bars, since no real marketing assets
// exist in the project (never a fabricated campaign creative).
function GrowthAbstract() {
  return (
    <div className="relative flex h-full w-full flex-col justify-end gap-3 overflow-hidden p-4">
      <div
        aria-hidden
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: "radial-gradient(var(--zaz-accent-dim) 1px, transparent 1px)", backgroundSize: "10px 10px" }}
      />
      <svg aria-hidden viewBox="0 0 100 40" className="relative h-10 w-full" fill="none">
        <polyline points="0,34 22,24 44,28 66,10 100,4" stroke="var(--zaz-accent)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
      <div className="relative flex h-8 items-end gap-1.5">
        {[35, 55, 45, 75, 60].map((h, i) => (
          <span key={i} className="flex-1 rounded-sm bg-zaz-accent" style={{ height: `${h}%`, opacity: 0.45 + i * 0.1 }} />
        ))}
      </div>
    </div>
  );
}

// A miniature browser chrome around website tiles — distinct from the
// logo/marketing card treatments so the three disciplines read as genuinely
// different formats, not the same card three times.
function BrowserChrome({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex h-[14%] shrink-0 items-center gap-1 border-b border-zaz-border bg-zaz-bg-deep px-2">
        <span className="h-1.5 w-1.5 rounded-full bg-zaz-border-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-zaz-border-strong" />
        <span className="h-1.5 w-1.5 rounded-full bg-zaz-border-strong" />
      </div>
      <div className="relative flex-1">
        <Image src={src} alt={alt} fill sizes="230px" className="object-cover object-top" />
      </div>
    </div>
  );
}

/**
 * Portfolio hero: a mixed gallery on a continuous 3D orbit — real logo
 * marks, real website screenshots, and a marketing/growth visual all in the
 * same rotation, each in its own card format and size, each labeled, so the
 * three disciplines read clearly within a couple seconds. Genuine circular
 * motion (angle-driven, not phase keyframes) — never "finishes". Dragging
 * spins the orbit manually with inertia; hovering a tile pauses the orbit
 * and brings that tile forward.
 */
export default function PortfolioOrbitGallery({ items: rawItems }: PortfolioOrbitGalleryProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const items = rawItems.slice(0, 5);

  useEffect(() => {
    const stage = stageRef.current;
    const tiles = tileRefs.current.filter((t): t is HTMLDivElement => !!t);
    if (!stage || tiles.length === 0) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const n = tiles.length;
      const radius = RADIUS;
      const state = { angle: 0 };
      let hovered = -1;
      let featured = -1;

      function render() {
        tiles.forEach((tile, i) => {
          const a = ((state.angle + (360 / n) * i) * Math.PI) / 180;
          const z = Math.cos(a) * radius;
          const x = Math.sin(a) * radius;
          const depth = (z + radius) / (2 * radius); // 0 (back) .. 1 (front)
          const scale = 0.72 + depth * 0.4;
          const isHovered = hovered === i;
          const isFeatured = !isHovered && hovered === -1 && featured === i;
          gsap.set(tile, {
            x,
            z: isHovered ? radius + 40 : isFeatured ? z + 45 : z,
            scale: isHovered ? scale * 1.12 : isFeatured ? scale * 1.15 : scale,
            opacity: 0.55 + depth * 0.45,
            zIndex: Math.round(depth * 100) + (isFeatured ? 50 : 0),
            filter: `brightness(${0.75 + depth * 0.4})${isFeatured ? " drop-shadow(0 0 10px var(--zaz-accent))" : ""}`,
          });
        });
      }
      render();

      // Continuous orbit — a proxy angle tween, eased "none" so it's a
      // perfectly steady rotation, with GSAP driving frame updates.
      const orbitTween = gsap.to(state, { angle: 360, duration: 28, ease: "none", repeat: -1, onUpdate: render });

      // Autonomous "featured" cycle: independent of hover, each project in
      // turn is periodically pulled slightly forward and glows — the
      // gallery keeps rearranging its own emphasis, not just spinning.
      let featuredIndex = 0;
      const featureCycle = gsap.timeline({ repeat: -1, delay: 1.5 });
      for (let step = 0; step < n; step++) {
        featureCycle.call(() => {
          featured = featuredIndex;
        });
        featureCycle.to({}, { duration: 2.2 });
        featureCycle.call(() => {
          featured = -1;
          featuredIndex = (featuredIndex + 1) % n;
        });
        featureCycle.to({}, { duration: 0.8 });
      }

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

    // Pauses the continuous orbit/feature-cycle loops (repeat: -1) while
    // this section is scrolled out of view — same tween instances, just
    // paused/resumed.
    const disconnectVisibilityGate = gateContextToViewport(ctx, stageRef.current!);

    return () => {
      disconnectVisibilityGate();
      ctx.revert();
    };
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[440px]" style={{ perspective: 1000 }}>
      <div className="relative flex h-full w-full items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {items.map((item, i) => {
          const sizePct = SIZE[item.kind] * 100;
          return (
            <div
              key={item.kind === "marketing" ? "marketing" : item.src}
              ref={(el) => {
                tileRefs.current[i] = el;
              }}
              className={`absolute cursor-grab touch-pan-y overflow-hidden shadow-2xl shadow-black/40 active:cursor-grabbing ${
                item.kind === "logo" ? "rounded-full border-2 border-zaz-accent-dim" : "rounded-[var(--zaz-radius)] border border-zaz-border"
              }`}
              style={{
                height: `${sizePct}%`,
                width: `${sizePct}%`,
                transformStyle: "preserve-3d",
                background: item.kind === "logo" ? "linear-gradient(160deg, #f4f1ea 0%, #e4e0d6 100%)" : "var(--zaz-surface)",
                ...restingTransform(i, items.length),
              }}
            >
              {item.kind === "marketing" && <GrowthAbstract />}
              {item.kind === "website" && <BrowserChrome src={item.src} alt={item.alt} />}
              {item.kind === "logo" && <Image src={item.src} alt={item.alt} fill sizes="230px" className="object-contain p-5" />}
              <span
                className={`zaz-label absolute bottom-2 left-2 rounded-full bg-zaz-bg-deep/80 px-2 py-0.5 text-[10px] text-zaz-accent ${
                  item.kind === "logo" ? "left-1/2 -translate-x-1/2" : ""
                }`}
              >
                {LABEL[item.kind]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
