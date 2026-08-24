"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import BrowserFrame from "@/components/ui/BrowserFrame";

type WebsiteLayerStackProps = {
  websiteScreenshot?: { src: string; label: string } | null;
};

const panelBg = "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)";

// Each exploded layer shows a real cropped slice of the actual site
// screenshot (never an abstract placeholder), positioned to roughly match
// where that slice sits in the assembled page, so the real website is
// visible in every phase of the build — not only at the very end.
const LAYER_CROPS = {
  nav: "50% 2%",
  hero: "50% 28%",
  footer: "50% 96%",
} as const;

function WireframeOverlay() {
  return (
    <svg aria-hidden viewBox="0 0 100 40" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
      <line x1="4" y1="10" x2="40" y2="10" stroke="var(--zaz-accent)" strokeWidth="1.5" opacity="0.8" />
      <line x1="4" y1="20" x2="96" y2="20" stroke="var(--zaz-accent)" strokeWidth="1" opacity="0.5" />
      <line x1="4" y1="28" x2="70" y2="28" stroke="var(--zaz-accent)" strokeWidth="1" opacity="0.5" />
      <rect x="60" y="6" width="32" height="10" fill="none" stroke="var(--zaz-accent)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

function BlocksOverlay({ variant }: { variant: "nav" | "hero" | "footer" }) {
  if (variant === "nav") {
    return (
      <div className="flex h-full w-full items-center justify-between px-[6%]">
        <span className="h-[26%] w-[14%] rounded-sm bg-zaz-accent-dim opacity-70" />
        <div className="flex gap-[6%]">
          <span className="h-[10%] w-[10%] rounded-sm bg-zaz-border-strong" />
          <span className="h-[10%] w-[10%] rounded-sm bg-zaz-border-strong" />
          <span className="h-[10%] w-[10%] rounded-sm bg-zaz-border-strong" />
        </div>
      </div>
    );
  }
  if (variant === "hero") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-[8%]">
        <span className="h-[10%] w-[55%] rounded-sm bg-zaz-accent-dim opacity-70" />
        <span className="h-[7%] w-[70%] rounded-sm bg-zaz-border-strong opacity-70" />
        <span className="h-[12%] w-[26%] rounded-sm bg-zaz-accent opacity-60" />
      </div>
    );
  }
  return (
    <div className="grid h-full w-full grid-cols-3 items-center gap-[4%] px-[6%]">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-[40%] rounded-sm bg-zaz-border-strong opacity-60" />
      ))}
    </div>
  );
}

/**
 * Website Design hero: a full build sequence, not a two-state explode/
 * assemble toggle. Each cycle runs: (1) a wireframe/grid flash over the
 * layers — layout stage; (2) skeleton UI blocks form in their place — the
 * interface taking shape; (3) those blocks cross-fade into a real cropped
 * slice of the actual site screenshot on every layer, so the genuine
 * website is visible while still "under construction," not only at the
 * end; (4) a small indicator activates across the nav layer's menu items,
 * as if the interface just became interactive; (5) the layers converge
 * back flush into the real BrowserFrame where the full screenshot is
 * assembled; (6) rather than holding frozen, the assembled site keeps a
 * slow idle "in use" state — a subtle scroll drift and a small cursor dot
 * that moves to a nav item and clicks — before the next cycle begins.
 */
export default function WebsiteLayerStack({ websiteScreenshot }: WebsiteLayerStackProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);
  const shotImgWrapRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const wireRefs = useRef<(HTMLDivElement | null)[]>([]);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);
  const imgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const navIndicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const rig = rigRef.current;
    const nav = navRef.current;
    const hero = heroRef.current;
    const footer = footerRef.current;
    const shot = shotRef.current;
    const wires = wireRefs.current;
    const blocks = blockRefs.current;
    const imgs = imgRefs.current;
    if (!rig || !nav || !hero || !footer || !shot) return;
    if (prefersReducedMotion()) return;

    registerGsap();

    const ctx = gsap.context(() => {
      const layers = [nav, hero, footer];

      // Gentle independent bob on each layer, always running — keeps the
      // "exploded" hold from ever looking frozen.
      layers.forEach((el, i) => {
        gsap.to(el, { y: `+=${6 + i * 2}`, duration: 3.4 + i * 0.5, ease: "sine.inOut", yoyo: true, repeat: -1 });
      });

      const tl = gsap.timeline({ repeat: -1, delay: 0.3 });

      // Stage 1: wireframe/layout flash.
      tl.set(wires, { opacity: 0 })
        .set(blocks, { opacity: 0 })
        .set(imgs, { opacity: 0 })
        .to(wires, { opacity: 1, duration: 0.35, ease: "power1.out" }, 0)
        // Layers separate into view.
        .to(nav, { z: 90, y: -70, rotationX: 8, opacity: 1, duration: 1.1, ease: "power2.inOut" }, 0.25)
        .to(hero, { z: 40, opacity: 1, duration: 1.1, ease: "power2.inOut" }, 0.25)
        .to(footer, { z: -70, y: 60, rotationX: -8, opacity: 1, duration: 1.1, ease: "power2.inOut" }, 0.25)
        .to(shot, { opacity: 0, duration: 0.4 }, 0.25)
        .to(wires, { opacity: 0, duration: 0.4, ease: "power1.in" }, 0.75)
        // Stage 2: UI blocks form.
        .to(blocks, { opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.06 }, 0.95)
        .to({}, { duration: 0.7 })
        // Stage 3: real content populates (blocks cross-fade into the actual
        // cropped screenshot slices).
        .to(imgs, { opacity: 1, duration: 0.7, ease: "power1.inOut", stagger: 0.08 }, "+=0")
        .to(blocks, { opacity: 0, duration: 0.5, ease: "power1.in" }, "<")
        // Stage 4: interface activates — nav indicator slides to a menu item.
        .call(() => {
          if (navIndicatorRef.current) {
            gsap.fromTo(navIndicatorRef.current, { opacity: 0, xPercent: -40 }, { opacity: 1, xPercent: 0, duration: 0.5, ease: "power2.out" });
          }
        })
        .to({}, { duration: 1.3 }) // hold, exploded — real content visible on every layer
        // Stage 5: converge back into the assembled real website.
        .call(() => navIndicatorRef.current && gsap.to(navIndicatorRef.current, { opacity: 0, duration: 0.3 }))
        .to([nav, hero, footer], { z: 0, y: 0, rotationX: 0, opacity: 0, duration: 1.1, ease: "power3.inOut" }, "+=0")
        .to(shot, { opacity: 1, duration: 0.6 }, "-=0.4")
        // Stage 6: idle "in use" — subtle scroll drift + a cursor dot that
        // moves to a nav item and clicks.
        .call(() => {
          if (!shotImgWrapRef.current) return;
          gsap.to(shotImgWrapRef.current, { yPercent: -4, duration: 1.4, ease: "sine.inOut", yoyo: true, repeat: 1 });
        })
        .call(() => {
          const cursor = cursorRef.current;
          if (!cursor) return;
          gsap.set(cursor, { opacity: 1, x: "20%", y: "70%" });
          const move = gsap.timeline();
          move
            .to(cursor, { x: "72%", y: "12%", duration: 1.1, ease: "power2.inOut" })
            .to(cursor, { scale: 0.7, duration: 0.12, yoyo: true, repeat: 1, ease: "power1.inOut" })
            .to(cursor, { opacity: 0, duration: 0.4 }, "+=0.3");
        }, undefined, "+=0.3")
        .to({}, { duration: 2.2 }); // hold, assembled

      // Per-layer mouse parallax, layered independently on top of the phase
      // timeline's own z/position tweens.
      const stage = stageRef.current;
      const setNavX = gsap.quickTo(nav, "x", { duration: 0.6, ease: "power2.out" });
      const setHeroX = gsap.quickTo(hero, "x", { duration: 0.6, ease: "power2.out" });
      const setFooterX = gsap.quickTo(footer, "x", { duration: 0.6, ease: "power2.out" });
      function onPointerMove(e: PointerEvent) {
        if (!stage) return;
        const rect = stage.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        setNavX(px * 22);
        setHeroX(px * 10);
        setFooterX(px * 22);
      }
      if (typeof window !== "undefined" && !window.matchMedia("(pointer: coarse)").matches) {
        stage?.addEventListener("pointermove", onPointerMove);
      }

      // Drag rotates the whole stack.
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
        gsap.set(rig, { rotationY: `+=${dx * 0.35}` });
      }
      function onUp() {
        isDragging = false;
      }
      stage?.addEventListener("pointerdown", onDown);
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);

      return () => {
        stage?.removeEventListener("pointermove", onPointerMove);
        stage?.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
      };
    }, stageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={stageRef} className="relative mx-auto w-full max-w-[460px]" style={{ perspective: 1300 }}>
      <div
        ref={rigRef}
        className="relative aspect-[16/11] w-full cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Assembled base: the real browser frame + screenshot */}
        <div className="absolute inset-0 overflow-hidden rounded-[var(--zaz-radius)] shadow-2xl shadow-black/50">
          <BrowserFrame label={websiteScreenshot?.label}>
            <div ref={shotRef} className="relative h-full w-full overflow-hidden">
              <div ref={shotImgWrapRef} className="relative h-full w-full">
                {websiteScreenshot ? (
                  <Image src={websiteScreenshot.src} alt={websiteScreenshot.label} fill sizes="460px" className="object-cover object-top" />
                ) : (
                  <div className="h-full w-full" style={{ background: panelBg }} />
                )}
              </div>
              <div
                ref={cursorRef}
                aria-hidden
                className="pointer-events-none absolute h-2.5 w-2.5 rounded-full border border-zaz-accent bg-zaz-bg-deep opacity-0 shadow-[0_0_6px_var(--zaz-accent)]"
              />
              <span
                ref={navIndicatorRef}
                aria-hidden
                className="pointer-events-none absolute left-[8%] top-[4%] h-[6%] w-[12%] rounded-sm bg-zaz-accent opacity-0"
              />
            </div>
          </BrowserFrame>
        </div>

        {/* Exploded structure layers, hidden behind the frame at rest — each
            cycles wireframe → skeleton blocks → real cropped screenshot
            slice, never an abstract placeholder alone. */}
        {(
          [
            { ref: navRef, variant: "nav" as const, cls: "left-[6%] right-[6%] top-[6%] h-[16%]", sizes: "420px" },
            { ref: heroRef, variant: "hero" as const, cls: "left-[14%] right-[14%] top-[32%] h-[36%]", sizes: "380px" },
            { ref: footerRef, variant: "footer" as const, cls: "bottom-[6%] left-[10%] right-[10%] h-[14%]", sizes: "400px" },
          ] as const
        ).map((layer, i) => (
          <div
            key={layer.variant}
            ref={layer.ref}
            aria-hidden
            className={`absolute overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border opacity-0 shadow-2xl shadow-black/40 ${layer.cls}`}
            style={{ transformStyle: "preserve-3d", background: panelBg }}
          >
            <div
              ref={(el) => {
                wireRefs.current[i] = el;
              }}
              className="absolute inset-0 bg-zaz-bg-deep opacity-0"
            >
              <WireframeOverlay />
            </div>
            <div
              ref={(el) => {
                blockRefs.current[i] = el;
              }}
              className="absolute inset-0 opacity-0"
            >
              <BlocksOverlay variant={layer.variant} />
            </div>
            <div
              ref={(el) => {
                imgRefs.current[i] = el;
              }}
              className="absolute inset-0 opacity-0"
            >
              {websiteScreenshot && (
                <Image
                  src={websiteScreenshot.src}
                  alt=""
                  fill
                  sizes={layer.sizes}
                  className="object-cover"
                  style={{ objectPosition: LAYER_CROPS[layer.variant] }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
