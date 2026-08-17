import type { LogoCategorySlug, PortfolioImageItem } from "@/lib/data/types";

export type LogoCategory = {
  slug: LogoCategorySlug;
  name: string;
  description: string;
  /** Design approaches available within this category — descriptive, not a separate pricing/portfolio dimension. */
  subtypes: string[];
  items: PortfolioImageItem[];
};

// "Animated Logo Design" intentionally excluded — Animated Logos is now its
// own separate top-level tab (real video files, see AnimatedLogoPanel), so a
// same-named subtype filter here would misleadingly cycle onto static image
// items within these categories, none of which are actually animated.
const LOGO_SUBTYPES = ["2D Logo Design", "3D Logo Design", "Mascot Logo Design", "Illustrative Logo Design"];

/**
 * Real client/portfolio artwork (public/portfolio/logos/all logos/) takes priority over
 * the generated placeholder mark for a slot — this maps each real file's extension and
 * a subtype reflecting how it was actually designed (visually inspected, not filename-guessed).
 * Slots with no entry here keep the original self-authored SVG placeholder.
 */
const LOGO_ASSET_OVERRIDES: Partial<Record<string, { ext: string; subtype: string }>> = {
  "lettermark-01": { ext: "png", subtype: "2D Logo Design" },
  "lettermark-02": { ext: "png", subtype: "3D Logo Design" },
  "pictorial-mark-01": { ext: "png", subtype: "Illustrative Logo Design" },
  "pictorial-mark-02": { ext: "jpg", subtype: "2D Logo Design" },
  "pictorial-mark-03": { ext: "jpg", subtype: "Illustrative Logo Design" },
  "abstract-mark-01": { ext: "jpg", subtype: "2D Logo Design" },
  "abstract-mark-02": { ext: "jpg", subtype: "2D Logo Design" },
  "mascot-logo-01": { ext: "png", subtype: "Mascot Logo Design" },
  "mascot-logo-02": { ext: "png", subtype: "Mascot Logo Design" },
  "mascot-logo-03": { ext: "png", subtype: "Mascot Logo Design" },
  "combination-mark-01": { ext: "png", subtype: "3D Logo Design" },
  "combination-mark-02": { ext: "png", subtype: "2D Logo Design" },
  "combination-mark-03": { ext: "png", subtype: "2D Logo Design" },
  "combination-mark-04": { ext: "png", subtype: "2D Logo Design" },
  "combination-mark-05": { ext: "png", subtype: "2D Logo Design" },
  "combination-mark-06": { ext: "png", subtype: "Illustrative Logo Design" },
  "emblem-01": { ext: "png", subtype: "2D Logo Design" },
  "emblem-02": { ext: "png", subtype: "2D Logo Design" },
  "emblem-03": { ext: "png", subtype: "2D Logo Design" },
  "emblem-04": { ext: "png", subtype: "2D Logo Design" },
  "emblem-05": { ext: "png", subtype: "2D Logo Design" },
  "emblem-06": { ext: "jpg", subtype: "2D Logo Design" },
};

function buildLogoItems(slug: LogoCategorySlug, name: string): PortfolioImageItem[] {
  return Array.from({ length: 6 }, (_, index) => {
    const number = String(index + 1).padStart(2, "0");
    const id = `${slug}-${number}`;
    const override = LOGO_ASSET_OVERRIDES[id];
    return {
      id,
      title: `${name} ${number}`,
      image: override
        ? `portfolio/logos/${id}.${override.ext}`
        : `portfolio/logos/${id}.svg`,
      subtype: override ? override.subtype : LOGO_SUBTYPES[index % LOGO_SUBTYPES.length],
    };
  });
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
    subtypes: LOGO_SUBTYPES,
    items: buildLogoItems(slug, name),
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
