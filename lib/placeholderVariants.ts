/**
 * Generated placeholder patterns — abstract CSS gradients only, built from
 * existing design tokens. Not stand-ins for real logos/screenshots, just a
 * premium backdrop until real assets exist (see public/ASSET-MANIFEST.md).
 *
 * Pure/client-safe (no fs) so it can be shared between the server-only
 * MediaSlot (components/ui/MediaSlot.tsx) and client-side pagination
 * (components/ui/PortfolioTile.tsx) without either duplicating the pattern
 * definitions or pulling `node:fs` into a client bundle.
 */
export const PLACEHOLDER_VARIANTS = [
  {
    backgroundImage:
      "repeating-linear-gradient(135deg, color-mix(in srgb, var(--zaz-accent) 14%, transparent) 0px, color-mix(in srgb, var(--zaz-accent) 14%, transparent) 1px, transparent 1px, transparent 26px), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
  },
  {
    backgroundImage:
      "radial-gradient(color-mix(in srgb, var(--zaz-accent) 20%, transparent) 1.5px, transparent 1.5px), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
    backgroundSize: "22px 22px, 100% 100%",
  },
  {
    backgroundImage:
      "radial-gradient(circle at 75% 25%, color-mix(in srgb, var(--zaz-accent) 22%, transparent) 0%, transparent 55%), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
  },
  {
    backgroundImage:
      "repeating-radial-gradient(circle at 30% 70%, color-mix(in srgb, var(--zaz-accent) 10%, transparent) 0px, transparent 2px, transparent 20px), linear-gradient(160deg, var(--zaz-surface-alt) 0%, var(--zaz-surface) 100%)",
  },
  {
    backgroundImage:
      "linear-gradient(115deg, var(--zaz-surface-alt) 0%, var(--zaz-surface-alt) 45%, var(--zaz-surface) 55%, var(--zaz-surface) 100%), radial-gradient(circle at 15% 85%, color-mix(in srgb, var(--zaz-accent) 16%, transparent) 0%, transparent 45%)",
  },
];

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getPlaceholderVariant(seed: string) {
  return PLACEHOLDER_VARIANTS[hashString(seed) % PLACEHOLDER_VARIANTS.length];
}

/** Single letterform for the "logo" placeholder presentation — first letter of the label. */
export function getLetterform(label: string): string {
  const trimmed = label.trim();
  return trimmed ? trimmed[0].toUpperCase() : "Z";
}
