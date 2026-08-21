import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import AmbientGlow from "@/components/ui/AmbientGlow";
import SectionSeam from "@/components/ui/SectionSeam";
import ProcessSteps from "@/components/sections/ProcessSteps";
import AboutArmillarySphere from "@/components/sections/AboutArmillarySphere";
import AboutBeliefs from "@/components/sections/AboutBeliefs";
import AboutCapabilities from "@/components/sections/AboutCapabilities";
import AboutStatement from "@/components/sections/AboutStatement";
import AboutFlow from "@/components/sections/AboutFlow";

export const metadata: Metadata = {
  title: "About",
  description:
    "ZAZ Digital Solutions is a premium studio working across logo design, website design, and digital marketing as one connected practice.",
};

export default function AboutPage() {
  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div>
            <Reveal immediate>
              <SectionHeading
                kicker="About ZAZ"
                title="Digital work built with intention."
                description="ZAZ Digital Solutions works across three disciplines — logo design, website design, and digital marketing — treated as one connected practice, not three separate vendors."
              />
            </Reveal>

            <Reveal delay={0.15}>
              <blockquote className="mt-14 max-w-2xl border-l-2 border-zaz-accent pl-6 font-heading text-2xl font-medium leading-snug text-zaz-text sm:text-3xl">
                &ldquo;We don&apos;t just write code; we build digital legacies.&rdquo;
              </blockquote>
            </Reveal>
          </div>

          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <AboutArmillarySphere />
          </Reveal>
        </Container>
      </section>

      <section className="relative pb-28">
        <AmbientGlow />
        <Container>
          <Reveal>
            <p className="zaz-label mb-5">Who we are</p>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="max-w-2xl text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
              ZAZ Digital Solutions helps businesses build a stronger digital presence — through
              custom web development and WordPress builds, logo and brand identity work, and the
              digital marketing that gets it all seen.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-5 max-w-2xl text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
              Most agencies specialize in one piece of the puzzle and hand the rest off. We
              don&apos;t. A brand mark, the website it lives on, and the marketing that drives
              people to it are designed together from the start, so nothing feels bolted on.
            </p>
          </Reveal>
        </Container>
      </section>

      <SectionSeam />
      <AboutBeliefs />
      <SectionSeam />
      <AboutCapabilities />
      <AboutStatement />

      <section className="pb-28">
        <Container>
          <Reveal>
            <SectionHeading kicker="How we work" title="A clear process, start to finish." className="mb-14" />
          </Reveal>
          <ProcessSteps />
        </Container>
      </section>

      <SectionSeam />
      <AboutFlow />

      <section className="pb-32">
        <Container>
          <Reveal variant="clip-reveal">
            <div className="relative flex flex-col items-start justify-between gap-8 overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-10 sm:flex-row sm:items-center">
              <AmbientGlow />
              <div>
                <h2 className="font-heading text-2xl font-semibold text-zaz-text sm:text-3xl">
                  Ready to start?
                </h2>
                <p className="mt-3 max-w-md text-sm text-zaz-text-secondary">
                  Tell us about the project and we&apos;ll follow up to talk scope, timeline, and pricing.
                </p>
              </div>
              <Button href="/contact" variant="primary">
                Start a project
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
