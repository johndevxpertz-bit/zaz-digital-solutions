import type { LogoCategorySlug, PortfolioImageItem } from "@/lib/data/types";

export type LogoCategory = {
  slug: LogoCategorySlug;
  name: string;
  description: string;
  /** Design approaches available within this category — descriptive, not a separate pricing/portfolio dimension. */
  subtypes: string[];
  items: PortfolioImageItem[];
};

const LOGO_ASSET_DIR = "portfolio/logos/more logos";

type RealLogoAsset = { file: string; title: string };

/**
 * Real logo work only — sourced from public/portfolio/logos/more logos/
 * (inspected and categorized by actual visual content, not filename
 * guessing). No generated/placeholder logos. A category with no matching
 * real assets is left as an empty array — LogoCategoryPanel already shows a
 * "More examples coming soon" state for that case, so nothing is invented
 * to fill a slot.
 */
const REAL_LOGO_ASSETS: Record<LogoCategorySlug, RealLogoAsset[]> = {
  wordmark: [
    { file: "122.png", title: "Ember & Oak" },
    { file: "124.png", title: "Sterling Point Realty" },
    { file: "Bound.jpg", title: "Bound" },
    { file: "CRS LOGO 2 (1).png", title: "CRS — Carbide Recovery Solution" },
    { file: "Sample 1 Front.png", title: "Majoed Salou Event Planning" },
  ],
  lettermark: [],
  "pictorial-mark": [{ file: "FullLogo2.png", title: "Equestrian Mark" }],
  "abstract-mark": [],
  "mascot-logo": [
    { file: "ChatGPT Image Aug 17, 2026, 09_57_41 AM.png", title: "Gladiator" },
    { file: "t54.png", title: "Tubenix Gamer" },
    { file: "Gemini_Generated_Image_hzuhldhzuhldhzuh.jpeg", title: "Titan Strength Club" },
    { file: "Gemini_Generated_Image_r50biwr50biwr50b.jpeg", title: "Fluffy" },
  ],
  "combination-mark": [
    { file: "121.png", title: "IMTS26" },
    { file: "n power.jpg", title: "N Power" },
    { file: "654334565432.jpeg", title: "NNG Industries" },
    { file: "Ginou.jpg", title: "Ginou Creations" },
    { file: "In to the bubbles llc.jpg", title: "Into The Bubbles LLC" },
    { file: "Madrid Service .jpeg", title: "O Madrid Services LLC" },
    { file: "Nelson.png", title: "Landscapes by Nelson" },
    { file: "Roadmap Heather.jpg", title: "LifeMap Compass" },
    { file: "Rooted.png", title: "Rooted Clinical Wellness" },
    { file: "Gemini_Generated_Image_o80zjwo80zjwo80z.jpeg", title: "BluePeak Advisory" },
    { file: "Gemini_Generated_Image_wiltlzwiltlzwilt.jpeg", title: "Eli's Quality" },
  ],
  emblem: [
    { file: "125.png", title: "Urban Spoon" },
    { file: "212.png", title: "PureCare Dental" },
    { file: "234321.jpeg", title: "Crow Bookkeeping" },
    { file: "234321234.jpeg", title: "The Toy Box" },
    { file: "32123.jpeg", title: "GameForge" },
    { file: "534.png", title: "Iron River LLC" },
    { file: "53cc705a-8f27-49fc-8882-0b1500f92670 (1).png", title: "Hall LLC" },
    { file: "542.jpeg", title: "Hall LLC Automotive" },
    { file: "ChatGPT Image Aug 17, 2026, 09_56_10 AM.png", title: "Penguin" },
    { file: "Vibe Guys.webp", title: "It's A Vibe Guys LLC" },
    { file: "cfrdsvsvs.jpeg", title: "Velora Apparel" },
    { file: "w3e2s.png", title: "Panda" },
    { file: "Gemini_Generated_Image_a5wwq8a5wwq8a5ww.jpeg", title: "Urban Brew Cafe" },
    { file: "Gemini_Generated_Image_ftai2wftai2wftai.jpeg", title: "Nibble" },
    { file: "Gemini_Generated_Image_hr7hx9hr7hx9hr7h.jpeg", title: "Pebble" },
    { file: "Gemini_Generated_Image_mmu3qommu3qommu3.jpeg", title: "The Apex Club" },
    { file: "Gemini_Generated_Image_qhl39uqhl39uqhl3.jpeg", title: "Frosty" },
    { file: "Gemini_Generated_Image_qr5cskqr5cskqr5c.jpeg", title: "Pingo" },
  ],
};

function buildLogoItems(slug: LogoCategorySlug): PortfolioImageItem[] {
  return REAL_LOGO_ASSETS[slug].map((asset, index) => ({
    id: `${slug}-${String(index + 1).padStart(2, "0")}`,
    title: asset.title,
    image: `${LOGO_ASSET_DIR}/${asset.file}`,
  }));
}

function buildLogoCategory(
  slug: LogoCategorySlug,
  name: string,
  description: string
): LogoCategory {
  return {
    slug,
    name,
    description,
    // No per-item subtype data exists for the real assets, so the old
    // 2D/3D/Mascot/Illustrative sub-filter is left empty rather than
    // guessed — LogoCategoryPanel only renders pills for entries present here.
    subtypes: [],
    items: buildLogoItems(slug),
  };
}

export const logoCategories: LogoCategory[] = [
  buildLogoCategory(
    "wordmark",
    "Wordmark",
    "A typography-led mark built entirely from the brand name, refined for clarity and legibility at any size."
  ),
  buildLogoCategory(
    "lettermark",
    "Lettermark",
    "A monogram built from initials — a compact identifier for names that are long or already well established."
  ),
  buildLogoCategory(
    "pictorial-mark",
    "Pictorial Mark",
    "A recognizable icon standing in for the brand, built to work independently of the wordmark once established."
  ),
  buildLogoCategory(
    "abstract-mark",
    "Abstract Logo Mark",
    "A geometric, non-representational form built around an original shape unique to the brand."
  ),
  buildLogoCategory(
    "mascot-logo",
    "Mascot Logo",
    "A character-led mark that gives the brand a distinct, approachable personality."
  ),
  buildLogoCategory(
    "combination-mark",
    "Combination Mark",
    "Wordmark and symbol paired as a flexible lockup system that can be used together or apart."
  ),
  buildLogoCategory(
    "emblem",
    "Emblem",
    "Symbol and text unified inside a single contained badge or crest form."
  ),
];
