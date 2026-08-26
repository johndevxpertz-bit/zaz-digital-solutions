"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { navLinks, ctaLink } from "@/lib/nav";
import { contactInfo } from "@/lib/data/contact";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";
import ThemeToggle from "@/components/ui/ThemeToggle";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Portaled into document.body (see the JSX below for why) rather than
  // rendered in place — `document` doesn't exist during SSR. useSyncExternalStore
  // with a no-op subscribe is the standard way to read "is this the client,
  // post-hydration" without the cascading-render issue a plain useState+useEffect
  // toggle would cause: `false` on the server and on the first client render
  // (identical output, since the panel is invisible either way at that point),
  // `true` on every render after that — the panel opens and closes many times
  // from then on without ever unmounting again.
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

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

  if (!mounted) return null;

  return createPortal(
    <div
      id="mobile-nav"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation"
      // Portaled to document.body: rendered in place, this div was a child
      // of Navbar's <header>, and *any* ancestor with a `transform`,
      // `filter`, `backdrop-filter`, `perspective`, `contain`, or
      // `will-change` on a compositable property becomes the containing
      // block for a `position: fixed` descendant instead of the viewport
      // (CSS spec, not a bug) — e.g. the header very nearly had exactly
      // that from an earlier compositing-hint attempt on that same element.
      // A portal makes this immune to any such property on any ancestor,
      // present or future, rather than requiring everyone who ever touches
      // the header (or anything above it) to remember not to add one.
      //
      // Lenis's own touch handling unconditionally preventDefaults touch
      // gestures while it's stopped (which is exactly the state while this
      // panel is open and page scroll is locked) — this is Lenis's
      // documented opt-out, so touches inside the panel (e.g. scrolling a
      // tall menu on a short screen) aren't swallowed by that.
      data-lenis-prevent
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

        <div
          className={`mt-8 flex flex-wrap items-center gap-4 ${itemMotion(navLinks.length).className}`}
          style={itemMotion(navLinks.length).style}
        >
          <Link
            href={ctaLink.href}
            onClick={onClose}
            className="inline-flex items-center rounded-[var(--zaz-radius-pill)] bg-zaz-accent px-7 py-3 text-sm font-medium text-zaz-bg-deep transition-transform duration-300 hover:-translate-y-0.5"
          >
            {ctaLink.label}
          </Link>
          <a
            href={`tel:${contactInfo.phoneHref}`}
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-[var(--zaz-radius-pill)] border border-zaz-border-strong px-6 py-3 text-sm font-medium text-zaz-text transition-colors duration-300 hover:border-zaz-accent hover:text-zaz-accent"
          >
            <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.6 10.8C8 13.6 10.4 16 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.2 21.4 2.6 13.8 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
            {contactInfo.phone}
          </a>
          <ThemeToggle />
        </div>
      </nav>
    </div>,
    document.body
  );
}
