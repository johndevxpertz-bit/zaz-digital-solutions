import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TabPanels from "@/components/ui/TabPanels";
import PageHeroVisual from "@/components/sections/PageHeroVisual";
import LogoCategoryPanel from "@/components/sections/LogoCategoryPanel";
import AnimatedLogoPanel from "@/components/sections/AnimatedLogoPanel";
import { logoCategories } from "@/lib/data/logoPortfolio";
import { logoPricing } from "@/lib/data/pricing";
import { resolveMediaAsset, getAnimatedLogoAssets } from "@/lib/media";

export const metadata: Metadata = {
  title: "Logo Design",
  description:
    "Seven logo styles, each with its own portfolio and pricing — wordmarks, lettermarks, pictorial marks, abstract marks, mascots, combination marks, and emblems.",
};

export default function LogoDesignPage() {
  const panels: Record<string, React.ReactNode> = {};

  for (const category of logoCategories) {
    const pricing = logoPricing.find((p) => p.slug === category.slug);
    if (!pricing) continue;

    const resolvedItems = category.items.map((item) => ({ ...item, resolvedSrc: resolveMediaAsset(item.image) }));
    panels[category.slug] = <LogoCategoryPanel category={category} pricing={pricing} items={resolvedItems} />;
  }

  // Animated Logos is a real, separate category (video assets, not static
  // images) appended after the 7 static ones — deliberately not part of
  // logoCategories/logoPricing so the static categories/pricing above are
  // completely untouched. See AnimatedLogoPanel for why it can't reuse
  // LogoCategoryPanel (no subtype filter, no pricing block, video instead
  // of <Image>).
  const animatedLogoItems = getAnimatedLogoAssets();
  const tabs = [
    ...logoCategories.map((category) => ({ slug: category.slug, label: category.name })),
    { slug: "animated-logos", label: "Animated Logos" },
  ];
  panels["animated-logos"] = <AnimatedLogoPanel items={animatedLogoItems} />;

  return (
    <>
      <section className="pt-40 pb-16 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-0 lg:pt-32">
        <Container className="grid items-center gap-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <Reveal immediate>
            <SectionHeading
              kicker="Service 01"
              title="Logo Design"
              description="A mark built around your brand, not a template — choose the style that fits, then the level of exploration you need."
            />
          </Reveal>
          <Reveal immediate delay={0.2} variant="fade-scale" className="hidden lg:block">
            <PageHeroVisual variant="logo" />
          </Reveal>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <TabPanels tabs={tabs} panels={panels} />
        </Container>
      </section>
    </>
  );
}
