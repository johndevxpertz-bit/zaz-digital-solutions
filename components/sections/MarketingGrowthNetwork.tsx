"use client";

import { useEffect, useRef } from "react";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";

type Vec = { x: number; y: number };

const NODE_COUNT = 6;
const VIEW = 300;

// Three named campaign states nodes cycle between — audience (a loose
// scatter), growth (an ascending staircase), and results (a converging
// funnel toward a single outcome point) — so the network periodically
// reconfigures between distinct, readable campaign states rather than only
// ever separating and re-forming the same shape. Index order also defines
// which nodes connect (0-1-2-3-4-5), so the connecting line always traces a
// coherent path.
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
const FUNNEL: Vec[] = [
  { x: 30, y: 60 },
  { x: 90, y: 90 },
  { x: 150, y: 120 },
  { x: 205, y: 148 },
  { x: 250, y: 168 },
  { x: 278, y: 182 },
];

// A handful of small, independent background particles representing
// audience/data — not connected to the main growth chain, drifting on their
// own slow loops behind it, for a sense of a wider data field the campaign
// draws from. Literal resting coordinates (no runtime trig), so there is
// nothing for server/client math to disagree on before hydration.
const AMBIENT = [
  { x: 55, y: 40 },
  { x: 245, y: 235 },
  { x: 10, y: 150 },
  { x: 285, y: 60 },
  { x: 190, y: 265 },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Each ambient particle's nearest node in the organized layout — used to
// draw a brief "data stream" from audience to campaign when the network
// organizes, so the ambient field reads as feeding the campaign rather than
// sitting decoratively behind it.
const AMBIENT_NEAREST = AMBIENT.map((dot) => {
  let best = 0;
  let bestDist = Infinity;
  ORGANIZED.forEach((node, i) => {
    const d = Math.hypot(node.x - dot.x, node.y - dot.y);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  });
  return best;
});

/**
 * Digital Marketing hero: a living campaign ecosystem, not a static chart.
 * The core six nodes continuously reconfigure between three campaign
 * states — scattered audience data, an organized ascending growth chain,
 * and a converging results funnel — holding briefly in each. A soft filled
 * area under the growth chain, and the connecting segments themselves, are
 * redrawn every frame directly from the same node-position state (never a
 * separate static graphic), with a light pulse continuously traveling each
 * segment while connected. A handful of small ambient particles drift
 * independently in the background, standing in for the wider audience/data
 * field the campaign draws from. The whole network sits in a perspective
 * wrapper and tilts gently in 3D; nodes drift toward the cursor within a
 * small radius (a lightweight "field" feel, not real physics). Pure SVG +
 * GSAP, no per-frame React state.
 */
export default function MarketingGrowthNetwork() {
  const stageRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const nodeRefs = useRef<(SVGCircleElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const pulseRefs = useRef<(SVGCircleElement | null)[]>([]);
  const areaRef = useRef<SVGPolygonElement>(null);
  const ambientRefs = useRef<(SVGCircleElement | null)[]>([]);
  const streamRefs = useRef<(SVGLineElement | null)[]>([]);

  useEffect(() => {
    const group = groupRef.current;
    const nodes = nodeRefs.current;
    const lines = lineRefs.current;
    const pulses = pulseRefs.current;
    const area = areaRef.current;
    const ambient = ambientRefs.current;
    if (!group || nodes.some((n) => !n) || lines.some((l) => !l)) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    // Snapshot the node refs into a stable, fully-non-null array of the
    // actual DOM elements (the guard above just confirmed none are null) —
    // not a copy of `nodeRefs.current` itself, but the real SVGCircleElement
    // objects it currently holds. The tweens below run forever (repeat: -1)
    // via onUpdate callbacks that keep firing for as long as this effect's
    // gsap.context is alive. React can null out `nodeRefs.current` entries
    // synchronously (ref detachment happens in the commit phase) before this
    // effect's cleanup — a passive effect, which runs later — ever calls
    // ctx.revert() to actually stop those tweens; this is exactly what React
    // Strict Mode's dev-only mount→cleanup→mount cycle does. Reading `nodes[i]`
    // (an alias for that same mutable, nullable array) from inside the
    // still-ticking onUpdate hit that null in the gap between the two,
    // throwing on `.setAttribute`. Capturing the elements once, into an
    // array nothing else ever mutates, makes the closures below hold the
    // real DOM nodes directly — immune to the ref array being cleared out
    // from under them.
    const nodeEls = nodes.filter((n): n is SVGCircleElement => n !== null);

    const ctx = gsap.context(() => {
      // Live position state per node — the single source of truth the
      // circles, connecting lines, and the growth-fill area all read from on
      // every update, so nothing ever lags behind or looks like a separate,
      // independently-animated graphic.
      const pos: Vec[] = ORGANIZED.map((p) => ({ ...p }));

      function applyPositions() {
        for (let i = 0; i < NODE_COUNT; i++) {
          nodeEls[i].setAttribute("cx", String(pos[i].x));
          nodeEls[i].setAttribute("cy", String(pos[i].y));
        }
        for (let i = 0; i < NODE_COUNT - 1; i++) {
          const line = lines[i];
          if (!line) continue;
          line.setAttribute("x1", String(pos[i].x));
          line.setAttribute("y1", String(pos[i].y));
          line.setAttribute("x2", String(pos[i + 1].x));
          line.setAttribute("y2", String(pos[i + 1].y));
        }
        if (area) {
          const top = pos.map((p) => `${p.x},${p.y}`).join(" ");
          area.setAttribute("points", `${pos[0].x},${VIEW} ${top} ${pos[NODE_COUNT - 1].x},${VIEW}`);
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

      // Ambient background particles: slow, independent, never connected by
      // default — a wider data field behind the main campaign chain. Their
      // stream line's origin is kept in sync so a signal flash always
      // starts from the particle's current position.
      ambient.forEach((dot, i) => {
        if (!dot) return;
        gsap.to(dot, {
          attr: { cx: `+=${10 + (i % 2) * 6}`, cy: `+=${-8 - (i % 3) * 4}` },
          duration: 6 + i * 1.1,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: i * 0.4,
          onUpdate: () => {
            const line = streamRefs.current[i];
            if (!line) return;
            line.setAttribute("x1", dot.getAttribute("cx") ?? String(AMBIENT[i].x));
            line.setAttribute("y1", dot.getAttribute("cy") ?? String(AMBIENT[i].y));
          },
        });
      });

      const tl = gsap.timeline({ repeat: -1, delay: 0.3 });
      // Scatter out — audience state.
      pos.forEach((p, i) => {
        tl.to(p, { x: SCATTERED[i].x, y: SCATTERED[i].y, duration: 1.4, ease: "power2.inOut", onUpdate: applyPositions }, 0);
      });
      tl.to(lines, { opacity: 0, duration: 0.6, stagger: 0.03 }, 0)
        .to(area, { opacity: 0, duration: 0.6 }, 0)
        .to({}, { duration: 1.2 }); // hold, scattered
      // Organize into the growth staircase — audience particles briefly
      // signal into the campaign via a data-stream line to their nearest
      // node as the network forms.
      pos.forEach((p, i) => {
        tl.to(p, { x: ORGANIZED[i].x, y: ORGANIZED[i].y, duration: 1.5, ease: "power3.inOut", onUpdate: applyPositions }, "+=0");
      });
      tl.to(lines, { opacity: 0.75, duration: 0.8, stagger: 0.08 }, "-=0.9")
        .to(area, { opacity: 0.16, duration: 1 }, "-=0.6")
        .call(() => {
          streamRefs.current.forEach((line, i) => {
            if (!line) return;
            const target = pos[AMBIENT_NEAREST[i]];
            line.setAttribute("x2", String(target.x));
            line.setAttribute("y2", String(target.y));
            gsap.fromTo(line, { opacity: 0 }, { opacity: 0.45, duration: 0.4, yoyo: true, repeat: 1, ease: "power1.inOut" });
          });
        }, undefined, "-=0.4")
        .to({}, { duration: 2 }); // hold, organized — pulses travel, area filled
      // Converge into the results funnel.
      pos.forEach((p, i) => {
        tl.to(p, { x: FUNNEL[i].x, y: FUNNEL[i].y, duration: 1.4, ease: "power2.inOut", onUpdate: applyPositions }, "+=0.2");
      });
      tl.to(area, { opacity: 0.24, duration: 0.8 }, "-=0.9").to({}, { duration: 2 }); // hold, converged — results
      // Release back toward organized before the loop repeats.
      pos.forEach((p, i) => {
        tl.to(p, { x: ORGANIZED[i].x, y: ORGANIZED[i].y, duration: 1.4, ease: "power2.inOut", onUpdate: applyPositions }, "+=0.1");
      });
      tl.to(area, { opacity: 0.16, duration: 0.8 }, "-=0.9").to({}, { duration: 0.6 });

      // Pulses: continuously travel along each connected segment whenever
      // the lines are visible; harmless while scattered since the lines
      // themselves are hidden then.
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
          {AMBIENT.map((dot, i) => (
            <line
              key={`stream-${i}`}
              ref={(el) => {
                streamRefs.current[i] = el;
              }}
              x1={dot.x}
              y1={dot.y}
              x2={ORGANIZED[AMBIENT_NEAREST[i]].x}
              y2={ORGANIZED[AMBIENT_NEAREST[i]].y}
              stroke="var(--zaz-accent)"
              strokeWidth="0.8"
              opacity="0"
            />
          ))}
          {AMBIENT.map((dot, i) => (
            <circle
              key={`ambient-${i}`}
              ref={(el) => {
                ambientRefs.current[i] = el;
              }}
              cx={dot.x}
              cy={dot.y}
              r="1.6"
              fill="var(--zaz-accent)"
              opacity="0.3"
            />
          ))}
          {/* Default points below match ORGANIZED — the correct resting
              composition for reduced-motion users and the instant before
              this component's effect runs. */}
          <polygon
            ref={areaRef}
            points={`${ORGANIZED[0].x},${VIEW} ${ORGANIZED.map((p) => `${p.x},${p.y}`).join(" ")} ${ORGANIZED[NODE_COUNT - 1].x},${VIEW}`}
            fill="var(--zaz-accent)"
            opacity="0.16"
          />
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
