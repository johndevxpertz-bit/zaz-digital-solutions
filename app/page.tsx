import Hero from "@/components/sections/Hero";
import ServicesIntro from "@/components/sections/ServicesIntro";
import PortfolioTeaser from "@/components/sections/PortfolioTeaser";
import WhyZaz from "@/components/sections/WhyZaz";
import PricingPreview from "@/components/sections/PricingPreview";
import FinalCta from "@/components/sections/FinalCta";
import SectionSeam from "@/components/ui/SectionSeam";

export default function Home() {
  return (
    <>
      <Hero />
      <ServicesIntro />
      <SectionSeam />
      <PortfolioTeaser />
      <SectionSeam />
      <WhyZaz />
      <SectionSeam />
      <PricingPreview />
      <SectionSeam />
      <FinalCta />
    </>
  );
}
