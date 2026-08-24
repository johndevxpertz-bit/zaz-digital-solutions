"use client";

import { useRef, useState } from "react";
import type { WebsiteBuildType } from "@/lib/data/types";
import { scrollToElement } from "@/lib/animation/lenisController";

/** Slug is a plain string, not WebsiteTypeSlug — the WordPress tabs here are
 *  presentation categories (All WordPress / Ecommerce / Informative / Author),
 *  not a 1:1 mirror of the 7 underlying pricing site types. */
type TypeTab = { slug: string; name: string };

type WebsiteTypeExplorerProps = {
  types: TypeTab[];
  /** Pre-rendered (server-side) panel content keyed by `${buildType}__${typeSlug}`, for WordPress. */
  panels: Record<string, React.ReactNode>;
  /** Custom Website has no per-type tabs — a single pre-rendered panel shown as-is when that build type is active. */
  customPanel: React.ReactNode;
};

const BUILD_TYPES: { slug: WebsiteBuildType; label: string }[] = [
  { slug: "wordpress", label: "WordPress" },
  { slug: "custom", label: "Custom Website" },
];

export default function WebsiteTypeExplorer({ types, panels, customPanel }: WebsiteTypeExplorerProps) {
  const [buildType, setBuildType] = useState<WebsiteBuildType>("wordpress");
  const [activeType, setActiveType] = useState<string>(types[0]?.slug);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Bring the tab row (and the panel right below it) to the top of the
  // viewport on every tab click. Without this, switching to a shorter panel
  // while scrolled deep into a taller one (e.g. from "All WordPress" down in
  // its pricing section, over to "Author") leaves the new content entirely
  // above the visible viewport — "stuck" until the visitor scrolls back up
  // on their own. -100 offset clears the fixed h-24 navbar plus breathing room.
  function scrollToTabs() {
    if (tabsRef.current) scrollToElement(tabsRef.current, -100);
  }

  return (
    <div>
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <p className="text-sm text-zaz-text-secondary">
          <span className="font-medium text-zaz-text">Need a standard business website?</span> WordPress
          is the fastest, most affordable way to get a professional site live — built on an
          industry-standard CMS you can update yourself.
        </p>
        <p className="text-sm text-zaz-text-secondary">
          <span className="font-medium text-zaz-text">Need a fully custom website?</span> Custom-Coded
          means no page builder, no theme — built line-by-line for unique interactions and complete
          control.
        </p>
      </div>

      <div className="inline-flex rounded-[var(--zaz-radius-pill)] border border-zaz-border-strong p-1">
        {BUILD_TYPES.map((type) => (
          <button
            key={type.slug}
            type="button"
            onClick={() => {
              setBuildType(type.slug);
              scrollToTabs();
            }}
            className={`rounded-[var(--zaz-radius-pill)] px-5 py-2 text-sm font-medium transition-all duration-200 ease-[var(--zaz-ease)] active:scale-95 ${
              buildType === type.slug
                ? "bg-zaz-accent text-zaz-bg-deep shadow-[0_8px_20px_-10px_rgba(216,211,200,0.5)]"
                : "text-zaz-text-secondary hover:text-zaz-text"
            }`}
          >
            {type.label}
          </button>
        ))}
      </div>

      {buildType === "wordpress" ? (
        <>
          <div
            ref={tabsRef}
            role="tablist"
            aria-label="Website types"
            className="mt-8 flex flex-wrap gap-2 border-b border-zaz-border pb-5"
          >
            {types.map((type) => (
              <button
                key={type.slug}
                type="button"
                role="tab"
                aria-selected={activeType === type.slug}
                onClick={() => {
                  setActiveType(type.slug);
                  scrollToTabs();
                }}
                className={`rounded-[var(--zaz-radius-pill)] px-4 py-2 text-sm font-medium transition-all duration-200 ease-[var(--zaz-ease)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
                  activeType === type.slug
                    ? "bg-zaz-accent text-zaz-bg-deep shadow-[0_8px_20px_-10px_rgba(216,211,200,0.5)]"
                    : "border border-zaz-border-strong text-zaz-text-secondary hover:border-zaz-accent-dim hover:text-zaz-text"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          <div key={`wordpress__${activeType}`} className="zaz-tile-enter mt-6">
            {panels[`wordpress__${activeType}`]}
          </div>
        </>
      ) : (
        <div ref={tabsRef} key="custom" className="zaz-tile-enter mt-6">
          {customPanel}
        </div>
      )}
    </div>
  );
}
