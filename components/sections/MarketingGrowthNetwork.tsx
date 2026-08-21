"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type Vec = { x: number; y: number };

const NODE_COUNT = 6;
const VIEW = 300;

// Two named layouts nodes cycle between: a loose scatter, and an ascending
// staircase (the "campaign organizing into growth" shape). Index order also
// defines which nodes connect (0-1-2-3-4-5), so the connecting lines always
// trace a coherent path rather than a tangle.
const SCATTERED: Vec[] = [
  { x: 40, y: 210 },
  { x: 120, y: 60 },
  { x: 200, y: 190 },
  { x: 70, y: 130 },
  { x: 250, y: 90 },
  { x: 160, y: 250 },
];
const ORGANIZED: Vec[] = [
  { x: 30, y: 230 },
  { x: 80, y: 190 },
  { x: 130, y: 150 },
  { x: 175, y: 105 },
  { x: 220, y: 70 },
  { x: 265, y: 35 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/**
 * Digital Marketing hero: a small node network, not a static chart. Nodes
 * continuously cycle between a loose scatter and an ascending "growth"
 * staircase, with connecting lines fading in only once the network has
 * organized, and a light pulse continuously traveling along each connection
 * during that hold — data becoming a coherent, moving campaign, on a loop.
 * The whole network sits in a perspective wrapper and tilts gently in 3D;
 * nodes drift toward the cursor within a small radius (a lightweight
 * "field" feel, not real physics). Pure SVG + GSAP, no per-frame React state.
 */
export default function MarketingGrowthNetwork() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);

  useEffect(() => {
    const group = groupRef.current;
    const nodes = nodeRefs.current;
    const lines = lineRefs.current;
    const pulses = pulseRefs.current;
    if (!group || nodes.some((n) => !n) || lines.some((l) => !l)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      // Live position state per node — the single source of truth both the
      // circles and their connecting lines read from on every update, so
      // lines never lag behind the nodes they connect.
      const pos: Vec[] = ORGANIZED.map((p) => ({ ...p }));

      function applyPositions() {
        for (let i = 0; i < NODE_COUNT; i++) {
          nodes[i]!.setAttribute("cx", String(pos[i].x));
          nodes[i]!.setAttribute("cy", String(pos[i].y));
        }
        for (let i = 0; i < NODE_COUNT - 1; i++) {
          const line = lines[i];
          if (!line) continue;
          line.setAttribute("x1", String(pos[i].x));
          line.setAttribute("y1", String(pos[i].y));
          line.setAttribute("x2", String(pos[i + 1].x));
          line.setAttribute("y2", String(pos[i + 1].y));
        }
      }
      applyPositions();

      // Gentle independent per-node drift, always running underneath the
      // phase cycle.
      pos.forEach((_, i) => {
        gsap.to(pos[i], {
          x: `+=${6 + (i % 3) * 2}`,
          duration: 3 + i * 0.3,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          onUpdate: applyPositions,
        });
      });

      const tl = gsap.timeline({ repeat: -1, delay: 0.3 });
      // Scatter out.
      pos.forEach((p, i) => {
        tl.to(p, { x: SCATTERED[i].x, y: SCATTERED[i].y, duration: 1.4, ease: "power2.inOut", onUpdate: applyPositions }, 0);
      });
      tl.to(lines, { opacity: 0, duration: 0.6, stagger: 0.03 }, 0)
        .to({}, { duration: 1.2 }); // hold, scattered
      // Organize into the growth staircase.
      pos.forEach((p, i) => {
        tl.to(p, { x: ORGANIZED[i].x, y: ORGANIZED[i].y, duration: 1.5, ease: "power3.inOut", onUpdate: applyPositions }, "+=0");
      });
      tl.to(lines, { opacity: 0.75, duration: 0.8, stagger: 0.08 }, "-=0.9").to({}, { duration: 2.4 }); // hold, organized — pulses travel

      // Pulses: continuously travel along each connected segment while
      // organized; harmless (just invisible, opacity 0 baseline) while
      // scattered since the lines themselves are hidden then.
      lines.forEach((line, i) => {
        const pulse = pulses[i];
        if (!line || !pulse) return;
        const t = { v: 0 };
        gsap.to(t, {
          v: 1,
          duration: 1.1,
          ease: "power1.inOut",
          repeat: -1,
          delay: i * 0.15,
          onUpdate: () => {
            pulse.setAttribute("cx", String(lerp(pos[i].x, pos[i + 1].x, t.v)));
            pulse.setAttribute("cy", String(lerp(pos[i].y, pos[i + 1].y, t.v)));
          },
        });
      });

      // Subtle continuous 3D tilt on the whole group.
      gsap.to(group, { rotationY: 10, rotationX: -6, duration: 5, ease: "sine.inOut", yoyo: true, repeat: -1, transformOrigin: "50% 50%" });

      // Cursor proximity: nodes drift slightly toward the pointer within a
      // small radius — a lightweight "field", not physics.
      const stage = stageRef.current;
      function onPointerMove(e: PointerEvent) {
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) * VIEW;
        const py = ((e.clientY - rect.top) / rect.height) * VIEW;
        pos.forEach((p) => {
          const dx = px - p.x;
          const dy = py - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 70 && dist > 0.01) {
            gsap.to(p, { x: `+=${(dx / dist) * 4}`, y: `+=${(dy / dist) * 4}`, duration: 0.5, ease: "power1.out", onUpdate: applyPositions });
          }
        });
      }
      if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) {
        stage?.addEventListener("pointermove", onPointerMove);
      }

      return () => {
        stage?.removeEventListener("pointermove", onPointerMove);
      };
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto aspect-square w-full max-w-[380px]" style={{ perspective: 900 }}>
      <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="h-full w-full overflow-visible" style={{ transformStyle: "preserve-3d" }}>
        <g ref={groupRef} style={{ transformOrigin: "50% 50%" }}>
          {/* Default cx/cy/x1..y2 below match ORGANIZED — the correct
              resting composition for reduced-motion users and for the
              instant before this component's effect runs. */}
          {Array.from({ length: NODE_COUNT - 1 }).map((_, i) => (
            <line
              key={`line-${i}`}
              ref={(el) => {
                lineRefs.current[i] = el;
              }}
              x1={ORGANIZED[i].x}
              y1={ORGANIZED[i].y}
              x2={ORGANIZED[i + 1].x}
              y2={ORGANIZED[i + 1].y}
              stroke="var(--zaz-accent)"
              strokeWidth="1.4"
              opacity={0.75}
            />
          ))}
          {Array.from({ length: NODE_COUNT - 1 }).map((_, i) => (
            <circle
              key={`pulse-${i}`}
              ref={(el) => {
                pulseRefs.current[i] = el;
              }}
              cx={ORGANIZED[i].x}
              cy={ORGANIZED[i].y}
              r="3"
              fill="var(--zaz-accent)"
              opacity="0.85"
            />
          ))}
          {Array.from({ length: NODE_COUNT }).map((_, i) => (
            <circle
              key={`node-${i}`}
              ref={(el) => {
                nodeRefs.current[i] = el;
              }}
              cx={ORGANIZED[i].x}
              cy={ORGANIZED[i].y}
              r={7 - i * 0.4}
              fill="var(--zaz-surface-alt)"
              stroke="var(--zaz-accent)"
              strokeWidth="1.6"
            />
          ))}
        </g>
      </svg>
    </div>
  );
}
