import type { MarketingServiceSlug, PortfolioImageItem } from "@/lib/data/types";

export type MarketingCaseStudy = {
  objective: string;
  approach: string[];
  focusAreas: string[];
};

export type MarketingServiceEntry = {
  slug: MarketingServiceSlug;
  name: string;
  description: string;
  items: PortfolioImageItem[];
  caseStudy: MarketingCaseStudy;
};

const MARKETING_SERVICE_NAMES: Record<MarketingServiceSlug, string> = {
  seo: "SEO",
  ppc: "Google Ads",
  "social-media": "Social Media Marketing",
  "meta-ads": "Meta Ads",
};

const MARKETING_SERVICE_DESCRIPTIONS: Record<MarketingServiceSlug, string> = {
  seo: "Technical and content-led SEO built to grow qualified organic traffic.",
  ppc: "Search ad campaigns built around keyword intent and conversion tracking.",
  "social-media": "Consistent, on-brand content and community management across platforms.",
  "meta-ads": "Facebook and Instagram ad campaigns built around audience targeting and retargeting.",
};

/**
 * Process-based case-study content — not client-specific results. No
 * numbers/statistics are invented here; this describes how an engagement is
 * actually run and what gets tracked, which is honest regardless of which
 * client it's applied to.
 */
const MARKETING_CASE_STUDIES: Record<MarketingServiceSlug, MarketingCaseStudy> = {
  seo: {
    objective: "Grow qualified organic traffic without relying on paid placement.",
    approach: [
      "Technical audit — crawlability, site speed, indexing issues",
      "Keyword mapping against real search intent, not vanity volume",
      "On-page optimization across priority pages",
      "Ongoing content strategy built around what's actually working",
      "Monthly reporting tied to rankings and organic traffic trends",
    ],
    focusAreas: ["Organic traffic", "Keyword rankings", "Local visibility", "Technical health"],
  },
  ppc: {
    objective: "Turn ad spend into qualified traffic that's actually worth paying for.",
    approach: [
      "Keyword intent research — commercial intent first",
      "Campaign and ad group structure built for clean tracking",
      "Ad copy testing across multiple variants",
      "Conversion tracking set up before spend starts, not after",
      "Ongoing bid and budget optimization against real performance",
    ],
    focusAreas: ["Cost per click", "Conversion rate", "Return on ad spend", "Quality score"],
  },
  "social-media": {
    objective: "Build a consistent, on-brand presence instead of sporadic posting.",
    approach: [
      "Content calendar built around brand voice and platform fit",
      "Platform-specific creative — not one asset resized everywhere",
      "Consistent posting cadence, not bursts followed by silence",
      "Community management — replies, comments, DMs handled on schedule",
      "Monthly reporting on what content actually performed",
    ],
    focusAreas: ["Engagement rate", "Follower growth", "Content consistency", "Brand voice"],
  },
  "meta-ads": {
    objective: "Reach and convert the right audience on Facebook and Instagram.",
    approach: [
      "Audience research — interest, behavior, and lookalike targeting",
      "Creative testing across formats (static, carousel, video)",
      "Retargeting funnel built around real site/engagement behavior",
      "Conversion tracking (Meta Pixel / Conversions API) verified before launch",
      "Ongoing budget optimization toward what's actually converting",
    ],
    focusAreas: ["Cost per result", "Audience precision", "Retargeting performance", "Creative testing"],
  },
};

const MARKETING_SERVICE_SLUGS: MarketingServiceSlug[] = [
  "seo",
  "ppc",
  "social-media",
  "meta-ads",
];

function buildMarketingItems(
  slug: MarketingServiceSlug,
  name: string
): PortfolioImageItem[] {
  return Array.from({ length: 6 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `${slug}-${number}`,
      title: `${name} ${number}`,
      image: `portfolio/marketing/${slug}-${number}.jpg`,
    };
  });
}

export const marketingPortfolio: MarketingServiceEntry[] = MARKETING_SERVICE_SLUGS.map(
  (slug) => ({
    slug,
    name: MARKETING_SERVICE_NAMES[slug],
    description: MARKETING_SERVICE_DESCRIPTIONS[slug],
    items: buildMarketingItems(slug, MARKETING_SERVICE_NAMES[slug]),
    caseStudy: MARKETING_CASE_STUDIES[slug],
  })
);
