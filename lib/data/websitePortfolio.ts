import type {
  PortfolioImageItem,
  WebsiteBuildType,
  WebsiteTypeSlug,
} from "@/lib/data/types";

export type WebsiteTypeEntry = {
  slug: WebsiteTypeSlug;
  name: string;
  description: string;
  items: PortfolioImageItem[];
};

export type WebsitePortfolioGroup = {
  buildType: WebsiteBuildType;
  name: string;
  types: WebsiteTypeEntry[];
};

const WEBSITE_TYPE_NAMES: Record<WebsiteTypeSlug, string> = {
  ecommerce: "E-commerce",
  business: "Business",
  portfolio: "Portfolio",
  educational: "Educational",
  "landing-page": "Landing Page",
  personal: "Personal Website",
  "directory-listing": "Directory & Listing",
};

const WEBSITE_TYPE_DESCRIPTIONS: Record<WebsiteTypeSlug, string> = {
  ecommerce: "Product catalogs, checkout, and everything needed to sell online.",
  business: "A professional home base for services businesses — clear offerings, easy contact.",
  portfolio: "Project-led sites built to showcase creative or professional work.",
  educational: "Course, cohort, and institution sites built around clear learning paths.",
  "landing-page": "Focused, single-purpose pages built to convert a specific campaign.",
  personal: "Personal brand and resume-style sites for individuals.",
  "directory-listing": "Searchable listings with submission, filtering, and browsing built in.",
};

const WEBSITE_TYPE_SLUGS: WebsiteTypeSlug[] = [
  "ecommerce",
  "business",
  "portfolio",
  "educational",
  "landing-page",
  "personal",
  "directory-listing",
];

/**
 * Real, live projects. To swap any placeholder slot for a real one, add an
 * entry here keyed by the item id it replaces (visible in the grid as
 * "{buildType}-{typeSlug}-{number}", e.g. "wordpress-ecommerce-01") — the
 * title and url populate automatically and the image is picked up
 * automatically once a file exists at the standard path documented in
 * public/ASSET-MANIFEST.md (portfolio/websites/{buildType}/{typeSlug}-{number}.jpg).
 * No other file needs to change. Leave a slot out of this map and it stays
 * a placeholder until you add it.
 */
const WEBSITE_OVERRIDES: Record<string, { title: string; url: string }> = {
  "wordpress-personal-01": {
    title: "Heart of a Single Mother",
    url: "https://heartofasinglemother.com",
  },
  "wordpress-business-01": {
    title: "Into The Bubbles",
    url: "https://intothebubblesllc.com",
  },
  "wordpress-ecommerce-01": {
    title: "Livin' It Up Fishing Caps",
    url: "https://livinitupfishingcaps.com",
  },
  "wordpress-ecommerce-02": {
    title: "Ginou Creations",
    url: "https://ginoucreations.store",
  },
  "custom-business-01": {
    title: "Curious Truffle",
    url: "https://curious-truffle-2486d9.netlify.app",
  },
  "custom-ecommerce-01": {
    title: "Najah's Naturals",
    url: "https://najahs-naturals-demo.netlify.app",
  },
  "custom-portfolio-01": {
    title: "Comforting Croissant",
    url: "https://comforting-croissant-f31ad1.netlify.app",
  },
};

function buildWebsiteItems(
  buildType: WebsiteBuildType,
  typeSlug: WebsiteTypeSlug,
  typeName: string
): PortfolioImageItem[] {
  return Array.from({ length: 6 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const id = `${buildType}-${typeSlug}-${number}`;
    const override = WEBSITE_OVERRIDES[id];
    return {
      id,
      title: override?.title ?? `${typeName} ${number}`,
      image: `portfolio/websites/${buildType}/${typeSlug}-${number}.jpg`,
      url: override?.url,
    };
  });
}

function buildWebsiteGroup(
  buildType: WebsiteBuildType,
  name: string
): WebsitePortfolioGroup {
  return {
    buildType,
    name,
    types: WEBSITE_TYPE_SLUGS.map((slug) => ({
      slug,
      name: WEBSITE_TYPE_NAMES[slug],
      description: WEBSITE_TYPE_DESCRIPTIONS[slug],
      items: buildWebsiteItems(buildType, slug, WEBSITE_TYPE_NAMES[slug]),
    })),
  };
}

export const websitePortfolio: WebsitePortfolioGroup[] = [
  buildWebsiteGroup("wordpress", "WordPress"),
  buildWebsiteGroup("custom", "Custom Website"),
];

// ---------------------------------------------------------------------------
// WordPress portfolio categories (presentation only — pricing stays
// organized by the 7 detailed site types above, untouched). WordPress work
// is shown to visitors under 3 broader categories instead: Ecommerce,
// Informative, Author. Derived from the existing type data via a fixed
// mapping — no separate/duplicate portfolio data, no per-item tagging.
// ---------------------------------------------------------------------------

export type WordPressPortfolioCategorySlug = "ecommerce" | "informative" | "author";

export type WordPressPortfolioCategory = {
  slug: WordPressPortfolioCategorySlug;
  name: string;
  items: PortfolioImageItem[];
};

const WORDPRESS_CATEGORY_TYPE_MAP: Record<WordPressPortfolioCategorySlug, WebsiteTypeSlug[]> = {
  ecommerce: ["ecommerce", "business"],
  informative: ["portfolio", "educational", "landing-page", "personal", "directory-listing"],
  author: [],
};

const WORDPRESS_CATEGORY_NAMES: Record<WordPressPortfolioCategorySlug, string> = {
  ecommerce: "Ecommerce",
  informative: "Informative",
  author: "Author",
};

/** Which WordPress portfolio category a given detailed site type falls under, for tagging flattened portfolio items. */
export function getWordPressPortfolioCategory(typeSlug: WebsiteTypeSlug): WordPressPortfolioCategorySlug {
  for (const [category, types] of Object.entries(WORDPRESS_CATEGORY_TYPE_MAP) as [
    WordPressPortfolioCategorySlug,
    WebsiteTypeSlug[],
  ][]) {
    if (types.includes(typeSlug)) return category;
  }
  return "informative";
}

/**
 * Explicit display order for real, supplied projects within a category.
 * The website portfolio only ever shows real client work here — unlike the
 * logo/marketing portfolios, placeholder slots are never displayed (no
 * "coming soon" cards standing in for a site that doesn't exist), so any
 * item id not listed here is dropped, not just pushed to the end.
 */
const CATEGORY_FEATURED_ORDER: Record<WordPressPortfolioCategorySlug, string[]> = {
  ecommerce: ["wordpress-business-01", "wordpress-ecommerce-01", "wordpress-ecommerce-02"],
  informative: ["wordpress-personal-01"],
  author: [],
};

/** Filters a list down to only the ids in `order`, in that exact sequence — drops everything else (see CATEGORY_FEATURED_ORDER above for why). */
function onlyFeatured(items: PortfolioImageItem[], order: string[]): PortfolioImageItem[] {
  const byId = new Map(items.map((item) => [item.id, item]));
  return order.map((id) => byId.get(id)).filter((item): item is PortfolioImageItem => Boolean(item));
}

export const wordpressPortfolioCategories: WordPressPortfolioCategory[] = (
  ["ecommerce", "informative", "author"] as WordPressPortfolioCategorySlug[]
).map((slug) => {
  const wordpressGroup = websitePortfolio.find((group) => group.buildType === "wordpress")!;
  const typeSlugs = WORDPRESS_CATEGORY_TYPE_MAP[slug];
  const items = wordpressGroup.types.filter((type) => typeSlugs.includes(type.slug)).flatMap((type) => type.items);
  return {
    slug,
    name: WORDPRESS_CATEGORY_NAMES[slug],
    items: onlyFeatured(items, CATEGORY_FEATURED_ORDER[slug]),
  };
});

/**
 * Custom Website build: same "real projects only, exact order, no
 * placeholder padding" rule as the WordPress categories above, flattened
 * across the 7 underlying site types (which exist for pricing purposes —
 * see WebsiteTypeExplorer — not for portfolio display).
 */
const CUSTOM_FEATURED_ORDER = ["custom-business-01", "custom-ecommerce-01", "custom-portfolio-01"];

export const customPortfolioItems: PortfolioImageItem[] = onlyFeatured(
  websitePortfolio.find((group) => group.buildType === "custom")!.types.flatMap((type) => type.items),
  CUSTOM_FEATURED_ORDER
);
