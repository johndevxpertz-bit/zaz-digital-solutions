"use client";

import Link from "next/link";
import useMagnetic from "@/lib/animation/useMagnetic";

type ButtonProps = {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2 rounded-[var(--zaz-radius-pill)] px-7 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-[var(--zaz-ease)] hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

const variants = {
  primary:
    "bg-zaz-accent text-zaz-bg-deep hover:bg-zaz-accent-dim hover:shadow-[0_12px_30px_-10px_rgba(var(--zaz-accent-rgb),0.55)]",
  secondary:
    "border border-zaz-border-strong text-zaz-text hover:border-zaz-accent hover:text-zaz-accent hover:shadow-[0_12px_26px_-14px_rgba(var(--zaz-accent-rgb),0.35)]",
};

export default function Button({
  children,
  href,
  variant = "primary",
  className,
  onClick,
  type = "button",
  disabled,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${className ?? ""}`;
  const magneticRef = useMagnetic<HTMLAnchorElement | HTMLButtonElement>({
    strength: 8,
    enabled: variant === "primary",
    liftOnHover: variant === "primary" ? 2 : 0,
  });

  if (href) {
    return (
      <Link ref={magneticRef as React.Ref<HTMLAnchorElement>} href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      ref={magneticRef as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
