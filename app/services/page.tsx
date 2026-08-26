import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import ServicesMergeEmblem from "@/components/sections/ServicesMergeEmblem";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Logo design, website design, and digital marketing services from ZAZ Digital Solutions — explore each service, its pricing, and its portfolio.",
};

const pillars = [
  {
    number: "01",
    name: "Logo Design",
    href: "/services/logo-design",
    description:
      "Distinct marks built to work everywhere your brand shows up — from wordmarks to emblems, across seven logo styles.",
  },
  {
    number: "02",
    name: "Website Design",
    href: "/services/website-design",
    description:
      "Custom-coded or WordPress builds across seven site types, with page-based packages that scale as your needs grow.",
  },
  {
    number: "03",
    name: "Digital Marketing",
    href: "/services/digital-marketing",
    description:
      "SEO, Google Ads, social media, and Meta Ads built around visibility, traffic, and qualified leads.",
  },
];

export default function ServicesPage() {
  return (
    <>
      <section className="pt-40 pb-20 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="What we do"
              title="Three disciplines, one studio."
              description="Every ZAZ engagement starts with brand, is built to convert, and is designed to grow — logo design, website design, and digital marketing, working together instead of in silos."
            />
          </Reveal>
          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <ServicesMergeEmblem />
          </Reveal>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((pillar, index) => (
              <Reveal key={pillar.href} delay={index * 0.08} variant="fade-scale">
                <TiltCard max={5} scale={1.015}>
                  <Link
                    href={pillar.href}
                    className="group flex h-full flex-col justify-between rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8 transition-all duration-300 hover:border-zaz-accent hover:shadow-[0_20px_45px_-26px_rgba(var(--zaz-accent-rgb),0.3)]"
                  >
                    <div>
                      <span className="zaz-label text-zaz-muted">{pillar.number}</span>
                      <h3 className="mt-6 font-heading text-2xl font-semibold text-zaz-text">
                        {pillar.name}
                      </h3>
                      <p className="mt-4 text-sm leading-relaxed text-zaz-text-secondary">
                        {pillar.description}
                      </p>
                    </div>

                    <span className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-zaz-accent">
                      Explore {pillar.name}
                      <svg
                        aria-hidden
                        width="16"
                        height="10"
                        viewBox="0 0 16 10"
                        fill="none"
                        className="transition-transform duration-300 ease-[var(--zaz-ease)] group-hover:translate-x-1"
                      >
                        <path
                          d="M1 5H15M15 5L11 1M15 5L11 9"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </Link>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
