"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import useTilt from "@/lib/animation/useTilt";
import BrowserFrame from "@/components/ui/BrowserFrame";

const cardBg = "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)";

/**
 * Homepage-only hero visual: a central hub connected by flowing light-trail
 * lines to three interface panels — one per ZAZ discipline (brand, website,
 * marketing) — instead of three unrelated floating boxes. One coherent
 * concept, not a background-and-forget decoration. Deliberately a separate
 * component from HeroVisual (which /services and /pricing still use
 * unchanged) so this redesign stays scoped to the homepage.
 *
 * Three depth layers move at different pointer-parallax strengths (subtle
 * background glow, mid-layer panels, foreground nodes) plus independent slow
 * CSS floats (zaz-float-a/b/c, 14s/18s/24s) — everything transform/opacity
 * only, no canvas/WebGL. `prefers-reduced-motion` kills both the CSS
 * keyframes (global override in globals.css) and the JS pointer parallax
 * below, leaving the static composition intact.
 */
export default function HomeHeroVisual() {
  const tiltRef = useTilt<HTMLDivElement>({ max: 3, scale: 1.008 });
  const bgRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bg = bgRef.current;
    const mid = midRef.current;
    const fg = fgRef.current;
    if (!bg || !mid || !fg) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;

    const section = bg.closest("section");
    if (!section) return;

    registerGsap();
    const layers = [
      { el: bg, strength: 6 },
      { el: mid, strength: 14 },
      { el: fg, strength: 24 },
    ].map(({ el, strength }) => ({
      strength,
      setX: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3.out" }),
      setY: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3.out" }),
    }));

    function handlePointerMove(event: Event) {
      const { clientX, clientY } = event as PointerEvent;
      const rect = section!.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      for (const layer of layers) {
        layer.setX(px * layer.strength);
        layer.setY(py * layer.strength);
      }
    }

    section.addEventListener("pointermove", handlePointerMove);
    return () => section.removeEventListener("pointermove", handlePointerMove);
  }, []);

  return (
    <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[440px]">
      {/* Background layer: soft atmospheric core glow, slowest float + weakest parallax. */}
      <div ref={bgRef} className="absolute inset-0">
        <div
          className="zaz-float-c absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)",
            opacity: 0.1,
          }}
        />
        <div
          className="absolute left-1/2 top-1/2 h-[46%] w-[46%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-zaz-border-strong"
          aria-hidden
        />
      </div>

      {/* Connection layer: thin lines from the core to each panel, with a slow flowing dash + soft glowing nodes. */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      >
        <g stroke="var(--zaz-accent)" strokeWidth="0.4" strokeLinecap="round">
          <path d="M50,50 L20,24" opacity="0.18" />
          <path d="M50,50 L20,24" className="zaz-dash-flow" opacity="0.55" />
          <path d="M50,50 L81,33" opacity="0.18" />
          <path d="M50,50 L81,33" className="zaz-dash-flow" opacity="0.55" style={{ animationDelay: "-3.5s" }} />
          <path d="M50,50 L29,79" opacity="0.18" />
          <path d="M50,50 L29,79" className="zaz-dash-flow" opacity="0.55" style={{ animationDelay: "-7s" }} />
        </g>
        <circle cx="50" cy="50" r="1.6" fill="var(--zaz-accent)" opacity="0.7" />
        <circle cx="20" cy="24" r="1.3" fill="var(--zaz-accent)" className="zaz-glow-pulse" />
        <circle cx="81" cy="33" r="1.3" fill="var(--zaz-accent)" className="zaz-glow-pulse" style={{ animationDelay: "-1.5s" }} />
        <circle cx="29" cy="79" r="1.3" fill="var(--zaz-accent)" className="zaz-glow-pulse" style={{ animationDelay: "-3s" }} />
      </svg>

      {/* Mid layer: the three discipline panels, anchored at the node positions above. */}
      <div ref={midRef} className="absolute inset-0">
        {/* Brand / logo panel */}
        <div
          className="zaz-float-a absolute flex h-[27%] w-[27%] items-center justify-center overflow-hidden rounded-full border border-zaz-border shadow-2xl shadow-black/40"
          style={{
            left: "20%",
            top: "24%",
            transform: "translate(-50%, -50%)",
            background:
              "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--zaz-accent) 20%, transparent) 0%, transparent 65%), " +
              cardBg,
          }}
        >
          <span aria-hidden className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)" }}>
            Z
          </span>
        </div>

        {/* Website panel */}
        <div
          className="zaz-float-b absolute h-[30%] w-[38%] overflow-hidden rounded-[var(--zaz-radius)] shadow-2xl shadow-black/40"
          style={{ left: "81%", top: "33%", transform: "translate(-50%, -50%) rotate(-2deg)" }}
        >
          <BrowserFrame>
            <div className="h-full w-full" style={{ background: cardBg }} />
          </BrowserFrame>
        </div>

        {/* Marketing panel */}
        <div
          className="zaz-float-a absolute flex h-[24%] w-[30%] items-end gap-1.5 overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border p-4 shadow-2xl shadow-black/40"
          style={{
            left: "29%",
            top: "79%",
            transform: "translate(-50%, -50%)",
            animationDelay: "-6s",
            background: cardBg,
          }}
        >
          {[42, 68, 52, 84].map((height, index) => (
            <span
              key={index}
              aria-hidden
              className="flex-1 rounded-sm bg-zaz-accent"
              style={{ height: `${height}%`, opacity: 0.5 + index * 0.1 }}
            />
          ))}
        </div>
      </div>

      {/* Foreground layer: small standalone accent — fastest parallax, tightest float. */}
      <div ref={fgRef} className="absolute inset-0">
        <div
          className="zaz-float-b absolute flex h-[13%] w-[13%] items-center justify-center rounded-full border border-zaz-accent-dim shadow-xl shadow-black/30"
          style={{ left: "68%", top: "76%", transform: "translate(-50%, -50%)", background: "var(--zaz-bg-deep)" }}
        >
          <span aria-hidden className="h-2 w-2 rounded-full bg-zaz-accent" />
        </div>
      </div>
    </div>
  );
}
