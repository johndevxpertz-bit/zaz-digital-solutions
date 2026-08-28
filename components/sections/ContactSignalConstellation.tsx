"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion, gateContextToViewport } from "@/lib/animation/gsap";

const NODES = [
  { x: 4, y: 10 },
  { x: 60, y: 2 },
  { x: 112, y: 12 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Quadratic-bezier point — used so an occasional "reroute" reads as a
// genuinely different path (an arc) rather than the same straight line.
function bezier(p0: { x: number; y: number }, c: { x: number; y: number }, p1: { x: number; y: number }, t: number) {
  const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * c.x + t * t * p1.x;
  const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * c.y + t * t * p1.y;
  return { x, y };
}

/**
 * Contact hero accent: small and restrained, per the brief — a miniature
 * transmission system rather than generic nodes-and-lines. A single signal
 * packet travels sequentially from node to node and back, brightening and
 * briefly pulsing each node as it arrives (a literal "message received"),
 * with the connecting lines dimly present at rest. Every couple of trips
 * the packet takes a curved alternate route instead of the straight line —
 * a subtle "reroute" — before returning to the direct path. Nodes drift
 * very slightly toward the cursor within a small radius. Sits above the
 * kicker; never competes with the form below it.
 */
export default function ContactSignalConstellation() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const packetRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const nodes = nodeRefs.current;
    const lines = lineRefs.current;
    const packet = packetRef.current;
    if (!wrap || nodes.some((n) => !n) || !packet) return;
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

      function arrive(i: number) {
        gsap.fromTo(nodes[i], { attr: { r: 2.5 } }, { attr: { r: 4.2 }, duration: 0.18, ease: "power1.out", yoyo: true, repeat: 1 });
      }

      // A single packet travels the chain sequentially — forward, then
      // back — rather than independent simultaneous pulses per segment.
      // Every third pass it curves through a control point instead of
      // going straight: a subtle, occasional reroute.
      let tripCount = 0;
      const cycle = gsap.timeline({ repeat: -1, delay: 0.6 });
      for (let dir = 0; dir < 2; dir++) {
        const order = dir === 0 ? [0, 1, 2] : [2, 1, 0];
        for (let step = 0; step < order.length - 1; step++) {
          const fromIdx = order[step];
          const toIdx = order[step + 1];
          cycle.call(() => {
            tripCount += 1;
            const rerouted = tripCount % 3 === 0;
            const p0 = pos[fromIdx];
            const p1 = pos[toIdx];
            const mid = { x: (p0.x + p1.x) / 2, y: rerouted ? (p0.y + p1.y) / 2 - 14 : (p0.y + p1.y) / 2 };
            const t = { v: 0 };
            gsap.to(t, {
              v: 1,
              duration: 0.85,
              ease: "power1.inOut",
              onUpdate: () => {
                const point = rerouted ? bezier(p0, mid, p1, t.v) : { x: lerp(p0.x, p1.x, t.v), y: lerp(p0.y, p1.y, t.v) };
                packet.setAttribute("cx", String(point.x));
                packet.setAttribute("cy", String(point.y));
              },
              onComplete: () => arrive(toIdx),
            });
          });
          cycle.to({}, { duration: 0.85 });
        }
        cycle.to({}, { duration: 0.5 });
      }

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

    // Pauses the node drift / packet-cycle loops (repeat: -1) while this
    // section is scrolled out of view — same tween instances, just
    // paused/resumed.
    const disconnectVisibilityGate = gateContextToViewport(ctx, wrapRef.current!);

    return () => {
      disconnectVisibilityGate();
      ctx.revert();
    };
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
        <circle ref={packetRef} cx={NODES[0].x} cy={NODES[0].y} r="2.2" fill="var(--zaz-accent)" opacity="0.95" />
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
