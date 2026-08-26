"use client";

import { useTheme } from "@/components/layout/ThemeProvider";

type ThemeToggleProps = {
  className?: string;
};

/**
 * Same circular icon-button treatment used elsewhere (Navbar's phone link,
 * Footer's social icons) — h-10 w-10, bordered circle, accent on hover —
 * so this reads as part of the existing chrome rather than a new control
 * style. Icon shown is the destination: a sun while in dark mode (click to
 * go light), a moon while in light mode (click to go dark).
 */
export default function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full border border-zaz-border-strong text-zaz-text-secondary transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 ${className ?? ""}`}
    >
      {isDark ? (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M12 2.5V5M12 19V21.5M21.5 12H19M5 12H2.5M18.36 5.64L16.6 7.4M7.4 16.6L5.64 18.36M18.36 18.36L16.6 16.6M7.4 7.4L5.64 5.64"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M20.5 14.2A8.5 8.5 0 1 1 9.8 3.5a7 7 0 0 0 10.7 10.7Z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
