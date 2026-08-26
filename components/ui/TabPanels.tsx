"use client";

import { useState } from "react";

type Tab = { slug: string; label: string };

type TabPanelsProps = {
  tabs: Tab[];
  /** Pre-rendered (server-side) panel content keyed by tab slug. */
  panels: Record<string, React.ReactNode>;
  defaultSlug?: string;
};

/**
 * Presentational tab switcher. Panels are rendered server-side by the parent
 * and passed in as pre-built React nodes — this component only tracks which
 * one is active, so nothing that needs Node APIs (e.g. MediaSlot) ever ends
 * up in the client bundle.
 */
export default function TabPanels({ tabs, panels, defaultSlug }: TabPanelsProps) {
  const [active, setActive] = useState(defaultSlug ?? tabs[0]?.slug);

  return (
    <div>
      <div role="tablist" aria-label="Categories" className="flex flex-wrap gap-2 border-b border-zaz-border pb-5">
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            aria-selected={active === tab.slug}
            onClick={() => setActive(tab.slug)}
            className={`rounded-[var(--zaz-radius-pill)] px-4 py-2 text-sm font-medium transition-all duration-200 ease-[var(--zaz-ease)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
              active === tab.slug
                ? "bg-zaz-accent text-zaz-bg-deep shadow-[0_8px_20px_-10px_rgba(var(--zaz-accent-rgb),0.5)]"
                : "border border-zaz-border-strong text-zaz-text-secondary hover:border-zaz-accent-dim hover:text-zaz-text"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div key={active} className="zaz-tile-enter mt-10">
        {panels[active]}
      </div>
    </div>
  );
}
