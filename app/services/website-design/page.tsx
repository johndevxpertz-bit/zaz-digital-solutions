import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioGrid from "@/components/ui/PortfolioGrid";
import PricingCard from "@/components/ui/PricingCard";
import WebsiteTypeExplorer from "@/components/sections/WebsiteTypeExplorer";
import PageHeroVisual from "@/components/sections/PageHeroVisual";
import {
  websitePortfolio,
  customWebsiteShowcase,
  wordpressPortfolioCategories,
  getWordPressPortfolioCategory,
  type WordPressPortfolioCategorySlug,
} from "@/lib/data/websitePortfolio";
import { websitePricing } from "@/lib/data/pricing";
import { resolveMediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Website Design",
  description:
    "Custom-coded and WordPress website design from ZAZ Digital Solutions — WordPress builds across Ecommerce, Informative, and Author sites, plus fully custom-coded websites.",
};

type WordPressTabSlug = "all" | WordPressPortfolioCategorySlug;

const WORDPRESS_TAB_DESCRIPTIONS: Record<WordPressTabSlug, string> = {
  all: "The full range of WordPress builds — ecommerce, informative, and author sites.",
  ecommerce: "Online stores and business sites built to sell and convert.",
  informative: "Portfolio, educational, landing page, personal, and directory sites built to inform and engage.",
  author: "Author and blog-led WordPress sites.",
};

export default function WebsiteDesignPage() {
  const featuredItem = websitePortfolio
    .flatMap((group) => group.types.flatMap((type) => type.items))
    .find((item) => Boolean(item.url));
  const featuredResolvedSrc = featuredItem ? resolveMediaAsset(featuredItem.image) : null;
  const heroScreenshot =
    featuredItem && featuredResolvedSrc ? { src: featuredResolvedSrc, label: featuredItem.title } : null;

  // WordPress tabs: All WordPress, Ecommerce, Informative, Author — grouped
  // from the existing 7 underlying site types via the same
  // getWordPressPortfolioCategory mapping /portfolio already uses, so no
  // portfolio data changes. A category with no underlying types (Author)
  // gets an honest "coming soon" panel instead of an empty grid.
  const wordpressGroup = websitePortfolio.find((group) => group.buildType === "wordpress")!;
  const wordpressPricing = websitePricing.find((g) => g.buildType === "wordpress")!;

  const wordpressTabs: { slug: WordPressTabSlug; name: string }[] = [
    { slug: "all", name: "All WordPress" },
    ...wordpressPortfolioCategories.map((category) => ({ slug: category.slug, name: category.name })),
  ];

  const panels: Record<string, React.ReactNode> = {};

  for (const tab of wordpressTabs) {
    const types =
      tab.slug === "all"
        ? wordpressGroup.types
        : wordpressGroup.types.filter((type) => getWordPressPortfolioCategory(type.slug) === tab.slug);

    if (types.length === 0) {
      panels[`wordpress__${tab.slug}`] = (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--zaz-radius)] border border-dashed border-zaz-border py-24 text-center">
          <p className="font-heading text-lg font-semibold text-zaz-text">More work coming soon.</p>
          <p className="max-w-sm text-sm text-zaz-text-secondary">
            This category is being built out — check back soon to see the work here.
          </p>
        </div>
      );
      continue;
    }

    // Real projects only — the underlying 7-type data still carries
    // placeholder slots (for /portfolio's full grid), but Services should
    // only ever show a card for a real, live project.
    const items = types.flatMap((type) => type.items).filter((item) => Boolean(item.url));

    if (items.length === 0) {
      panels[`wordpress__${tab.slug}`] = (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--zaz-radius)] border border-dashed border-zaz-border py-24 text-center">
          <p className="font-heading text-lg font-semibold text-zaz-text">More work coming soon.</p>
          <p className="max-w-sm text-sm text-zaz-text-secondary">
            This category is being built out — check back soon to see the work here.
          </p>
        </div>
      );
      continue;
    }

    // Every WordPress type now shares the same fixed price ladder, so any
    // one underlying type's packages represent the whole tab's pricing —
    // this only affects which feature bullets are shown, not the prices.
    const packages = wordpressPricing.types.find((t) => t.slug === types[0].slug)!.packages;

    panels[`wordpress__${tab.slug}`] = (
      <div className="grid gap-16">
        <div>
          <p className="text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
            {WORDPRESS_TAB_DESCRIPTIONS[tab.slug]}
          </p>
          <div className="mt-6">
            <PortfolioGrid items={items} columns="grid-cols-2 md:grid-cols-3" aspect="aspect-[16/10]" />
          </div>
        </div>

        <div>
          <p className="zaz-label mb-6">Pricing — {tab.name}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PricingCard
                key={pkg.tier}
                name={pkg.name}
                price={pkg.price}
                priceSuffix="one-time"
                features={pkg.features}
                footnote={`Delivery: ${pkg.deliveryEstimate}`}
                highlighted={pkg.tier === 4}
                ctaHref="/contact"
                ctaLabel="Start a project"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Custom Website: no per-type tabs — a single section listing the real,
  // live custom-coded projects, plus one shared 6-tier price ladder (every
  // type carries the same Custom prices now, so any one type's packages
  // represent the whole build type).
  const customGroup = websitePortfolio.find((group) => group.buildType === "custom")!;
  const customPricing = websitePricing.find((g) => g.buildType === "custom")!;
  // "business" is the most broadly-applicable of the 7 underlying types for
  // feature copy — every type shares the same price ladder now, so this only
  // affects which feature bullets are shown, not the prices.
  const customPackages = customPricing.types.find((t) => t.slug === "business")!.packages;

  const customPanel = (
    <div className="grid gap-16">
      <div>
        <p className="text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
          Fully custom-coded — no page builder, no theme. Click a preview to view the live site.
        </p>
        <div className="mt-6">
          <PortfolioGrid
            items={customWebsiteShowcase}
            columns="grid-cols-1 sm:grid-cols-2"
            aspect="aspect-[16/10]"
            showCaption
          />
        </div>
      </div>

      <div>
        <p className="zaz-label mb-6">Pricing — {customGroup.name}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {customPackages.map((pkg) => (
            <PricingCard
              key={pkg.tier}
              name={pkg.name}
              price={pkg.price}
              priceSuffix="one-time"
              features={pkg.features}
              footnote={`Delivery: ${pkg.deliveryEstimate}`}
              highlighted={pkg.tier === 4}
              ctaHref="/contact"
              ctaLabel="Start a project"
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="Service 02"
              title="Website Design"
              description="WordPress or fully custom-coded — every build is scoped by site type and package, so pricing and pages grow together, not separately."
            />
          </Reveal>
          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <PageHeroVisual variant="website" websiteScreenshot={heroScreenshot} />
          </Reveal>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <WebsiteTypeExplorer
            types={wordpressTabs}
            panels={panels}
            customPanel={customPanel}
          />
        </Container>
      </section>
    </>
  );
}
