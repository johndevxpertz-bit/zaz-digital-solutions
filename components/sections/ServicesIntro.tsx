import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";
import AmbientGlow from "@/components/ui/AmbientGlow";
import ServiceGlyph from "@/components/ui/ServiceGlyph";
import { servicePillars } from "@/lib/data/servicePillars";

export default function ServicesIntro() {
  return (
    <section className="relative py-28">
      <AmbientGlow />
      <Container>
        <Reveal>
          <SectionHeading kicker="What we do" title="Three disciplines, one studio." className="mb-14" />
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {servicePillars.map((pillar, index) => (
            <Reveal key={pillar.href} delay={index * 0.08} variant="fade-scale">
              <TiltCard max={5} scale={1.015}>
                <Link
                  href={pillar.href}
                  className="group flex h-full flex-col justify-between rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8 transition-all duration-300 hover:border-zaz-accent hover:shadow-[0_20px_45px_-26px_rgba(var(--zaz-accent-rgb),0.3)]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="zaz-label text-zaz-muted">{pillar.number}</span>
                      <ServiceGlyph icon={pillar.icon} />
                    </div>
                    <h3 className="mt-6 font-heading text-2xl font-semibold text-zaz-text">{pillar.name}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-zaz-text-secondary">{pillar.description}</p>
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
  );
}
