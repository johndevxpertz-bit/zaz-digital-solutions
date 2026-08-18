"use client";

import { useState } from "react";
import type { WebsiteBuildType, WebsiteTypeSlug } from "@/lib/data/types";

type TypeTab = { slug: WebsiteTypeSlug; name: string };

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
  const [activeType, setActiveType] = useState<WebsiteTypeSlug>(types[0]?.slug);

  return (
    <div>
      <div className="inline-flex rounded-[var(--zaz-radius-pill)] border border-zaz-border-strong p-1">
        {BUILD_TYPES.map((type) => (
          <button
            key={type.slug}
            type="button"
            onClick={() => setBuildType(type.slug)}
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
          <div role="tablist" aria-label="Website types" className="mt-8 flex flex-wrap gap-2 border-b border-zaz-border pb-5">
            {types.map((type) => (
              <button
                key={type.slug}
                type="button"
                role="tab"
                aria-selected={activeType === type.slug}
                onClick={() => setActiveType(type.slug)}
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

          <div key={`wordpress__${activeType}`} className="zaz-tile-enter mt-10">
            {panels[`wordpress__${activeType}`]}
          </div>
        </>
      ) : (
        <div key="custom" className="zaz-tile-enter mt-10">
          {customPanel}
        </div>
      )}
    </div>
  );
}
