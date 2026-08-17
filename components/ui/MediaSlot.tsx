import Image from "next/image";
import { resolveMediaAsset } from "@/lib/media";
import { getPlaceholderVariant, getLetterform } from "@/lib/placeholderVariants";

type MediaSlotProps = {
  /** Path relative to /public, e.g. "portfolio/logos/wordmark-01.jpg" */
  src: string;
  alt: string;
  /** Fallback caption shown when the real asset is missing. Defaults to alt. */
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** "logo" centers a single-letterform badge instead of the corner caption — a logo slot should read as a logo slot, not a screenshot slot. */
  presentation?: "photo" | "logo";
};

/**
 * Resolves a media asset and renders it, or falls back to a generated CSS
 * placeholder — never a broken <img>, a stock photo, or a fabricated logo.
 * Requires a positioned parent with a defined size (e.g. an aspect-ratio wrapper).
 */
export default function MediaSlot({
  src,
  alt,
  label,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  presentation = "photo",
}: MediaSlotProps) {
  const resolved = resolveMediaAsset(src);

  if (resolved) {
    if (presentation === "logo") {
      // Logo marks must never be cropped or stretched — contain on a neutral
      // card surface so the full mark (including any wordmark beneath an
      // icon) stays visible regardless of the source file's own aspect ratio.
      return (
        <div
          className={`relative flex h-full w-full items-center justify-center overflow-hidden p-6 ${className ?? ""}`}
          style={{ backgroundColor: "var(--zaz-text)" }}
        >
          <div className="relative h-full w-full">
            <Image src={resolved} alt={alt} fill sizes={sizes} priority={priority} className="object-contain" />
          </div>
        </div>
      );
    }

    return (
      <Image
        src={resolved}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className ?? ""}`}
      />
    );
  }

  const variant = getPlaceholderVariant(src);

  if (presentation === "logo") {
    return (
      <div
        className={`relative flex h-full w-full items-center justify-center overflow-hidden border border-zaz-border ${className ?? ""}`}
        style={{ backgroundImage: variant.backgroundImage, backgroundSize: variant.backgroundSize }}
      >
        <span
          aria-hidden
          className="flex h-14 w-14 items-center justify-center rounded-full border border-zaz-border-strong bg-zaz-bg-deep/50 font-heading text-xl font-semibold text-zaz-accent backdrop-blur-sm"
        >
          {getLetterform(label ?? alt)}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex h-full w-full items-end overflow-hidden border border-zaz-border ${className ?? ""}`}
      style={{ backgroundImage: variant.backgroundImage, backgroundSize: variant.backgroundSize }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
        style={{
          backgroundImage: "linear-gradient(to top, var(--zaz-bg-deep) 0%, transparent 100%)",
          opacity: 0.75,
        }}
      />
      <span className="zaz-label relative px-4 py-3">{label ?? alt}</span>
    </div>
  );
}
