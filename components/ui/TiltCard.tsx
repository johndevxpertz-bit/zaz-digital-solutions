"use client";

import { useTilt } from "@/lib/animation/useTilt";

type TiltCardProps = {
  children: React.ReactNode;
  className?: string;
  max?: number;
  scale?: number;
};

/**
 * Thin client wrapper around useTilt so server components (ServicesIntro,
 * WhyZaz, etc.) can drop tilt onto a card without becoming client components
 * themselves — same composition pattern already used for Reveal.
 */
export default function TiltCard({ children, className = "", max, scale }: TiltCardProps) {
  const ref = useTilt<HTMLDivElement>({ max, scale });
  return (
    <div ref={ref} className={`h-full will-change-transform ${className}`}>
      {children}
    </div>
  );
}
