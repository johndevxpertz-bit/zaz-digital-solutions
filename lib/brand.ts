import { resolveMediaAsset } from "@/lib/media";

const CANDIDATE_EXTENSIONS = ["svg", "png"] as const;

/**
 * Resolves a brand asset under /public/brand (preferring .svg, falling back to .png).
 * Returns the public URL, or null if the file isn't there yet — never fabricates one.
 */
export function resolveBrandAsset(baseName: string): string | null {
  for (const ext of CANDIDATE_EXTENSIONS) {
    const resolved = resolveMediaAsset(`brand/${baseName}.${ext}`);
    if (resolved) return resolved;
  }
  return null;
}
