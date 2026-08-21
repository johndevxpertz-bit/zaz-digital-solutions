import Image from "next/image";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import RevealText from "@/components/ui/RevealText";
import HeroBackground from "@/components/sections/HeroBackground";
import HeroRubikCube from "@/components/sections/HeroRubikCube";
import { resolveMediaAsset } from "@/lib/media";

const pillars = ["Logo Design", "Website Design", "Digital Marketing"];

export default function Hero() {
  // Dedicated Hero asset (not the Header/Footer logo) — see HeroRubikCube's
  // own doc comment for how the mark is cropped from it onto the cube.
  const logoSrc = resolveMediaAsset("portfolio/logos/Logo for home hero section.png");

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden pt-28 pb-14 [@media(max-height:800px)]:pt-24 [@media(max-height:800px)]:pb-8">
      <HeroBackground />

      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
        <div>
          <Reveal immediate>
            <p className="zaz-label mb-6">Premium Creative &amp; Digital Agency</p>
          </Reveal>

          <RevealText
            as="h1"
            immediate
            delay={0.1}
            text="Brands, websites, and growth — built with intention."
            className="font-heading font-semibold text-zaz-text"
            style={{ fontSize: "var(--zaz-text-hero)" }}
          />

          <Reveal immediate delay={0.4}>
            <p
              className="mt-6 max-w-xl text-zaz-text-secondary [@media(max-height:800px)]:mt-4"
              style={{ fontSize: "var(--zaz-text-body-lg)" }}
            >
              ZAZ Digital Solutions is a premium creative studio for logo design,
              custom website design, and digital marketing — for businesses that
              take their image seriously.
            </p>
          </Reveal>

          <Reveal immediate delay={0.55} variant="fade-scale">
            <div className="mt-8 flex flex-wrap items-center gap-4 [@media(max-height:800px)]:mt-5">
              <Button href="/contact" variant="primary">
                Start a project
              </Button>
              <Button href="/portfolio" variant="secondary">
                View our work
              </Button>
            </div>
          </Reveal>

          <Reveal immediate delay={0.7}>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-zaz-border pt-5 [@media(max-height:800px)]:mt-5 [@media(max-height:800px)]:pt-4">
              {pillars.map((pillar) => (
                <span key={pillar} className="zaz-label text-zaz-muted">
                  {pillar}
                </span>
              ))}
            </div>
          </Reveal>

          <Reveal immediate delay={0.8}>
            <a
              href="https://www.trustpilot.com/review/zazdigitalsolutions.com?languages=all"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Read ZAZ Digital Solutions reviews on Trustpilot — opens in a new tab"
              className="mt-4 inline-flex items-center opacity-90 transition-opacity duration-200 hover:opacity-100"
            >
              <span className="relative aspect-[530/246] w-36 sm:w-40">
                <Image
                  src="/portfolio/trustpilot/trustpilot.webp"
                  alt="Trustpilot reviews"
                  fill
                  sizes="160px"
                  className="object-contain object-left"
                />
              </span>
            </a>
          </Reveal>
        </div>

        <Reveal immediate delay={0.3} variant="fade-scale">
          <HeroRubikCube logoSrc={logoSrc} />
        </Reveal>
      </Container>
    </section>
  );
}
