import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioExplorer from "@/components/sections/PortfolioExplorer";
import PortfolioOrbitGallery, { type PortfolioOrbitItem } from "@/components/sections/PortfolioOrbitGallery";
import { portfolioItems, portfolioFilters } from "@/lib/data/portfolio";
import { marketingPortfolio } from "@/lib/data/marketingPortfolio";
import { logoCategories } from "@/lib/data/logoPortfolio";
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

  // A mixed set spanning all three disciplines — real website screenshots,
  // real logo marks, and one abstract growth visual (no real Digital
  // Marketing assets exist in the project, so that tile stays conceptual
  // rather than a fabricated campaign — see CLAUDE.md content rules) — so
  // the hero reads as "logos, websites and marketing" within a few seconds.
  const heroWebsites: PortfolioOrbitItem[] = items
    .filter((item) => Boolean(item.url) && item.resolvedSrc)
    .slice(0, 2)
    .map((item) => ({ kind: "website", src: item.resolvedSrc as string, alt: item.title }));

  const heroLogos: PortfolioOrbitItem[] = logoCategories
    .map((category) => category.items.find((item) => Boolean(resolveMediaAsset(item.image))))
    .filter((item): item is (typeof logoCategories)[number]["items"][number] => Boolean(item))
    .slice(0, 2)
    .map((item) => ({ kind: "logo", src: resolveMediaAsset(item.image) as string, alt: item.title }));

  const heroItems: PortfolioOrbitItem[] = [
    heroWebsites[0],
    heroLogos[0],
    heroWebsites[1],
    { kind: "marketing", alt: "Digital marketing growth" },
    heroLogos[1],
  ].filter((item): item is PortfolioOrbitItem => Boolean(item));

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
          {heroItems.length > 0 && (
            <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
              <PortfolioOrbitGallery items={heroItems} />
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
