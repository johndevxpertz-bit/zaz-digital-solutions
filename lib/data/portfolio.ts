import { logoCategories } from "@/lib/data/logoPortfolio";
import { websitePortfolio, getWordPressPortfolioCategory, type WordPressPortfolioCategorySlug } from "@/lib/data/websitePortfolio";
import { marketingPortfolio } from "@/lib/data/marketingPortfolio";

export type PortfolioFilterSlug = "logo-design" | "wordpress" | "custom" | "digital-marketing";

export type PortfolioCard = {
  id: string;
  title: string;
  image: string;
  filter: PortfolioFilterSlug;
  /** Category/type label for display, e.g. "Wordmark" or "E-commerce". */
  group: string;
  /** Real, live project URL, when one exists. */
  url?: string;
  /** WordPress-only: which of the 3 portfolio categories (Ecommerce/Informative/Author) this falls under. */
  subCategory?: WordPressPortfolioCategorySlug;
};

export const portfolioFilters: { slug: PortfolioFilterSlug; label: string }[] = [
  { slug: "logo-design", label: "Logo Design" },
  { slug: "wordpress", label: "WordPress" },
  { slug: "custom", label: "Custom Websites" },
  { slug: "digital-marketing", label: "Digital Marketing" },
];

function fromLogoPortfolio(): PortfolioCard[] {
  return logoCategories.flatMap((category) =>
    category.items.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      filter: "logo-design" as const,
      group: category.name,
      url: item.url,
    }))
  );
}

function fromWebsitePortfolio(): PortfolioCard[] {
  return websitePortfolio.flatMap((group) =>
    group.types.flatMap((type) =>
      type.items.map((item) => ({
        id: item.id,
        title: item.title,
        image: item.image,
        filter: group.buildType as PortfolioFilterSlug,
        group: type.name,
        url: item.url,
        subCategory: group.buildType === "wordpress" ? getWordPressPortfolioCategory(type.slug) : undefined,
      }))
    )
  );
}

function fromMarketingPortfolio(): PortfolioCard[] {
  return marketingPortfolio.flatMap((service) =>
    service.items.map((item) => ({
      id: item.id,
      title: item.title,
      image: item.image,
      filter: "digital-marketing" as const,
      group: service.name,
      url: item.url,
    }))
  );
}

export const portfolioItems: PortfolioCard[] = [
  ...fromLogoPortfolio(),
  ...fromWebsitePortfolio(),
  ...fromMarketingPortfolio(),
];
