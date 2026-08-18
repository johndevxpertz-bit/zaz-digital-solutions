import Image from "next/image";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import { getClientLogos } from "@/lib/media";

/**
 * Display-only client-logo showcase — a compact, supporting-scale block
 * (deliberately not SectionHeading/RevealText, which are sized for a hero
 * moment) above a fixed 2-column x 3-row logo panel. The panel is one
 * unified surface — a single outer border with hairline (gap-px) internal
 * dividers, the same mosaic technique WhyZaz (directly below this section)
 * already uses for its reasons grid — rather than six individually-bordered
 * boxes, so the logos read as one cohesive client ecosystem instead of a
 * row of portfolio cards. Logos are plain <div>/<Image> elements with no
 * onClick/href anywhere — clicking or tapping one does nothing, by
 * construction. The ambient glow here is a local, blue-toned variant kept
 * inline in this file (not the shared ivory AmbientGlow) per this section's
 * own brief, reusing the existing zaz-float-a/b keyframes already defined
 * globally rather than adding new ones.
 */
export default function OurClients() {
  const logos = getClientLogos();
  if (logos.length === 0) return null;

  return (
    <section className="relative py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div
          className="zaz-float-a absolute left-1/2 top-0 h-[36vh] w-[36vh] -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #4F7FE0 0%, transparent 70%)", opacity: 0.07 }}
        />
        <div
          className="zaz-float-b absolute -right-[8%] bottom-0 h-[30vh] w-[30vh] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #4F7FE0 0%, transparent 70%)", opacity: 0.05 }}
        />
      </div>

      <Container>
        <Reveal>
          <div className="mx-auto mb-10 max-w-lg text-center">
            <p className="zaz-label mb-3">Our Clients</p>
            <h2
              className="font-heading font-semibold text-zaz-text"
              style={{ fontSize: "var(--zaz-text-h3)", lineHeight: 1.2 }}
            >
              Partners in Success.
              <br />
              Stronger Together.
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-zaz-text-secondary">
              From diverse industries to ambitious businesses, we&apos;ve built lasting
              partnerships that turn shared goals into meaningful results.
            </p>
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-xl grid-cols-2 gap-px overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-border">
          {logos.map((logo, index) => (
            <Reveal key={logo.id} delay={index * 0.08}>
              <div className="group flex h-24 items-center justify-center bg-zaz-bg-deep p-6 transition-all duration-300 ease-[var(--zaz-ease)] hover:bg-zaz-surface hover:shadow-[0_0_28px_-10px_rgba(79,127,224,0.4)] sm:h-28 sm:p-8">
                <div className="relative h-9 w-full sm:h-10">
                  <Image
                    src={logo.src}
                    alt={logo.title}
                    fill
                    sizes="220px"
                    className="object-contain opacity-65 transition-opacity duration-300 ease-[var(--zaz-ease)] group-hover:opacity-100"
                  />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
