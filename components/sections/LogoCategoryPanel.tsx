"use client";

import { useMemo, useState } from "react";
import PortfolioTile from "@/components/ui/PortfolioTile";
import PricingCard from "@/components/ui/PricingCard";
import ImageLightbox from "@/components/ui/ImageLightbox";
import type { LogoCategory } from "@/lib/data/logoPortfolio";
import type { LogoTypePricing } from "@/lib/data/pricing";

type ResolvedLogoItem = LogoCategory["items"][number] & { resolvedSrc: string | null };

type LogoCategoryPanelProps = {
  category: LogoCategory;
  pricing: LogoTypePricing;
  /** Pre-resolved server-side (PortfolioTile is client-safe and can't touch node:fs itself). */
  items: ResolvedLogoItem[];
};

function pillClasses(active: boolean) {
  return `rounded-[var(--zaz-radius-pill)] px-3 py-1.5 text-xs font-medium transition-all duration-200 ease-[var(--zaz-ease)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
    active
      ? "bg-zaz-accent text-zaz-bg-deep shadow-[0_6px_16px_-8px_rgba(var(--zaz-accent-rgb),0.5)]"
      : "border border-zaz-border text-zaz-text-secondary hover:border-zaz-accent-dim hover:text-zaz-text"
  }`;
}

/**
 * The subtype badges under a logo category's description (2D, 3D, Animated,
 * Mascot, Illustrative) used to just be static labels — visually identical
 * to a filter, but with no onClick, so clicking them did nothing. This makes
 * them real filters against the category's own items (tagged via
 * PortfolioImageItem.subtype), same interaction pattern as the WordPress
 * portfolio sub-categories. Clicking a tile opens it in a fullscreen lightbox.
 */
export default function LogoCategoryPanel({ category, pricing, items }: LogoCategoryPanelProps) {
  const [activeSubtype, setActiveSubtype] = useState<string | "all">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const filteredItems = useMemo(
    () => (activeSubtype === "all" ? items : items.filter((item) => item.subtype === activeSubtype)),
    [items, activeSubtype]
  );

  const openItem = openIndex !== null ? filteredItems[openIndex] : null;

  return (
    <div className="grid gap-16">
      <div>
        <p className="text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
          {category.description}
        </p>

        <div role="tablist" aria-label={`${category.name} design approaches`} className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubtype === "all"}
            onClick={() => setActiveSubtype("all")}
            className={pillClasses(activeSubtype === "all")}
          >
            All {category.name}
          </button>
          {category.subtypes.map((subtype) => (
            <button
              key={subtype}
              type="button"
              role="tab"
              aria-selected={activeSubtype === subtype}
              onClick={() => setActiveSubtype(subtype)}
              className={pillClasses(activeSubtype === subtype)}
            >
              {subtype}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {filteredItems.length > 0 ? (
            <div key={activeSubtype} className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {filteredItems.map((item, index) => (
                <div key={item.id} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(index)}
                    aria-label={`View ${item.title} full size`}
                    className="zaz-tile-enter group relative aspect-[4/5] overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border transition-colors duration-500 hover:border-zaz-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
                    style={{ animationDelay: `${(index % 12) * 30}ms` }}
                  >
                    <PortfolioTile
                      src={item.image}
                      resolvedSrc={item.resolvedSrc}
                      alt={item.title}
                      label={item.title}
                      presentation="logo"
                      className="transition-transform duration-500 ease-[var(--zaz-ease)] group-hover:scale-110"
                    />
                  </button>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-zaz-text">{item.title}</span>
                    {item.subtype && <span className="shrink-0 zaz-label text-zaz-muted">{item.subtype}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--zaz-radius)] border border-dashed border-zaz-border py-16 text-center">
              <p className="font-heading text-lg font-semibold text-zaz-text">More examples coming soon.</p>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="zaz-label mb-6">Pricing — {category.name}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {pricing.packages.map((pkg) => (
            <PricingCard
              key={pkg.tier}
              name={pkg.name}
              price={pkg.price}
              priceSuffix="one-time"
              features={pkg.features}
              footnote={`Delivery: ${pkg.deliveryEstimate}`}
              highlighted={pkg.tier === 3}
              ctaHref="/contact"
              ctaLabel="Start a project"
            />
          ))}
        </div>
        <p className="mt-5 text-sm text-zaz-text-secondary">
          Vector source file (AI/EPS) available as an add-on for ${pricing.vectorFileAddOn}.
        </p>
        <p className="mt-3 text-sm text-zaz-text-secondary">
          Need something different?{" "}
          <a href="/contact" className="text-zaz-accent underline underline-offset-4 hover:text-zaz-text">
            Get a custom quote.
          </a>
        </p>
      </div>

      <ImageLightbox
        open={openItem !== null}
        onClose={() => setOpenIndex(null)}
        src={openItem?.resolvedSrc ?? null}
        alt={openItem?.title ?? ""}
        label={openItem?.title}
        placeholderSeed={openItem?.image}
      />
    </div>
  );
}
