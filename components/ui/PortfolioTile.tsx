import Image from "next/image";
import { getPlaceholderVariant, getLetterform } from "@/lib/placeholderVariants";

type PortfolioTileProps = {
  /** Path relative to /public — used only as the placeholder pattern seed. */
  src: string;
  /** Public URL if the real asset exists, resolved server-side; null renders the placeholder. */
  resolvedSrc: string | null;
  alt: string;
  label?: string;
  sizes?: string;
  /** Extra classes merged onto the rendered image/placeholder (e.g. hover-zoom transitions). */
  className?: string;
  /** "logo" centers a single-letterform badge instead of the corner caption — a logo slot should read as a logo slot, not a screenshot slot. */
  presentation?: "photo" | "logo";
};

/**
 * Client-safe twin of MediaSlot for contexts (like paginated grids) that need
 * client-side rendering: takes an already-resolved src instead of touching
 * `node:fs` itself, but renders identically — same placeholder patterns via
 * the shared lib/placeholderVariants module, same "never a broken image"
 * guarantee.
 */
export default function PortfolioTile({
  src,
  resolvedSrc,
  alt,
  label,
  sizes,
  className,
  presentation = "photo",
}: PortfolioTileProps) {
  if (resolvedSrc) {
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
            <Image
              src={resolvedSrc}
              alt={alt}
              fill
              sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
              className="object-contain"
            />
          </div>
        </div>
      );
    }

    return (
      <Image
        src={resolvedSrc}
        alt={alt}
        fill
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
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
