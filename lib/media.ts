import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

/**
 * Resolves an exact path under /public to its public URL, or null if the file
 * isn't there yet. Never fabricates a fallback — callers decide what to render
 * when the asset is missing (see components/ui/MediaSlot.tsx).
 */
export function resolveMediaAsset(relativePath: string): string | null {
  const normalized = relativePath.replace(/^\/+/, "");
  if (!existsSync(path.join(process.cwd(), "public", normalized))) return null;
  // Every caller renders this via next/image, which does its own URL
  // encoding of the src it's given — so this stays a plain (unencoded)
  // path, even for real filenames with spaces/parens in
  // public/portfolio/logos/more logos/. Pre-encoding here would double-encode.
  return `/${normalized}`;
}

const ANIMATED_LOGO_DIR = "portfolio/logos/Animated logos";
const SUPPORTED_VIDEO_EXTENSIONS = new Set([".mp4", ".webm"]);

export type AnimatedLogoAsset = {
  id: string;
  title: string;
  src: string;
  type: string;
};

function walkFiles(dir: string): string[] {
  let results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walkFiles(full));
    } else {
      results.push(full);
    }
  }
  return results;
}

/**
 * Recursively scans public/portfolio/logos/Animated logos/ for real video
 * files and returns them as portfolio items — no placeholders, no fabricated
 * entries. Unsupported formats (anything not .mp4/.webm, the two formats
 * <video> can play across current browsers) are skipped rather than crashing
 * the rest of the portfolio. Source filenames are never surfaced in the UI
 * (several were scraped from Pinterest and carry unrelated third-party
 * text) — titles are generated the same way every other logo category
 * numbers its items.
 */
export function getAnimatedLogoAssets(): AnimatedLogoAsset[] {
  const absDir = path.join(process.cwd(), "public", ANIMATED_LOGO_DIR);
  if (!existsSync(absDir)) return [];

  const videoFiles = walkFiles(absDir)
    .filter((f) => SUPPORTED_VIDEO_EXTENSIONS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  return videoFiles.map((absPath, index) => {
    const relPath = path.relative(path.join(process.cwd(), "public"), absPath);
    const urlPath = relPath
      .split(path.sep)
      .map((segment) => encodeURIComponent(segment))
      .join("/");
    const number = String(index + 1).padStart(2, "0");
    return {
      id: `animated-logo-${number}`,
      title: `Animated Logo ${number}`,
      src: `/${urlPath}`,
      type: `video/${path.extname(absPath).slice(1).toLowerCase()}`,
    };
  });
}
