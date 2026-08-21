"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

const NODES = [
  { x: 4, y: 10 },
  { x: 60, y: 2 },
  { x: 112, y: 12 },
];

/**
 * Contact hero accent: small and restrained, per the brief — a short
 * constellation of 2-3 nodes with light pulses continuously traveling along
 * the connecting lines between them, a literal "message being sent."
 * Nodes drift very slightly toward the cursor within a small radius. Sits
 * above the kicker; never competes with the form below it.
 */
export default function ContactSignalConstellation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const nodes = nodeRefs.current;
    const lines = lineRefs.current;
    const pulses = pulseRefs.current;
    if (!wrap || nodes.some((n) => !n)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const pos = NODES.map((p) => ({ ...p }));

      function apply() {
        pos.forEach((p, i) => {
          nodes[i]?.setAttribute("cx", String(p.x));
          nodes[i]?.setAttribute("cy", String(p.y));
        });
        for (let i = 0; i < pos.length - 1; i++) {
          const line = lines[i];
          if (!line) continue;
          line.setAttribute("x1", String(pos[i].x));
          line.setAttribute("y1", String(pos[i].y));
          line.setAttribute("x2", String(pos[i + 1].x));
          line.setAttribute("y2", String(pos[i + 1].y));
        }
      }
      apply();

      // Gentle independent drift per node, always running.
      pos.forEach((p, i) => {
        gsap.to(p, { y: `+=${5 + i}`, duration: 2.6 + i * 0.4, ease: "sine.inOut", yoyo: true, repeat: -1, onUpdate: apply });
      });

      // Continuous pulses traveling along each connection.
      lines.forEach((line, i) => {
        const pulse = pulses[i];
        if (!line || !pulse) return;
        const t = { v: 0 };
        gsap.to(t, {
          v: 1,
          duration: 1.3,
          ease: "power1.inOut",
          repeat: -1,
          delay: i * 0.35,
          onUpdate: () => {
            pulse.setAttribute("cx", String(pos[i].x + (pos[i + 1].x - pos[i].x) * t.v));
            pulse.setAttribute("cy", String(pos[i].y + (pos[i + 1].y - pos[i].y) * t.v));
          },
        });
      });

      // Cursor proximity: nodes drift very slightly toward the pointer.
      function onPointerMove(e: PointerEvent) {
        const rect = wrap!.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * 116;
        const py = ((e.clientY - rect.top) / rect.height) * 24;
        pos.forEach((p) => {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 40 && dist > 0.01) {
            gsap.to(p, { x: `+=${(dx / dist) * 2}`, y: `+=${(dy / dist) * 2}`, duration: 0.5, ease: "power1.out", onUpdate: apply });
          }
        });
      }
      if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) {
        wrap.addEventListener("pointermove", onPointerMove);
      }

      return () => wrap.removeEventListener("pointermove", onPointerMove);
    }, wrapRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className="mb-6 h-6 w-32">
      <svg viewBox="0 0 116 24" className="h-full w-full overflow-visible">
        {NODES.slice(0, -1).map((_, i) => (
          <line
            key={`line-${i}`}
            ref={(el) => {
              lineRefs.current[i] = el;
            }}
            x1={NODES[i].x}
            y1={NODES[i].y}
            x2={NODES[i + 1].x}
            y2={NODES[i + 1].y}
            stroke="var(--zaz-border-strong)"
            strokeWidth="1"
          />
        ))}
        {NODES.slice(0, -1).map((_, i) => (
          <circle
            key={`pulse-${i}`}
            ref={(el) => {
              pulseRefs.current[i] = el;
            }}
            cx={NODES[i].x}
            cy={NODES[i].y}
            r="2"
            fill="var(--zaz-accent)"
            opacity="0.9"
          />
        ))}
        {NODES.map((n, i) => (
          <circle
            key={`node-${i}`}
            ref={(el) => {
              nodeRefs.current[i] = el;
            }}
            cx={n.x}
            cy={n.y}
            r="2.5"
            fill="var(--zaz-surface-alt)"
            stroke="var(--zaz-accent)"
            strokeWidth="1.2"
          />
        ))}
      </svg>
    </div>
  );
}
