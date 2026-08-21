"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import BrowserFrame from "@/components/ui/BrowserFrame";

type WebsiteLayerStackProps = {
  websiteScreenshot?: { src: string; label: string } | null;
};

const panelBg = "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)";

/**
 * Website Design hero: an "exploded view" of a page's own interface layers
 * (nav / hero-content / footer), like a CAD exploded diagram, sitting behind
 * a real BrowserFrame. The layers continuously separate in Z with a slight
 * counter-rotation each (showing depth/structure) then converge back flush
 * into the browser frame, where the real portfolio screenshot fades in for
 * the "assembled" hold — never a fake screenshot, only ever the real one the
 * caller resolved. Mouse movement parallaxes each layer at its own depth
 * strength independent of the phase cycle; drag rotates the whole stack.
 */
export default function WebsiteLayerStack({ websiteScreenshot }: WebsiteLayerStackProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const shotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const rig = rigRef.current;
    const nav = navRef.current;
    const hero = heroRef.current;
    const footer = footerRef.current;
    const shot = shotRef.current;
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
      tl.to(nav, { z: 90, y: -70, rotationX: 8, opacity: 1, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(hero, { z: 40, opacity: 1, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(footer, { z: -70, y: 60, rotationX: -8, opacity: 1, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(shot, { opacity: 0, duration: 0.5 }, 0)
        .to({}, { duration: 1.6 }) // hold, exploded
        .to([nav, hero, footer], { z: 0, y: 0, rotationX: 0, opacity: 0, duration: 1.1, ease: "power3.inOut" }, "+=0")
        .to(shot, { opacity: 1, duration: 0.6 }, "-=0.4")
        .to({}, { duration: 2.2 }); // hold, assembled (real screenshot visible)

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
        className="relative aspect-[16/11] w-full cursor-grab touch-none active:cursor-grabbing"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Assembled base: the real browser frame + screenshot */}
        <div className="absolute inset-0 overflow-hidden rounded-[var(--zaz-radius)] shadow-2xl shadow-black/50">
          <BrowserFrame label={websiteScreenshot?.label}>
            <div ref={shotRef} className="relative h-full w-full">
              {websiteScreenshot ? (
                <Image src={websiteScreenshot.src} alt={websiteScreenshot.label} fill sizes="460px" className="object-cover object-top" />
              ) : (
                <div className="h-full w-full" style={{ background: panelBg }} />
              )}
            </div>
          </BrowserFrame>
        </div>

        {/* Exploded structure layers, hidden behind the frame at rest */}
        <div
          ref={navRef}
          aria-hidden
          className="absolute left-[6%] right-[6%] top-[6%] h-[16%] rounded-[var(--zaz-radius-sm)] border border-zaz-border opacity-0 shadow-2xl shadow-black/40"
          style={{ background: panelBg, transformStyle: "preserve-3d" }}
        />
        <div
          ref={heroRef}
          aria-hidden
          className="absolute left-[14%] right-[14%] top-[32%] h-[36%] rounded-[var(--zaz-radius-sm)] border border-zaz-border opacity-0 shadow-2xl shadow-black/40"
          style={{
            background: "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--zaz-accent) 16%, transparent) 0%, transparent 65%), " + panelBg,
            transformStyle: "preserve-3d",
          }}
        />
        <div
          ref={footerRef}
          aria-hidden
          className="absolute bottom-[6%] left-[10%] right-[10%] h-[14%] rounded-[var(--zaz-radius-sm)] border border-zaz-border opacity-0 shadow-2xl shadow-black/40"
          style={{ background: panelBg, transformStyle: "preserve-3d" }}
        />
      </div>
    </div>
  );
}
