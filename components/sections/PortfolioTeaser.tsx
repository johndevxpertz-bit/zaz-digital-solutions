import Link from "next/link";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import PortfolioCard from "@/components/ui/PortfolioCard";
import Button from "@/components/ui/Button";
import AmbientGlow from "@/components/ui/AmbientGlow";
import { portfolioItems, type PortfolioCard as PortfolioCardData } from "@/lib/data/portfolio";
import { marketingPortfolio } from "@/lib/data/marketingPortfolio";
import { resolveMediaAsset, getAnimatedLogoAssets } from "@/lib/media";

// Compact real-video preview — the full Animated Logos category (with its
// lightbox and complete set) lives on /services/logo-design; this teaser
// only samples a few so the homepage section stays a showcase, not a
// duplicate portfolio page.
const animatedLogoTeaserItems = getAnimatedLogoAssets().slice(0, 4);

// Digital Marketing reads as trust-building process copy, not a wall of
// placeholder images — matches the case-study treatment on the dedicated
// service page and /portfolio's marketing filter, just condensed to one line
// each. All 4 real services shown (not just 2) so this subsection carries
// the same visual weight as Website Design / Animated Logo Design above it.
const marketingTeaserServices = marketingPortfolio;

// A curated sample of the real, live client websites — 2 WordPress + 2
// Custom, alternating per row in a 2x2 grid (kept small so this stays a
// teaser rather than duplicating the full /portfolio page) — shown with the
// full BrowserFrame treatment (via PortfolioCard, resolved here since this
// is a server component) so a visitor immediately understands ZAZ builds
// real websites. The rest are on /portfolio.
const FEATURED_WEBSITE_IDS = ["wordpress-ecommerce-01", "custom-business-01", "wordpress-personal-01", "custom-ecommerce-01"];
const realWebsiteItems = FEATURED_WEBSITE_IDS.map((id) => portfolioItems.find((item) => item.id === id))
  .filter((item): item is PortfolioCardData => Boolean(item))
  .map((item) => ({ ...item, resolvedSrc: resolveMediaAsset(item.image) }));

export default function PortfolioTeaser() {
  return (
    <section className="relative py-32">
      <AmbientGlow />
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <Reveal>
            <SectionHeading kicker="Selected work" title="A look at the range." />
          </Reveal>
          <Reveal delay={0.1}>
            <Button href="/portfolio" variant="secondary">
              View full portfolio
            </Button>
          </Reveal>
        </div>

        <div className="mt-20 flex flex-col gap-16">
          {realWebsiteItems.length > 0 && (
            <div>
              <Reveal>
                <p className="zaz-label mb-6 text-zaz-muted">Website Design</p>
              </Reveal>
              <div className="grid grid-cols-2 gap-6 md:gap-8">
                {realWebsiteItems.map((item, index) => (
                  <PortfolioCard key={item.id} item={item} delay={index * 60} />
                ))}
              </div>
            </div>
          )}

          {animatedLogoTeaserItems.length > 0 && (
            <div>
              <Reveal>
                <p className="zaz-label mb-6 text-zaz-muted">Animated Logo Design</p>
              </Reveal>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {animatedLogoTeaserItems.map((item, index) => (
                  <Reveal key={item.id} delay={index * 0.05} variant="fade-scale">
                    <Link
                      href="/services/logo-design"
                      aria-label={`${item.title} — see the full Logo Design portfolio`}
                      className="group relative block aspect-[4/5] overflow-hidden rounded-[var(--zaz-radius-sm)] border border-zaz-border bg-zaz-bg-deep transition-colors duration-500 hover:border-zaz-accent-dim"
                    >
                      <video
                        className="h-full w-full object-contain transition-transform duration-500 ease-[var(--zaz-ease)] group-hover:scale-110"
                        autoPlay
                        muted
                        loop
                        playsInline
                      >
                        <source src={item.src} type={item.type} />
                      </video>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}

          <div>
            <Reveal delay={0.05}>
              <p className="zaz-label mb-6 text-zaz-muted">Digital Marketing</p>
            </Reveal>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {marketingTeaserServices.map((service, index) => (
                <Reveal key={service.slug} delay={index * 0.06} variant="fade-scale">
                  <Link
                    href="/services/digital-marketing"
                    className="group flex h-full flex-col justify-between rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-6 transition-all duration-300 hover:border-zaz-accent-dim"
                  >
                    <div>
                      <span className="zaz-label text-zaz-muted">{service.name}</span>
                      <p className="mt-3 text-sm leading-relaxed text-zaz-text-secondary">{service.caseStudy.objective}</p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-zaz-accent">
                      See our approach
                      <svg
                        aria-hidden
                        width="12"
                        height="8"
                        viewBox="0 0 16 10"
                        fill="none"
                        className="transition-transform duration-300 ease-[var(--zaz-ease)] group-hover:translate-x-1"
                      >
                        <path d="M1 5H15M15 5L11 1M15 5L11 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
