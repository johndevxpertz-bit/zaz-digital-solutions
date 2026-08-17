"use client";

import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import PortfolioCard, { type PortfolioCardItem } from "@/components/ui/PortfolioCard";
import MarketingCaseStudyCard from "@/components/sections/MarketingCaseStudyCard";
import type { PortfolioFilterSlug } from "@/lib/data/portfolio";
import {
  wordpressPortfolioCategories,
  customPortfolioItems,
  type WordPressPortfolioCategorySlug,
} from "@/lib/data/websitePortfolio";
import type { MarketingServiceEntry } from "@/lib/data/marketingPortfolio";

const BATCH_SIZE = 12;

export type PortfolioExplorerItem = PortfolioCardItem;

type PortfolioExplorerProps = {
  items: PortfolioExplorerItem[];
  filters: { slug: PortfolioFilterSlug; label: string }[];
  /** Digital Marketing renders as case-study cards, not an image grid — pass the source data to enable that filter. */
  marketingCaseStudies?: MarketingServiceEntry[];
};

function pillClasses(active: boolean) {
  return `rounded-[var(--zaz-radius-pill)] px-4 py-2 text-sm font-medium transition-all duration-200 ease-[var(--zaz-ease)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 ${
    active
      ? "bg-zaz-accent text-zaz-bg-deep shadow-[0_8px_20px_-10px_rgba(216,211,200,0.5)]"
      : "border border-zaz-border-strong text-zaz-text-secondary hover:border-zaz-accent-dim hover:text-zaz-text"
  }`;
}

/**
 * Filterable, paginated portfolio grid. Renders only the currently visible
 * batch into the DOM (never all ~150 items at once) — "Load more" reveals
 * additional pre-resolved items client-side. Image resolution itself still
 * only ever happens server-side (see app/portfolio/page.tsx); this component
 * only slices and displays data it's handed.
 */
export default function PortfolioExplorer({ items, filters, marketingCaseStudies }: PortfolioExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | PortfolioFilterSlug>("all");
  const [activeSubCategory, setActiveSubCategory] = useState<"all" | WordPressPortfolioCategorySlug>("all");
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);

  const byTopFilter = useMemo(
    () => (activeFilter === "all" ? items : items.filter((item) => item.filter === activeFilter)),
    [items, activeFilter]
  );

  const filtered = useMemo(() => {
    // WordPress and Custom Websites show real, supplied projects only — no
    // placeholder cards padding out the grid (wordpressPortfolioCategories /
    // customPortfolioItems already dropped everything but real projects; this
    // flat list is a separately-filtered view of the same underlying data, so
    // it needs the same filter+order applied here rather than falling back to
    // the raw per-type item list, which still includes placeholders).
    if (activeFilter === "wordpress") {
      const order =
        activeSubCategory === "all"
          ? wordpressPortfolioCategories.flatMap((category) => category.items)
          : wordpressPortfolioCategories.find((c) => c.slug === activeSubCategory)?.items ?? [];
      const orderIndex = new Map(order.map((item, index) => [item.id, index]));
      return byTopFilter
        .filter((item) => orderIndex.has(item.id))
        .sort((a, b) => orderIndex.get(a.id)! - orderIndex.get(b.id)!);
    }

    if (activeFilter === "custom") {
      const orderIndex = new Map(customPortfolioItems.map((item, index) => [item.id, index]));
      return byTopFilter
        .filter((item) => orderIndex.has(item.id))
        .sort((a, b) => orderIndex.get(a.id)! - orderIndex.get(b.id)!);
    }

    return byTopFilter;
  }, [byTopFilter, activeFilter, activeSubCategory]);

  const visible = filtered.slice(0, visibleCount);
  const remaining = filtered.length - visible.length;

  function selectFilter(slug: "all" | PortfolioFilterSlug) {
    setActiveFilter(slug);
    setActiveSubCategory("all");
    setVisibleCount(BATCH_SIZE);
  }

  function selectSubCategory(slug: "all" | WordPressPortfolioCategorySlug) {
    setActiveSubCategory(slug);
    setVisibleCount(BATCH_SIZE);
  }

  return (
    <div>
      <div role="tablist" aria-label="Portfolio filters" className="flex flex-wrap gap-2 border-b border-zaz-border pb-5">
        <button
          type="button"
          role="tab"
          aria-selected={activeFilter === "all"}
          onClick={() => selectFilter("all")}
          className={pillClasses(activeFilter === "all")}
        >
          All Work
        </button>
        {filters.map((filter) => (
          <button
            key={filter.slug}
            type="button"
            role="tab"
            aria-selected={activeFilter === filter.slug}
            onClick={() => selectFilter(filter.slug)}
            className={pillClasses(activeFilter === filter.slug)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {activeFilter === "wordpress" && (
        <div role="tablist" aria-label="WordPress portfolio categories" className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            role="tab"
            aria-selected={activeSubCategory === "all"}
            onClick={() => selectSubCategory("all")}
            className={pillClasses(activeSubCategory === "all")}
          >
            All WordPress
          </button>
          {wordpressPortfolioCategories.map((category) => (
            <button
              key={category.slug}
              type="button"
              role="tab"
              aria-selected={activeSubCategory === category.slug}
              onClick={() => selectSubCategory(category.slug)}
              className={pillClasses(activeSubCategory === category.slug)}
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {activeFilter === "digital-marketing" && marketingCaseStudies ? (
        <div className="mt-6 flex flex-col gap-6">
          {marketingCaseStudies.map((service) => (
            <MarketingCaseStudyCard key={service.slug} name={service.name} caseStudy={service.caseStudy} />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <>
          <p className="mt-6 text-sm text-zaz-text-secondary">
            Showing {visible.length} of {filtered.length}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {visible.map((item, index) => (
              <PortfolioCard key={item.id} item={item} delay={(index % BATCH_SIZE) * 30} />
            ))}
          </div>

          {remaining > 0 && (
            <div className="mt-10 flex justify-center">
              <Button variant="secondary" onClick={() => setVisibleCount((count) => count + BATCH_SIZE)}>
                Load more ({remaining} remaining)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center gap-2 rounded-[var(--zaz-radius)] border border-dashed border-zaz-border py-24 text-center">
          <p className="font-heading text-lg font-semibold text-zaz-text">More projects coming soon.</p>
          <p className="max-w-sm text-sm text-zaz-text-secondary">
            This category is being built out — check back soon to see the work here.
          </p>
        </div>
      )}
    </div>
  );
}
