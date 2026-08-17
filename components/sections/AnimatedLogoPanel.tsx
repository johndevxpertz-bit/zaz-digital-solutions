"use client";

import { useState } from "react";
import VideoLightbox from "@/components/ui/VideoLightbox";
import type { AnimatedLogoAsset } from "@/lib/media";

type AnimatedLogoPanelProps = {
  items: AnimatedLogoAsset[];
};

/**
 * Animated Logos is deliberately its own category, not another
 * LogoCategoryPanel variant — real video files instead of static images, no
 * subtype filter pills (every item here already is "animated"), no pricing
 * block (animated logo work is scoped per-project, quoted through Contact).
 * Every item is a real file discovered server-side by getAnimatedLogoAssets()
 * — no placeholders, no empty slots.
 */
export default function AnimatedLogoPanel({ items }: AnimatedLogoPanelProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const openItem = openIndex !== null ? items[openIndex] : null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--zaz-radius)] border border-dashed border-zaz-border py-16 text-center">
        <p className="font-heading text-lg font-semibold text-zaz-text">More examples coming soon.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
        A logo that moves — a short reveal animation built for intros, social profiles, and video branding.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Watch ${item.title} full size`}
              className="zaz-tile-enter group relative aspect-[4/5] overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border bg-zaz-bg-deep transition-colors duration-500 hover:border-zaz-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
              style={{ animationDelay: `${(index % 12) * 30}ms` }}
            >
              <video
                className="h-full w-full object-contain transition-transform duration-500 ease-[var(--zaz-ease)] group-hover:scale-110"
                autoPlay
                muted
                loop
                playsInline
              >
                <source src={item.src} type={item.type} />
              </video>
              <span
                aria-hidden
                className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-zaz-bg-deep/70 text-zaz-text backdrop-blur-sm"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2.5 1.5L10 6L2.5 10.5V1.5Z" fill="currentColor" />
                </svg>
              </span>
            </button>
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-zaz-text">{item.title}</span>
              <span className="shrink-0 zaz-label text-zaz-muted">Animated</span>
            </div>
          </div>
        ))}
      </div>

      <VideoLightbox
        open={openItem !== null}
        onClose={() => setOpenIndex(null)}
        src={openItem?.src ?? null}
        type={openItem?.type}
        label={openItem?.title}
      />
    </div>
  );
}
