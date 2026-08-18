import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioGrid from "@/components/ui/PortfolioGrid";
import PricingCard from "@/components/ui/PricingCard";
import WebsiteTypeExplorer from "@/components/sections/WebsiteTypeExplorer";
import PageHeroVisual from "@/components/sections/PageHeroVisual";
import { websitePortfolio, customWebsiteShowcase } from "@/lib/data/websitePortfolio";
import { websitePricing } from "@/lib/data/pricing";
import { resolveMediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Website Design",
  description:
    "Custom-coded and WordPress website design from ZAZ Digital Solutions — WordPress builds across seven site types, plus fully custom-coded websites.",
};

export default function WebsiteDesignPage() {
  const featuredItem = websitePortfolio
    .flatMap((group) => group.types.flatMap((type) => type.items))
    .find((item) => Boolean(item.url));
  const featuredResolvedSrc = featuredItem ? resolveMediaAsset(featuredItem.image) : null;
  const heroScreenshot =
    featuredItem && featuredResolvedSrc ? { src: featuredResolvedSrc, label: featuredItem.title } : null;

  // WordPress keeps its existing 7-type tab structure and per-type pricing.
  const wordpressGroup = websitePortfolio.find((group) => group.buildType === "wordpress")!;
  const wordpressPricing = websitePricing.find((g) => g.buildType === "wordpress")!;

  const panels: Record<string, React.ReactNode> = {};

  for (const type of wordpressGroup.types) {
    const pricingType = wordpressPricing.types.find((t) => t.slug === type.slug);
    if (!pricingType) continue;

    panels[`wordpress__${type.slug}`] = (
      <div className="grid gap-16">
        <div>
          <p className="text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
            {type.description}
          </p>
          <div className="mt-8">
            <PortfolioGrid items={type.items} columns="grid-cols-2 md:grid-cols-3" aspect="aspect-[16/10]" />
          </div>
        </div>

        <div>
          <p className="zaz-label mb-6">Pricing — {type.name}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pricingType.packages.map((pkg) => (
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
        <div className="mt-8">
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
            types={wordpressGroup.types.map((type) => ({ slug: type.slug, name: type.name }))}
            panels={panels}
            customPanel={customPanel}
          />
        </Container>
      </section>
    </>
  );
}
