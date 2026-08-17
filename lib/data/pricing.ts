import { logoCategories } from "@/lib/data/logoPortfolio";
import type {
  MarketingServiceSlug,
  WebsiteBuildType,
  WebsiteTypeSlug,
} from "@/lib/data/types";

/**
 * Reference/placeholder pricing. Base website rates are the client-supplied
 * per-page figures; everything downstream (tier page counts, feature lists,
 * logo/marketing prices) is a sensible US-market placeholder meant to be
 * refined later — all editable from this one file.
 */

// ---------------------------------------------------------------------------
// Website Design
// ---------------------------------------------------------------------------

export type WebsitePackage = {
  tier: number;
  name: string;
  pages: number;
  price: number;
  revisions: string;
  responsive: true;
  seoLevel: string;
  forms: true;
  cms: boolean;
  integrations: string[];
  deliveryEstimate: string;
  features: string[];
};

export type WebsiteTypePricing = {
  slug: WebsiteTypeSlug;
  name: string;
  baseRatePerPage: number;
  packages: WebsitePackage[];
};

export type WebsitePricingGroup = {
  buildType: WebsiteBuildType;
  name: string;
  types: WebsiteTypePricing[];
};

const TIER_NAMES = ["Starter", "Essential", "Growth", "Professional", "Advanced", "Elite"];

const TIER_REVISIONS = [
  "1 round",
  "2 rounds",
  "3 rounds",
  "4 rounds",
  "Unlimited (within scope)",
  "Unlimited (within scope)",
];

const TIER_SEO = [
  "Basic on-page SEO",
  "Standard on-page SEO",
  "Standard on-page SEO + analytics setup",
  "Advanced on-page SEO",
  "Advanced on-page SEO + performance audit",
  "Advanced on-page SEO + performance audit",
];

const TIER_DELIVERY = [
  "1-2 weeks",
  "2-3 weeks",
  "3-4 weeks",
  "4-6 weeks",
  "6-8 weeks",
  "8-10 weeks",
];

const TIER_INTEGRATIONS: string[][] = [
  [],
  [],
  ["Google Analytics"],
  ["Google Analytics", "Email marketing"],
  ["Google Analytics", "Email marketing", "CRM"],
  ["Google Analytics", "Email marketing", "CRM", "Priority integrations of your choice"],
];

function roundToNearest50(value: number): number {
  return Math.round(value / 50) * 50;
}

type WebsiteTypeConfig = {
  slug: WebsiteTypeSlug;
  name: string;
  pageCounts: [number, number, number, number, number, number];
  /** Extra type-specific bullets appended per tier, index 0 = Starter .. 5 = Elite. */
  featureAddons: [string[], string[], string[], string[], string[], string[]];
};

const WEBSITE_TYPE_CONFIGS: WebsiteTypeConfig[] = [
  {
    slug: "ecommerce",
    name: "E-commerce",
    pageCounts: [5, 10, 18, 30, 45, 65],
    featureAddons: [
      ["Product catalog setup (up to 20 products)"],
      ["Product catalog setup (up to 50 products)", "Shopping cart"],
      ["Payment gateway integration (Stripe/PayPal)", "Product catalog setup (up to 100 products)"],
      ["Discount codes & coupon support", "Inventory tracking"],
      ["Customer accounts & order history", "Abandoned cart recovery"],
      ["Multi-currency support", "Advanced checkout customization"],
    ],
  },
  {
    slug: "business",
    name: "Business",
    pageCounts: [3, 5, 8, 12, 18, 25],
    featureAddons: [
      [],
      ["Service pages"],
      ["Location/service-area pages", "Google Business Profile setup"],
      ["Lead capture automation"],
      ["CRM integration"],
      ["Multi-location support"],
    ],
  },
  {
    slug: "portfolio",
    name: "Portfolio",
    pageCounts: [4, 6, 10, 15, 20, 28],
    featureAddons: [
      [],
      ["Case study / project detail pages"],
      ["Testimonial / press section"],
      ["Video & motion embeds"],
      ["Client login / private galleries"],
      ["Custom project filtering & search"],
    ],
  },
  {
    slug: "educational",
    name: "Educational",
    pageCounts: [5, 8, 12, 18, 26, 36],
    featureAddons: [
      ["Course/lesson listing pages"],
      ["Instructor profile pages"],
      ["Student enrollment forms"],
      ["Progress tracking / LMS integration"],
      ["Online payment for course enrollment"],
      ["Multi-course cohort scheduling"],
    ],
  },
  {
    slug: "landing-page",
    name: "Landing Page",
    pageCounts: [1, 2, 3, 5, 8, 12],
    featureAddons: [
      [],
      ["A/B test-ready variant"],
      ["Lead magnet / gated content form"],
      ["Ad campaign tracking pixels"],
      ["Multi-step funnel pages"],
      ["Dynamic personalization by traffic source"],
    ],
  },
  {
    slug: "personal",
    name: "Personal Website",
    pageCounts: [1, 3, 5, 8, 12, 18],
    featureAddons: [
      [],
      ["Blog / journal section"],
      ["Social feed integration"],
      ["Newsletter signup automation"],
      ["Resume/portfolio download tracking"],
      ["Custom domain email setup guidance"],
    ],
  },
  {
    slug: "directory-listing",
    name: "Directory & Listing",
    pageCounts: [6, 12, 20, 32, 48, 70],
    featureAddons: [
      ["Basic category browsing"],
      ["Search & filter functionality"],
      ["Listing submission form"],
      ["Map integration"],
      ["Paid listing / membership tiers"],
      ["Advanced analytics dashboard for listers"],
    ],
  },
];

const WORDPRESS_RATES: Record<WebsiteTypeSlug, number> = {
  ecommerce: 350,
  business: 400,
  portfolio: 300,
  educational: 400,
  "landing-page": 200,
  personal: 400,
  "directory-listing": 400,
};

const CUSTOM_RATES: Record<WebsiteTypeSlug, number> = {
  ecommerce: 400,
  business: 450,
  portfolio: 500,
  educational: 400,
  "landing-page": 450,
  personal: 400,
  "directory-listing": 700,
};

function buildWebsiteType(baseRate: number, config: WebsiteTypeConfig): WebsiteTypePricing {
  const packages: WebsitePackage[] = config.pageCounts.map((pages, index) => {
    const baseFeatures = [
      `Up to ${pages} page${pages > 1 ? "s" : ""}`,
      "Fully responsive design (mobile, tablet, desktop)",
      TIER_SEO[index],
      "Contact form integration",
      index >= 2 ? "CMS-editable content" : "Content updates via development request",
    ];

    return {
      tier: index + 1,
      name: TIER_NAMES[index],
      pages,
      price: roundToNearest50(pages * baseRate),
      revisions: TIER_REVISIONS[index],
      responsive: true,
      seoLevel: TIER_SEO[index],
      forms: true,
      cms: index >= 2,
      integrations: TIER_INTEGRATIONS[index],
      deliveryEstimate: TIER_DELIVERY[index],
      features: [...baseFeatures, ...config.featureAddons[index]],
    };
  });

  return {
    slug: config.slug,
    name: config.name,
    baseRatePerPage: baseRate,
    packages,
  };
}

export const websitePricing: WebsitePricingGroup[] = [
  {
    buildType: "wordpress",
    name: "WordPress",
    types: WEBSITE_TYPE_CONFIGS.map((config) =>
      buildWebsiteType(WORDPRESS_RATES[config.slug], config)
    ),
  },
  {
    buildType: "custom",
    name: "Custom Website",
    types: WEBSITE_TYPE_CONFIGS.map((config) =>
      buildWebsiteType(CUSTOM_RATES[config.slug], config)
    ),
  },
];

// ---------------------------------------------------------------------------
// Logo Design
// ---------------------------------------------------------------------------

export type LogoPackage = {
  tier: number;
  name: string;
  price: number;
  concepts: number;
  revisions: string;
  fileFormats: string[];
  brandGuide: boolean;
  deliveryEstimate: string;
  features: string[];
};

export type LogoTypePricing = {
  slug: (typeof logoCategories)[number]["slug"];
  name: string;
  packages: LogoPackage[];
  /** Vector source file (e.g. AI/EPS) is an optional add-on, per spec. */
  vectorFileAddOn: number;
};

const LOGO_TIER_NAMES = ["Basic", "Standard", "Premium"];
const LOGO_TIER_PRICES = [249, 549, 999];
const LOGO_TIER_CONCEPTS = [1, 2, 3];
const LOGO_TIER_REVISIONS = ["2 rounds", "4 rounds", "Unlimited (within scope)"];
const LOGO_TIER_FORMATS = [
  ["PNG", "JPG"],
  ["PNG", "JPG", "PDF"],
  ["PNG", "JPG", "PDF", "SVG"],
];
const LOGO_TIER_DELIVERY = ["3-5 business days", "5-7 business days", "7-10 business days"];

function buildLogoPackages(): LogoPackage[] {
  return LOGO_TIER_NAMES.map((name, index) => ({
    tier: index + 1,
    name,
    price: LOGO_TIER_PRICES[index],
    concepts: LOGO_TIER_CONCEPTS[index],
    revisions: LOGO_TIER_REVISIONS[index],
    fileFormats: LOGO_TIER_FORMATS[index],
    brandGuide: index === 2,
    deliveryEstimate: LOGO_TIER_DELIVERY[index],
    features: [
      `${LOGO_TIER_CONCEPTS[index]} initial concept${LOGO_TIER_CONCEPTS[index] > 1 ? "s" : ""}`,
      `${LOGO_TIER_REVISIONS[index]} of revisions`,
      `Final files in ${LOGO_TIER_FORMATS[index].join(", ")}`,
      index === 2 ? "Mini brand guide (colors, type, usage)" : "Source file available on request",
    ],
  }));
}

export const logoPricing: LogoTypePricing[] = logoCategories.map((category) => ({
  slug: category.slug,
  name: category.name,
  packages: buildLogoPackages(),
  vectorFileAddOn: 75,
}));

// ---------------------------------------------------------------------------
// Digital Marketing
// ---------------------------------------------------------------------------

export type MarketingPackage = {
  tier: number;
  name: string;
  price: number;
  billingCycle: "monthly" | "one-time";
  features: string[];
};

export type MarketingServicePricing = {
  slug: MarketingServiceSlug;
  name: string;
  packages: MarketingPackage[];
};

const MARKETING_TIER_NAMES = ["Starter", "Growth"];

type MarketingConfig = {
  slug: MarketingServiceSlug;
  name: string;
  billingCycle: "monthly" | "one-time";
  prices: [number, number];
  features: [string[], string[]];
};

const MARKETING_CONFIGS: MarketingConfig[] = [
  {
    slug: "seo",
    name: "SEO",
    billingCycle: "monthly",
    prices: [600, 1200],
    features: [
      ["Keyword research & on-page optimization", "Technical SEO audit", "Monthly performance report"],
      [
        "Everything in Starter",
        "Content strategy & optimization",
        "Link-building outreach",
        "Local SEO / Google Business optimization",
      ],
    ],
  },
  {
    slug: "ppc",
    name: "PPC",
    billingCycle: "monthly",
    prices: [500, 1000],
    features: [
      ["Campaign setup & keyword targeting", "Ad copywriting", "Monthly performance report"],
      ["Everything in Starter", "A/B ad testing", "Landing page conversion review", "Bid strategy optimization"],
    ],
  },
  {
    slug: "social-media",
    name: "Social Media Marketing",
    billingCycle: "monthly",
    prices: [450, 900],
    features: [
      ["Content calendar (2 platforms)", "Post design & copywriting", "Monthly performance report"],
      [
        "Everything in Starter",
        "Content calendar (4 platforms)",
        "Community management",
        "Influencer/partnership outreach",
      ],
    ],
  },
  {
    slug: "meta-ads",
    name: "Meta Ads",
    billingCycle: "monthly",
    prices: [500, 1000],
    features: [
      ["Campaign setup & audience targeting", "Ad creative & copywriting", "Monthly performance report"],
      ["Everything in Starter", "A/B creative testing", "Retargeting campaigns", "Conversion tracking setup"],
    ],
  },
];

export const marketingPricing: MarketingServicePricing[] = MARKETING_CONFIGS.map((config) => ({
  slug: config.slug,
  name: config.name,
  packages: MARKETING_TIER_NAMES.map((name, index) => ({
    tier: index + 1,
    name,
    price: config.prices[index],
    billingCycle: config.billingCycle,
    features: config.features[index],
  })),
}));

// ---------------------------------------------------------------------------
// Cross-service summaries (used by the homepage pricing preview and /pricing)
// ---------------------------------------------------------------------------

export const logoStartingAt = Math.min(
  ...logoPricing.flatMap((type) => type.packages.map((pkg) => pkg.price))
);

export const websiteStartingAt = Math.min(
  ...websitePricing.flatMap((group) => group.types.flatMap((type) => type.packages.map((pkg) => pkg.price)))
);

export const marketingStartingAt = Math.min(
  ...marketingPricing.flatMap((service) => service.packages.map((pkg) => pkg.price))
);
