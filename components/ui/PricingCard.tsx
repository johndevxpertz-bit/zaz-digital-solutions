"use client";

import Button from "@/components/ui/Button";
import { useTilt } from "@/lib/animation/useTilt";

type PricingCardProps = {
  name: string;
  price: number;
  priceSuffix?: string;
  features: string[];
  highlighted?: boolean;
  footnote?: string;
  ctaHref?: string;
  ctaLabel?: string;
};

export default function PricingCard({
  name,
  price,
  priceSuffix,
  features,
  highlighted,
  footnote,
  ctaHref,
  ctaLabel,
}: PricingCardProps) {
  const tiltRef = useTilt<HTMLDivElement>({ max: 6, scale: 1.015 });

  return (
    <div
      ref={tiltRef}
      className={`relative flex h-full flex-col rounded-[var(--zaz-radius)] border p-7 transition-shadow duration-300 will-change-transform ${
        highlighted
          ? "border-zaz-accent bg-zaz-card shadow-[0_20px_50px_-24px_rgba(var(--zaz-accent-rgb),0.4)]"
          : "border-zaz-border bg-zaz-surface hover:border-zaz-accent-dim hover:shadow-[0_20px_40px_-26px_rgba(var(--zaz-accent-rgb),0.25)]"
      }`}
    >
      {highlighted && (
        <span
          aria-hidden
          className="zaz-glow-pulse pointer-events-none absolute -inset-px -z-10 rounded-[var(--zaz-radius)] blur-xl"
          style={{ boxShadow: "0 0 60px 10px rgba(var(--zaz-accent-rgb), 0.12)" }}
        />
      )}

      {highlighted && <span className="zaz-label mb-4 text-zaz-accent">Most popular</span>}

      <h3 className="font-heading text-lg font-semibold text-zaz-text">{name}</h3>

      <p className="mt-4 flex items-baseline gap-1.5">
        <span className="font-heading text-4xl font-semibold text-zaz-text">
          ${price.toLocaleString("en-US")}
        </span>
        {priceSuffix && <span className="text-sm text-zaz-text-secondary">{priceSuffix}</span>}
      </p>

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm text-zaz-text-secondary">
            <span aria-hidden className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zaz-accent" />
            {feature}
          </li>
        ))}
      </ul>

      {footnote && <p className="mt-6 text-xs text-zaz-muted">{footnote}</p>}

      {ctaHref && (
        <Button href={ctaHref} variant={highlighted ? "primary" : "secondary"} className="mt-7 w-full">
          {ctaLabel ?? "Start a project"}
        </Button>
      )}
    </div>
  );
}
