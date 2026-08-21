import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import PricingValueEngine from "@/components/sections/PricingValueEngine";
import { logoPricing, websitePricing, marketingPricing } from "@/lib/data/pricing";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Starting pricing for logo design, website design, and digital marketing from ZAZ Digital Solutions — see full package breakdowns on each service page.",
};

const logoStartingAt = Math.min(
  ...logoPricing.flatMap((type) => type.packages.map((pkg) => pkg.price))
);

const websiteStartingAt = Math.min(
  ...websitePricing.flatMap((group) => group.types.flatMap((type) => type.packages.map((pkg) => pkg.price)))
);

const marketingStartingAt = Math.min(
  ...marketingPricing.flatMap((service) => service.packages.map((pkg) => pkg.price))
);

const pillars = [
  {
    name: "Logo Design",
    href: "/services/logo-design",
    price: logoStartingAt,
    priceSuffix: "starting",
    features: [
      "7 logo styles to choose from",
      "Multiple concepts & revision rounds",
      "Vector files available as an add-on",
    ],
  },
  {
    name: "Website Design",
    href: "/services/website-design",
    price: websiteStartingAt,
    priceSuffix: "starting",
    features: [
      "WordPress or fully custom-coded",
      "7 site types, 6 packages each",
      "Pricing scales with pages & features",
    ],
    highlighted: true,
  },
  {
    name: "Digital Marketing",
    href: "/services/digital-marketing",
    price: marketingStartingAt,
    priceSuffix: "/mo starting",
    features: [
      "SEO, Google Ads, social, and Meta Ads",
      "Starter, Growth, and Pro tiers per service",
      "Monthly performance reporting",
    ],
  },
];

export default function PricingPage() {
  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="Investment"
              title="Pricing built around scope, not guesswork."
              description="Every service is priced from a clear starting point. See the full package breakdown — pages, features, and tiers — on each service's page."
            />
          </Reveal>
          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <PricingValueEngine />
          </Reveal>
        </Container>
      </section>

      <section className="pb-24">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.href} delay={index * 0.08}>
                <PricingCard
                  name={pillar.name}
                  price={pillar.price}
                  priceSuffix={pillar.priceSuffix}
                  features={pillar.features}
                  highlighted={pillar.highlighted}
                  ctaHref={pillar.href}
                  ctaLabel="View full pricing"
                />
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <Reveal>
            <p className="max-w-2xl text-sm text-zaz-text-secondary">
              Figures shown are reference starting prices for the lowest package in each
              service. Final scope and pricing are confirmed after a short discovery call, and
              full package-by-package breakdowns are available on each service page.
            </p>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
