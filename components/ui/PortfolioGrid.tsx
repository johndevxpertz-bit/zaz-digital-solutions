import MediaSlot from "@/components/ui/MediaSlot";

type PortfolioGridItem = {
  id: string;
  title: string;
  image: string;
  /** Sub-category label (e.g. "E-commerce"), shown only when showCaption is set. */
  category?: string;
  /** Real, live project URL. When set, the tile becomes a real external link. */
  url?: string;
};

type PortfolioGridProps = {
  items: PortfolioGridItem[];
  aspect?: string;
  columns?: string;
  gap?: string;
  /** Always-visible title/category caption below each tile, in addition to the existing hover overlay. */
  showCaption?: boolean;
  /** "logo" centers a single-letterform badge instead of the corner caption — applies to every tile in this grid, since callers always render one discipline at a time. */
  presentation?: "photo" | "logo";
};

export default function PortfolioGrid({
  items,
  aspect = "aspect-[4/5]",
  columns = "grid-cols-2 md:grid-cols-3",
  gap = "gap-4",
  showCaption = false,
  presentation = "photo",
}: PortfolioGridProps) {
  return (
    <div className={`grid ${gap} ${columns}`}>
      {items.map((item, index) => {
        const Wrapper = item.url ? "a" : "div";
        const wrapperProps = item.url
          ? {
              href: item.url,
              target: "_blank",
              rel: "noopener noreferrer",
              "aria-label": `View ${item.title} — opens in a new tab`,
            }
          : {};
        return (
          <div key={item.id} className="flex flex-col gap-3">
            <Wrapper
              {...wrapperProps}
              className={`zaz-tile-enter group relative block overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border transition-colors duration-500 hover:border-zaz-accent-dim focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 ${aspect}`}
              style={{ animationDelay: `${(index % 12) * 30}ms` }}
            >
              <MediaSlot
                src={item.image}
                alt={item.title}
                label={item.title}
                presentation={presentation}
                className="transition-transform duration-500 ease-[var(--zaz-ease)] group-hover:scale-110"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-zaz-bg-deep/90 to-transparent px-4 pb-4 pt-10 opacity-0 transition-all duration-300 ease-[var(--zaz-ease)] group-hover:translate-y-0 group-hover:opacity-100"
              >
                <span className="text-sm font-medium text-zaz-text">
                  {item.url ? "View Website ↗" : item.title}
                </span>
              </div>
            </Wrapper>
            {showCaption && (
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zaz-text">{item.title}</span>
                {item.category && <span className="shrink-0 zaz-label text-zaz-muted">{item.category}</span>}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
