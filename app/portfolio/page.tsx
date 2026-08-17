import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioExplorer from "@/components/sections/PortfolioExplorer";
import PageHeroVisual from "@/components/sections/PageHeroVisual";
import { portfolioItems, portfolioFilters } from "@/lib/data/portfolio";
import { marketingPortfolio } from "@/lib/data/marketingPortfolio";
import { resolveMediaAsset } from "@/lib/media";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Selected work from ZAZ Digital Solutions across logo design, WordPress and custom website design, and digital marketing.",
};

export default function PortfolioPage() {
  const items = portfolioItems.map((item) => ({
    ...item,
    resolvedSrc: resolveMediaAsset(item.image),
  }));

  const heroThumbnails = items
    .filter((item) => Boolean(item.url) && item.resolvedSrc)
    .map((item) => ({ src: item.resolvedSrc as string, alt: item.title }));

  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="Selected work"
              title="Portfolio"
              description="A cross-section of logo, website, and marketing work — filter by discipline to see it in context."
            />
          </Reveal>
          {heroThumbnails.length > 0 && (
            <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
              <PageHeroVisual variant="portfolio" portfolioThumbnails={heroThumbnails} />
            </Reveal>
          )}
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <PortfolioExplorer items={items} filters={portfolioFilters} marketingCaseStudies={marketingPortfolio} />
        </Container>
      </section>
    </>
  );
}
