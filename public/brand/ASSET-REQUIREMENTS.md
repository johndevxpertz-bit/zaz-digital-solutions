# Required brand assets

The official ZAZ logo is not yet in this repository. Do not invent, redesign, recolor, or
approximate it — `components/ui/Logo.tsx` falls back to a plain text wordmark until the
real file is added here.

Place the official asset at one of:

- `/public/brand/zaz-logo.svg` (preferred — scales cleanly at any size)
- `/public/brand/zaz-logo.png` (also supported)

`lib/brand.ts` checks for `.svg` first, then `.png`, and is picked up automatically by the
Navbar and Footer with no code changes needed once the file is added.

Optional: `/public/brand/zaz-mark.svg` / `.png` for a symbol-only mark, for compact contexts
(not wired into any component yet — add it here when needed and reference it via
`resolveBrandAsset("zaz-mark")`).

## Expected characteristics

- Metallic ivory/silver appearance, designed for dark backgrounds (`#0B0B0B` / `#070707`)
- Preserve the source proportions exactly — no stretching, recoloring, or re-drawing
- If supplying a PNG, export at high resolution (at least 2x the ~300px display width) so it
  stays crisp on high-DPI screens
