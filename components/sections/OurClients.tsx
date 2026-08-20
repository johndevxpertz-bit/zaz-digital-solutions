import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { getClientLogos } from "@/lib/media";

/**
 * Display-only client-logo showcase. Heading reuses the exact same
 * SectionHeading/Reveal/AmbientGlow/Container tokens as every other
 * homepage section (unchanged from prior rounds). The logo row itself is a
 * continuous horizontal marquee, not a card grid — full-bleed (outside
 * Container, so it can run edge-to-edge) with a duplicated logo list and a
 * pure CSS keyframe translating exactly -50%, which is what makes the loop
 * seamless (the second copy lines up perfectly where the first started).
 * The animation is scoped to this file via a plain <style> tag rather than
 * globals.css — self-contained, no JS driving it, so it can never interact
 * with Lenis/ScrollTrigger or the page's scroll-lock system. Logos are
 * plain <div>/<Image> elements with no onClick/href anywhere — clicking or
 * tapping one does nothing, by construction.
 */
export default function OurClients() {
  const logos = getClientLogos();
  if (logos.length === 0) return null;

  // Duplicated once so the track can loop seamlessly: translating exactly
  // -50% moves the first copy fully out of view at the exact moment the
  // second copy reaches the start position, so the reset is invisible.
  const track = [...logos, ...logos];

  return (
    <section className="relative overflow-hidden py-28">
      <AmbientGlow />
      <Container>
        <Reveal>
          <SectionHeading
            kicker="Our Clients"
            title="Partners in Success. Stronger Together."
            description="From diverse industries to ambitious businesses, we've built lasting partnerships that turn shared goals into meaningful results."
            className="mb-14"
          />
        </Reveal>
      </Container>

      <div
        className="zaz-clients-marquee-wrap relative w-full overflow-hidden"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        }}
      >
        <div className="zaz-clients-marquee-track flex w-max items-center">
          {track.map((logo, index) => (
            <div
              key={`${logo.id}-${index}`}
              className="mx-5 flex h-[90px] w-[252px] shrink-0 items-center justify-center sm:mx-8 sm:h-[126px] sm:w-[360px]"
            >
              <div className="relative h-full w-full">
                <Image
                  src={logo.src}
                  alt={logo.title}
                  fill
                  sizes="360px"
                  className="object-contain opacity-100"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes zaz-clients-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .zaz-clients-marquee-track {
          animation: zaz-clients-marquee 40s linear infinite;
        }
        .zaz-clients-marquee-wrap:hover .zaz-clients-marquee-track {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .zaz-clients-marquee-track {
            animation: none;
          }
        }
      `}</style>
    </section>
  );
}
