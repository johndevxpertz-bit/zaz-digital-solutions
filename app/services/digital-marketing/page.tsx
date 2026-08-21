import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import TabPanels from "@/components/ui/TabPanels";
import MarketingGrowthNetwork from "@/components/sections/MarketingGrowthNetwork";
import MarketingCaseStudyCard from "@/components/sections/MarketingCaseStudyCard";
import { marketingPortfolio } from "@/lib/data/marketingPortfolio";
import { marketingPricing } from "@/lib/data/pricing";

export const metadata: Metadata = {
  title: "Digital Marketing",
  description:
    "SEO, Google Ads, social media marketing, and Meta Ads from ZAZ Digital Solutions — built around visibility, traffic, and qualified leads.",
};

export default function DigitalMarketingPage() {
  const panels: Record<string, React.ReactNode> = {};

  for (const service of marketingPortfolio) {
    const pricing = marketingPricing.find((p) => p.slug === service.slug);
    if (!pricing) continue;

    panels[service.slug] = (
      <div className="grid gap-16">
        <div>
          <MarketingCaseStudyCard name={service.name} caseStudy={service.caseStudy} />
        </div>

        <div>
          <p className="zaz-label mb-6">Pricing — {service.name}</p>
          <div className="grid gap-5 sm:grid-cols-3">
            {pricing.packages.map((pkg) => (
              <PricingCard
                key={pkg.tier}
                name={pkg.name}
                price={pkg.price}
                priceSuffix={pkg.billingCycle === "monthly" ? "/mo" : "one-time"}
                features={pkg.features}
                highlighted={pkg.tier === 2}
                ctaHref="/contact"
                ctaLabel="Start a project"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="Service 03"
              title="Digital Marketing"
              description="Ongoing campaigns built around visibility, traffic, and leads — no invented benchmarks, just consistent execution month over month."
            />
          </Reveal>
          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <MarketingGrowthNetwork />
          </Reveal>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <TabPanels
            tabs={marketingPortfolio.map((service) => ({ slug: service.slug, label: service.name }))}
            panels={panels}
          />
        </Container>
      </section>
    </>
  );
}
