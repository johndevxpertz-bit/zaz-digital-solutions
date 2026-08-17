@AGENTS.md

# ZAZ Digital Solutions — Project Rules

Custom-coded premium marketing site for ZAZ Digital Solutions (brand: Logo Design, Website Design, Digital Marketing). This replaces the client's current WordPress site (zazdigitalsolutions.com) — that live site, its DNS, and its GoDaddy/hosting are **out of scope and must never be touched** from this project. Never deploy, never purchase anything, without being explicitly asked.

## Brand direction
Premium, luxury, modern, creative, confident, editorial, technical, polished — visual quality comparable to a high-end US digital agency, fully original (do not copy any reference site's code, layout, text, graphics, or colors — inspiration only).

## Visual system
Dark editorial theme. Design tokens live in `app/globals.css` under `@theme inline` (Tailwind v4 CSS-first config — no `tailwind.config.js`):
- Backgrounds: `--zaz-bg` #0B0B0B, `--zaz-bg-deep` #070707
- Surfaces: `--zaz-surface` #111111, `--zaz-surface-alt` #151515, `--zaz-card` #1B1B1B
- Text: `--zaz-text` #F4F1EA, `--zaz-text-secondary` #A8A8A8, `--zaz-muted` #6F6F6F
- Accent (metallic ivory): `--zaz-accent` #D8D3C8, `--zaz-accent-dim` #BDB7AB
- Radius stays small/sharp — editorial, not rounded-SaaS-card look. Avoid neon/cyberpunk gradients, glassmorphism, excessive shadows, template-looking sections.
- Headings: Poppins. Body: Inter. Fluid `clamp()` type scale, tight heading line-height, controlled letter-spacing, uppercase labels for kickers.

## Logo
The real ZAZ logo (wordmark + geometric symbol, metallic ivory/silver on dark) is **not yet in the repo**. Never invent, redesign, recolor, or fake a logo. `components/ui/Logo.tsx` reads from `/public/brand/zaz-logo.svg` / `zaz-mark.svg` and falls back to a plain text wordmark when the files are absent. See `public/brand/ASSET-REQUIREMENTS.md`.

## Content rules
Never invent fake testimonials, client logos, awards, ratings, statistics, company history, or employees. Where real content is missing, use honest generic agency copy that claims nothing unsupported.

## Data architecture
Pricing and portfolio content must live in centralized data files under `lib/data/` (not hardcoded in JSX), so non-engineers can edit one file later. This applies especially to the Services page (Logo Design types, Website Design packages, Digital Marketing packages) and Portfolio page.

## Tech stack
Next.js App Router + TypeScript + Tailwind CSS v4 + GSAP/ScrollTrigger + Lenis smooth scroll. Framer Motion only if genuinely needed — avoid redundant animation libraries. All scroll/entrance animation must respect `prefers-reduced-motion`. Reusable components, no giant page files, semantic HTML, accessible interactions, `next/image` everywhere.

## Build process
The site is being built section-by-section across multiple sessions per an agreed phased order (foundation → nav → hero → homepage sections → About → Services → Portfolio → Pricing → Contact → SEO polish). Keep code organized and verify each phase (`npm run build` / dev server check) before moving to the next.
