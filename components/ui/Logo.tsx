import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  src: string | null;
  className?: string;
  /** Overrides the rendered image height (width follows automatically to preserve aspect ratio). Defaults to the header/footer size. */
  imgClassName?: string;
};

// Real source file is a stacked mark + two-line wordmark lockup (1402x1122,
// ~1.25:1) — not the thin wide wordmark shape the placeholder sizing assumed.
// Intrinsic width/height below match the actual asset so next/image never
// stretches it; imgClassName only controls the rendered display height.
const LOGO_ASPECT = { width: 175, height: 140 };

/**
 * Renders the official ZAZ logo when it exists at /public/brand.
 * Falls back to a plain text wordmark rather than fabricating a logo —
 * see public/brand/ASSET-REQUIREMENTS.md.
 */
export default function Logo({ src, className, imgClassName }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="ZAZ Digital Solutions — Home"
      className={`inline-flex items-center ${className ?? ""}`}
    >
      {src ? (
        <Image
          src={src}
          alt="ZAZ Digital Solutions"
          width={LOGO_ASPECT.width}
          height={LOGO_ASPECT.height}
          priority
          className={imgClassName ?? "h-16 w-auto"}
        />
      ) : (
        <span className="font-heading text-lg font-semibold tracking-tight text-zaz-text">
          ZAZ
          <span className="text-zaz-accent"> Digital Solutions</span>
        </span>
      )}
    </Link>
  );
}
