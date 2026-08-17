"use client";

import type { Ref, RefCallback, RefObject } from "react";
import PortfolioTile from "@/components/ui/PortfolioTile";
import BrowserFrame from "@/components/ui/BrowserFrame";
import useCursorFollow from "@/lib/animation/useCursorFollow";
import useTilt from "@/lib/animation/useTilt";
import type { PortfolioFilterSlug } from "@/lib/data/portfolio";
import type { WordPressPortfolioCategorySlug } from "@/lib/data/websitePortfolio";

export type PortfolioCardItem = {
  id: string;
  title: string;
  image: string;
  filter: PortfolioFilterSlug;
  resolvedSrc: string | null;
  /** Sub-category label (e.g. "E-commerce", "Wordmark"), shown in the always-visible caption. */
  group?: string;
  /** Real, live project URL. When set, the whole tile becomes a real external link. */
  url?: string;
  /** WordPress-only: Ecommerce/Informative/Author, used by PortfolioExplorer's sub-filter. */
  subCategory?: WordPressPortfolioCategorySlug;
};

const aspectByFilter: Record<PortfolioFilterSlug, string> = {
  "logo-design": "aspect-square",
  wordpress: "aspect-[16/11]",
  custom: "aspect-[16/11]",
  "digital-marketing": "aspect-[4/3]",
};

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(node);
      else (ref as RefObject<T | null>).current = node;
    }
  };
}

type PortfolioCardProps = {
  item: PortfolioCardItem;
  delay?: number;
};

/**
 * One portfolio tile: image/placeholder + hover overlay (unchanged) plus a
 * cursor-follow "View project" pill, with presentation branched by
 * discipline — logo marks get a square crop and a subtle tilt, website work
 * gets a browser-chrome frame, marketing gets a wider campaign-creative crop.
 * An always-visible title/category caption sits below the tile — the hover
 * overlay stays as a secondary, in-image detail reveal rather than the only
 * place the title appears.
 */
export default function PortfolioCard({ item, delay = 0 }: PortfolioCardProps) {
  const isWebsite = item.filter === "wordpress" || item.filter === "custom";
  const isLogo = item.filter === "logo-design";
  const hasRealLink = Boolean(item.url);

  const tiltRef = useTilt<HTMLElement>({ max: 6, scale: 1.03 });
  const { containerRef, followerRef } = useCursorFollow<HTMLElement, HTMLDivElement>();

  const wrapperRef = isLogo ? mergeRefs(containerRef, tiltRef) : containerRef;
  const Wrapper = hasRealLink ? "a" : "div";
  const wrapperProps = hasRealLink
    ? { href: item.url, target: "_blank", rel: "noopener noreferrer", "aria-label": `View ${item.title} — opens in a new tab` }
    : {};

  const image = (
    <PortfolioTile
      src={item.image}
      resolvedSrc={item.resolvedSrc}
      alt={item.title}
      label={item.title}
      presentation={isLogo ? "logo" : "photo"}
      className="transition-transform duration-700 ease-[var(--zaz-ease)] group-hover:scale-110"
    />
  );

  return (
    <div className="flex flex-col gap-3">
      <Wrapper
        ref={wrapperRef as never}
        {...wrapperProps}
        className={`zaz-tile-enter group relative block ${aspectByFilter[item.filter]} overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border transition-colors duration-500 hover:border-zaz-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4`}
        style={{ animationDelay: `${delay}ms` }}
      >
        {isWebsite ? (
          <BrowserFrame label={item.filter === "wordpress" ? "WordPress" : "Custom Build"}>{image}</BrowserFrame>
        ) : (
          image
        )}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zaz-bg-deep/90 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-300 ease-[var(--zaz-ease)] group-hover:translate-y-0 group-hover:opacity-100"
        >
          <span className="text-sm font-medium text-zaz-text">{item.title}</span>
        </div>

        <div
          ref={followerRef}
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-10 flex items-center gap-1.5 whitespace-nowrap rounded-[var(--zaz-radius-pill)] bg-zaz-accent px-4 py-2 text-xs font-medium tracking-wide text-zaz-bg-deep opacity-0"
        >
          {hasRealLink ? "View Website" : "View project"}
          <svg aria-hidden width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 12L12 4M12 4H5M12 4V11"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </Wrapper>

      <div className="flex items-baseline justify-between gap-3">
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-zaz-text">{item.title}</span>
        {item.group && <span className="shrink-0 zaz-label text-zaz-muted">{item.group}</span>}
      </div>
    </div>
  );
}
