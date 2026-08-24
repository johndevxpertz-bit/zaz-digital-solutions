"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MobileNav from "@/components/layout/MobileNav";
import { navLinks, ctaLink } from "@/lib/nav";
import { contactInfo } from "@/lib/data/contact";

export default function Navbar({ logoSrc }: { logoSrc: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // The desktop "Services" dropdown used to be driven purely by CSS
  // `:hover`/`:focus-within` — no single source of truth for "is it open".
  // That's exactly why it misbehaved: clicking the trigger focuses it, and
  // `:focus-within` then keeps the panel visible regardless of the mouse
  // leaving, with no click handler to ever toggle it closed again. One
  // piece of state, updated by hover, focus, click, and outside-click,
  // replaces all of that with a single deterministic open/closed value.
  const [servicesOpen, setServicesOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);

  // Outside click closes the dropdown regardless of how it was opened.
  useEffect(() => {
    if (!servicesOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!servicesRef.current?.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [servicesOpen]);
  // Stable identity across re-renders (e.g. the scroll listener flipping
  // `scrolled`) — MobileNav's scroll-lock effect depends on this prop, and a
  // fresh closure every render would re-run that effect (unlock then
  // re-lock) on every unrelated Navbar re-render while the menu is open.
  const closeMobileNav = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-[var(--zaz-ease)] ${
        scrolled
          ? "border-b border-zaz-border bg-zaz-bg-deep/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <Container className="flex h-24 items-center justify-between">
        <Logo src={logoSrc} imgClassName="h-[70.4px] w-auto" />

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div
                key={link.href}
                ref={servicesRef}
                className="group relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
                onFocus={() => setServicesOpen(true)}
                onBlur={(event) => {
                  // Only close when focus leaves the whole trigger+panel
                  // region — not when it merely moves from the trigger to a
                  // link inside the dropdown (still a descendant).
                  if (!event.currentTarget.contains(event.relatedTarget as Node)) {
                    setServicesOpen(false);
                  }
                }}
              >
                <Link
                  href={link.href}
                  aria-haspopup="true"
                  aria-expanded={servicesOpen}
                  onClick={() => setServicesOpen(false)}
                  className="flex items-center gap-1.5 text-sm font-medium text-zaz-text-secondary transition-colors duration-200 hover:text-zaz-text"
                >
                  {link.label}
                  <svg
                    aria-hidden
                    width="9"
                    height="6"
                    viewBox="0 0 9 6"
                    fill="none"
                    className={`mt-px transition-transform duration-200 ease-[var(--zaz-ease)] ${servicesOpen ? "-rotate-180" : ""}`}
                  >
                    <path d="M1 1L4.5 5L8 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </Link>

                <div
                  className={`absolute left-1/2 top-full w-[420px] -translate-x-1/2 pt-4 transition-all duration-300 ease-[var(--zaz-ease)] ${
                    servicesOpen ? "visible translate-y-0 opacity-100" : "invisible translate-y-1 opacity-0"
                  }`}
                >
                  <div className="grid gap-1 rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
                    {link.children.map((child, childIndex) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setServicesOpen(false)}
                        className={`block rounded-[var(--zaz-radius-sm)] p-3 transition-all duration-300 ease-[var(--zaz-ease)] hover:bg-zaz-surface-alt ${
                          servicesOpen ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
                        }`}
                        style={{ transitionDelay: servicesOpen ? `${childIndex * 50}ms` : "0ms" }}
                      >
                        <span className="block text-sm font-medium text-zaz-text">{child.label}</span>
                        {child.description && (
                          <span className="mt-1 block text-xs leading-relaxed text-zaz-text-secondary">
                            {child.description}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-zaz-text-secondary transition-colors duration-200 hover:text-zaz-text"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <a
            href={`tel:${contactInfo.phoneHref}`}
            aria-label={`Call us at ${contactInfo.phone}`}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zaz-border-strong text-zaz-text-secondary transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4"
          >
            <svg aria-hidden width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6.6 10.8C8 13.6 10.4 16 13.2 17.4L15.4 15.2C15.7 14.9 16.1 14.8 16.5 14.9C17.7 15.3 19 15.5 20.3 15.5C20.9 15.5 21.4 16 21.4 16.6V20.3C21.4 20.9 20.9 21.4 20.3 21.4C10.2 21.4 2.6 13.8 2.6 3.7C2.6 3.1 3.1 2.6 3.7 2.6H7.4C8 2.6 8.5 3.1 8.5 3.7C8.5 5 8.7 6.3 9.1 7.5C9.2 7.9 9.1 8.3 8.8 8.6L6.6 10.8Z"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <Button href={ctaLink.href} variant="secondary">
            {ctaLink.label}
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
          onClick={() => setMobileOpen((value) => !value)}
          className="relative z-50 flex h-10 w-10 touch-manipulation flex-col items-center justify-center gap-1.5 pointer-events-auto md:hidden"
        >
          <span
            className={`h-px w-6 bg-zaz-text transition-transform duration-300 ease-[var(--zaz-ease)] ${
              mobileOpen ? "translate-y-[3.5px] rotate-45" : ""
            }`}
          />
          <span
            className={`h-px w-6 bg-zaz-text transition-transform duration-300 ease-[var(--zaz-ease)] ${
              mobileOpen ? "-translate-y-[3.5px] -rotate-45" : ""
            }`}
          />
        </button>
      </Container>

      <MobileNav open={mobileOpen} onClose={closeMobileNav} />
    </header>
  );
}
