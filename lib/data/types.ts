export type LogoCategorySlug =
  | "wordmark"
  | "lettermark"
  | "pictorial-mark"
  | "abstract-mark"
  | "mascot-logo"
  | "combination-mark"
  | "emblem";

export type WebsiteBuildType = "wordpress" | "custom";

export type WebsiteTypeSlug =
  | "ecommerce"
  | "business"
  | "portfolio"
  | "educational"
  | "landing-page"
  | "personal"
  | "directory-listing";

export type MarketingServiceSlug = "seo" | "ppc" | "social-media" | "meta-ads";

export type PortfolioImageItem = {
  id: string;
  title: string;
  /** Path relative to /public, resolved via lib/media.ts. */
  image: string;
  /** Real, live project URL — only set for actual completed work. Omitted → card shows no external link. */
  url?: string;
  /** Logo items only: which design approach this piece demonstrates (e.g. "2D Logo Design"). */
  subtype?: string;
};
