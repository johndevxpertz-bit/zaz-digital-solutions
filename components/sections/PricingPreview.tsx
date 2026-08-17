import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PricingCard from "@/components/ui/PricingCard";
import Button from "@/components/ui/Button";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { logoStartingAt, websiteStartingAt, marketingStartingAt } from "@/lib/data/pricing";

const pillars = [
  {
    name: "Logo Design",
    href: "/services/logo-design",
    price: logoStartingAt,
    priceSuffix: "starting",
    features: ["7 logo styles to choose from", "Multiple concepts & revision rounds", "Vector files as an add-on"],
  },
  {
    name: "Website Design",
    href: "/services/website-design",
    price: websiteStartingAt,
    priceSuffix: "starting",
    features: ["WordPress or fully custom-coded", "7 site types, 6 packages each"],
    highlighted: true,
  },
  {
    name: "Digital Marketing",
    href: "/services/digital-marketing",
    price: marketingStartingAt,
    priceSuffix: "/mo starting",
    features: ["SEO, PPC, social, and Meta Ads", "Starter and Growth tiers per service"],
  },
];

export default function PricingPreview() {
  return (
    <section className="relative py-28">
      <AmbientGlow />
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <SectionHeading kicker="Investment" title="Pricing built around scope." />
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/pricing" variant="secondary">
              See full pricing
            </Button>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar, index) => (
            <Reveal key={pillar.href} delay={index * 0.08}>
              <PricingCard
                name={pillar.name}
                price={pillar.price}
                priceSuffix={pillar.priceSuffix}
                features={pillar.features}
                highlighted={pillar.highlighted}
                ctaHref={pillar.href}
                ctaLabel="Learn more"
              />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
