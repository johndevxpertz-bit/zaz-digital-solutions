"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, registerGsap, prefersReducedMotion } from "@/lib/animation/gsap";
import useTilt from "@/lib/animation/useTilt";
import BrowserFrame from "@/components/ui/BrowserFrame";

type PageHeroVisualProps = {
  variant: "logo" | "website" | "marketing" | "about" | "portfolio";
  /** "website": a real, resolved screenshot to feature — falls back to an empty frame when not supplied. */
  websiteScreenshot?: { src: string; label: string } | null;
  /** "portfolio": real, resolved thumbnails to feature in the collage (never placeholders — real work only). */
  portfolioThumbnails?: { src: string; alt: string }[];
};

/** Shared pointer-parallax layer, same pattern as HeroVisual.tsx. */
function useFloatParallax() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    if (prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
    const section = wrapper.closest("section");
    if (!section) return;

    registerGsap();
    const setX = gsap.quickTo(wrapper, "x", { duration: 0.9, ease: "power3.out" });
    const setY = gsap.quickTo(wrapper, "y", { duration: 0.9, ease: "power3.out" });

    function handlePointerMove(event: Event) {
      const { clientX, clientY } = event as PointerEvent;
      const rect = section!.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width - 0.5;
      const py = (clientY - rect.top) / rect.height - 0.5;
      setX(px * 14);
      setY(py * 14);
    }

    section.addEventListener("pointermove", handlePointerMove);
    return () => section.removeEventListener("pointermove", handlePointerMove);
  }, []);
  return wrapperRef;
}

const cardBg = "linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)";

/**
 * Abstract, page-specific hero visual — one shared component so every page
 * hero reuses the same primitives (useTilt, zaz-float keyframes, pointer
 * parallax) instead of growing a parallel system per page. Every shape is
 * geometric/typographic, never a fake screenshot or invented work — the
 * "website" and "portfolio" variants only ever render real, server-resolved
 * images the caller passes in.
 */
export default function PageHeroVisual({ variant, websiteScreenshot, portfolioThumbnails }: PageHeroVisualProps) {
  const wrapperRef = useFloatParallax();
  const tiltRef = useTilt<HTMLDivElement>({ max: 4, scale: 1.01 });

  if (variant === "logo") {
    return (
      <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[380px]">
        <div ref={wrapperRef} className="relative h-full w-full">
          <div
            className="zaz-float-a absolute left-[6%] top-[4%] flex h-[54%] w-[54%] items-center justify-center rounded-full border border-zaz-border shadow-2xl shadow-black/40"
            style={{
              background:
                "radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--zaz-accent) 20%, transparent) 0%, transparent 65%), " +
                cardBg,
            }}
          >
            <span aria-hidden className="font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(3rem, 7vw, 4.5rem)" }}>
              Z
            </span>
          </div>
          <div
            className="zaz-float-b absolute bottom-[6%] right-[2%] flex h-[40%] w-[46%] rotate-3 items-center justify-center rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40"
            style={{ background: cardBg }}
          >
            <span aria-hidden className="font-heading text-2xl font-semibold tracking-wide text-zaz-text">
              ZDS
            </span>
          </div>
          <div
            className="zaz-float-a absolute bottom-0 left-0 flex h-[26%] w-[26%] -rotate-6 items-center justify-center rounded-[var(--zaz-radius-pill)] border border-zaz-accent-dim shadow-xl shadow-black/30"
            style={{ animationDelay: "-5s", background: "var(--zaz-bg-deep)" }}
          >
            <span aria-hidden className="h-3 w-3 rounded-full bg-zaz-accent" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "website") {
    return (
      <div ref={tiltRef} className="relative mx-auto w-full max-w-[460px]">
        <div ref={wrapperRef} className="relative aspect-[16/11] w-full overflow-hidden rounded-[var(--zaz-radius)] shadow-2xl shadow-black/50">
          <BrowserFrame label={websiteScreenshot?.label}>
            {websiteScreenshot ? (
              <Image
                src={websiteScreenshot.src}
                alt={websiteScreenshot.label}
                fill
                sizes="460px"
                className="object-cover object-top"
              />
            ) : (
              <div className="h-full w-full" style={{ background: cardBg }} />
            )}
          </BrowserFrame>
        </div>
      </div>
    );
  }

  if (variant === "marketing") {
    return (
      <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[380px]">
        <div ref={wrapperRef} className="relative h-full w-full">
          <div
            className="zaz-float-a absolute left-0 top-[8%] h-[52%] w-[62%] rounded-[var(--zaz-radius)] border border-zaz-border p-6 shadow-2xl shadow-black/40"
            style={{ background: cardBg }}
          >
            <svg aria-hidden viewBox="0 0 200 100" className="h-full w-full" fill="none">
              <polyline
                points="0,80 40,60 80,68 120,30 160,40 200,10"
                stroke="var(--zaz-accent)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.85"
              />
            </svg>
          </div>
          <div
            className="zaz-float-b absolute bottom-0 right-[4%] flex h-[38%] w-[48%] items-end gap-2 rounded-[var(--zaz-radius)] border border-zaz-border p-5 shadow-2xl shadow-black/40"
            style={{ background: cardBg }}
          >
            {[45, 70, 55, 85].map((h, i) => (
              <span key={i} aria-hidden className="flex-1 rounded-sm bg-zaz-accent" style={{ height: `${h}%`, opacity: 0.5 + i * 0.1 }} />
            ))}
          </div>
          <div
            className="zaz-float-a absolute right-[10%] top-0 flex h-[24%] w-[24%] items-center justify-center rounded-full border border-zaz-accent-dim shadow-xl shadow-black/30"
            style={{ animationDelay: "-4s", background: "var(--zaz-bg-deep)" }}
          >
            <span aria-hidden className="zaz-label text-zaz-accent">
              ↗
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "about") {
    return (
      <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[380px]">
        <div ref={wrapperRef} className="relative flex h-full w-full items-center justify-center">
          <div
            className="zaz-float-a absolute h-[70%] w-[70%] rounded-full border border-zaz-border"
            style={{ background: "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--zaz-accent) 14%, transparent) 0%, transparent 65%)" }}
          />
          <div
            className="zaz-float-b absolute left-[8%] top-[10%] h-[42%] w-[42%] rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40"
            style={{ background: cardBg }}
          />
          <div
            className="zaz-float-a absolute bottom-[10%] right-[8%] h-[42%] w-[42%] rotate-6 rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40"
            style={{ animationDelay: "-5s", background: cardBg }}
          />
          <span aria-hidden className="relative font-heading font-semibold text-zaz-accent" style={{ fontSize: "clamp(2.5rem, 6vw, 3.5rem)" }}>
            ZAZ
          </span>
        </div>
      </div>
    );
  }

  // portfolio — real thumbnails only
  const positions = [
    "left-0 top-0 h-[52%] w-[58%]",
    "right-0 top-[6%] h-[40%] w-[44%] rotate-3",
    "bottom-0 left-[10%] h-[36%] w-[46%] -rotate-2",
  ];
  return (
    <div ref={tiltRef} className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div ref={wrapperRef} className="relative h-full w-full">
        {(portfolioThumbnails ?? []).slice(0, 3).map((thumb, index) => (
          <div
            key={thumb.src}
            className={`${index % 2 === 0 ? "zaz-float-a" : "zaz-float-b"} absolute overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border shadow-2xl shadow-black/40 ${positions[index]}`}
            style={index === 2 ? { animationDelay: "-5s" } : undefined}
          >
            <Image src={thumb.src} alt={thumb.alt} fill sizes="240px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
