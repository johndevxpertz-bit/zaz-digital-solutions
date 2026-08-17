"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { navLinks, ctaLink } from "@/lib/nav";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // Reset the accordion when the nav closes (including via the hamburger
  // toggle in Navbar, which changes `open` directly without calling
  // onClose). Adjusted during render rather than in an effect, per
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (!open) setExpanded(null);
  }

  useEffect(() => {
    if (!open) return;

    firstLinkRef.current?.focus();
    lockPageScroll();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      unlockPageScroll();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  // Re-toggling zaz-nav-item-enter (added only while open) restarts the CSS
  // entrance animation each time the menu opens, instead of only playing once.
  function itemMotion(index: number) {
    return {
      className: open ? "zaz-nav-item-enter" : "opacity-0",
      style: open ? { animationDelay: `${index * 60}ms` } : undefined,
    };
  }

  return (
    <div
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      className={`fixed inset-0 z-40 flex flex-col overflow-y-auto bg-zaz-bg-deep transition-opacity duration-300 ease-[var(--zaz-ease)] md:hidden ${
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <nav
        className={`flex flex-1 flex-col items-start justify-center gap-2 px-8 py-24 transition-transform duration-500 ease-[var(--zaz-ease)] ${
          open ? "translate-y-0" : "translate-y-4"
        }`}
      >
        {navLinks.map((link, index) =>
          link.children ? (
            <div key={link.href} className={`w-full py-1.5 ${itemMotion(index).className}`} style={itemMotion(index).style}>
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={link.href}
                  ref={index === 0 ? firstLinkRef : undefined}
                  onClick={onClose}
                  className="font-heading text-4xl font-medium text-zaz-text transition-colors hover:text-zaz-accent"
                >
                  {link.label}
                </Link>
                <button
                  type="button"
                  aria-label={expanded === link.href ? `Collapse ${link.label}` : `Expand ${link.label}`}
                  aria-expanded={expanded === link.href}
                  onClick={() => setExpanded((current) => (current === link.href ? null : link.href))}
                  className="flex h-10 w-10 shrink-0 items-center justify-center text-zaz-text-secondary"
                >
                  <svg
                    aria-hidden
                    width="14"
                    height="9"
                    viewBox="0 0 14 9"
                    fill="none"
                    className={`transition-transform duration-300 ease-[var(--zaz-ease)] ${
                      expanded === link.href ? "-rotate-180" : ""
                    }`}
                  >
                    <path d="M1 1L7 7.5L13 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-[var(--zaz-ease)] ${
                  expanded === link.href ? "mt-3 max-h-60 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="flex flex-col gap-4 pb-2 pl-1">
                  {link.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onClose}
                      className="text-lg text-zaz-text-secondary transition-colors hover:text-zaz-accent"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Link
              key={link.href}
              href={link.href}
              ref={index === 0 ? firstLinkRef : undefined}
              onClick={onClose}
              className={`py-1.5 font-heading text-4xl font-medium text-zaz-text transition-colors hover:text-zaz-accent ${itemMotion(index).className}`}
              style={itemMotion(index).style}
            >
              {link.label}
            </Link>
          )
        )}

        <Link
          href={ctaLink.href}
          onClick={onClose}
          className={`mt-8 inline-flex items-center rounded-[var(--zaz-radius-pill)] bg-zaz-accent px-7 py-3 text-sm font-medium text-zaz-bg-deep transition-transform duration-300 hover:-translate-y-0.5 ${
            itemMotion(navLinks.length).className
          }`}
          style={itemMotion(navLinks.length).style}
        >
          {ctaLink.label}
        </Link>
      </nav>
    </div>
  );
}
