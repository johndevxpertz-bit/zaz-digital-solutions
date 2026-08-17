# Asset manifest

This is the map of every image/media folder in this project, what belongs where, and how it's
named. The exhaustive list of every individual expected file already lives in the relevant
`lib/data/*.ts` file (each portfolio/logo item has an `image` field with its exact expected
path) — this doc is not a duplicate of that list, it's the folder-level guide.

## Rule

Missing images never render as broken `<img>` tags, stock photos, or fabricated logos.
`components/ui/MediaSlot.tsx` checks whether the expected file exists (`lib/media.ts`) and
falls back to a generated CSS panel with a text label until the real asset is added — drop the
file in at the documented path and it's picked up automatically, no code changes needed.

## Folders

| Folder | Purpose | Governed by |
|---|---|---|
| `/brand/` | Official ZAZ logo lockup + mark | `lib/brand.ts`, see `brand/ASSET-REQUIREMENTS.md` |
| `/images/` | General site imagery (About, process, section backdrops) | referenced ad hoc as pages are built |
| `/portfolio/logos/` | Logo Design portfolio images, flat folder | `lib/data/logoPortfolio.ts` |
| `/portfolio/websites/wordpress/` | WordPress website portfolio images | `lib/data/websitePortfolio.ts` |
| `/portfolio/websites/custom/` | Custom website portfolio images | `lib/data/websitePortfolio.ts` |
| `/portfolio/marketing/` | Digital Marketing portfolio images | `lib/data/marketingPortfolio.ts` |
| `/videos/` | Optional motion assets (e.g. animated logo reels) | referenced ad hoc |
| `/icons/` | Custom SVG icon assets | referenced ad hoc |

## Naming convention

Portfolio images are flat within their folder, named `{category-or-type-slug}-{01..06}.jpg`,
e.g. `portfolio/logos/wordmark-03.jpg`, `portfolio/websites/custom/ecommerce-05.jpg`,
`portfolio/marketing/seo-01.jpg`. Slugs match the `slug` field in the corresponding data file.

## Image specs (when adding real assets)

- Format: `.jpg` for photography/screenshots, `.svg` for icons and the brand logo
- Portfolio images: consistent aspect ratio within a category (recommend 4:5 for logo tiles,
  16:10 for website/marketing screenshots), at least 1600px on the long edge
- Export web-optimized (compressed) — `next/image` handles responsive resizing, not raw weight
