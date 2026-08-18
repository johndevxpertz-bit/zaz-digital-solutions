import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import { getClientLogos } from "@/lib/media";

/**
 * Display-only client-logo showcase — intentionally not built on
 * PortfolioCard/PortfolioGrid (no border box, no hover overlay, no link
 * wrapper, no BrowserFrame) so it reads as a trust strip, not another
 * portfolio grid. Logos are plain <div>s with no onClick/href anywhere —
 * clicking or tapping one does nothing, by construction.
 */
export default function OurClients() {
  const logos = getClientLogos();
  if (logos.length === 0) return null;

  return (
    <section className="relative py-28">
      <Container>
        <Reveal>
          <SectionHeading
            kicker="Our Clients"
            title="Building Success Together, Growing Stronger Together"
            description="From diverse industries to ambitious businesses, we've built lasting partnerships that turn shared goals into meaningful results."
            align="center"
            className="mx-auto"
          />
        </Reveal>

        <div className="mt-16 grid grid-cols-2 items-center gap-x-8 gap-y-12 sm:grid-cols-3 sm:gap-x-10 md:grid-cols-6">
          {logos.map((logo, index) => (
            <Reveal key={logo.id} delay={index * 0.06} variant="fade-scale">
              <div className="relative mx-auto h-12 w-full max-w-[140px] opacity-60 grayscale transition-all duration-500 ease-[var(--zaz-ease)] hover:opacity-100 hover:grayscale-0 sm:h-14">
                <Image
                  src={logo.src}
                  alt={logo.title}
                  fill
                  sizes="140px"
                  className="object-contain"
                />
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
