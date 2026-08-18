import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ServiceGlyph, { type ServiceGlyphIcon } from "@/components/ui/ServiceGlyph";

const capabilities: { name: string; description: string; href: string; icon: ServiceGlyphIcon }[] = [
  {
    name: "Web Development",
    description: "Fast, responsive sites built on modern, maintainable foundations.",
    href: "/services/website-design",
    icon: "browser",
  },
  {
    name: "Brand Identity",
    description: "Marks built to work everywhere a brand shows up — not just on a homepage.",
    href: "/services/logo-design",
    icon: "mark",
  },
  {
    name: "WordPress",
    description: "Flexible, content-managed builds for teams who need to update it themselves.",
    href: "/services/website-design",
    icon: "browser",
  },
  {
    name: "Custom Websites",
    description: "Fully custom-coded builds when a template can't keep up with the brand.",
    href: "/services/website-design",
    icon: "browser",
  },
  {
    name: "Digital Marketing",
    description: "SEO, Google Ads, social, and Meta Ads built around visibility and qualified leads.",
    href: "/services/digital-marketing",
    icon: "bars",
  },
  {
    name: "Creative Solutions",
    description: "Where logo, site, and marketing work don't fit a single category — see it in the work.",
    href: "/portfolio",
    icon: "mark",
  },
];

export default function AboutCapabilities() {
  return (
    <section className="pb-28">
      <Container>
        <Reveal>
          <SectionHeading kicker="What we do" title="Capabilities, at a glance." className="mb-14" />
        </Reveal>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((item, index) => (
            <Reveal key={item.name} delay={index * 0.05} variant="fade-scale">
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-zaz-accent-dim hover:shadow-[0_20px_40px_-26px_rgba(216,211,200,0.25)]"
              >
                <span className="transition-transform duration-300 ease-[var(--zaz-ease)] group-hover:scale-110">
                  <ServiceGlyph icon={item.icon} />
                </span>
                <h3 className="mt-5 font-heading text-base font-semibold text-zaz-text">{item.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zaz-text-secondary">{item.description}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
