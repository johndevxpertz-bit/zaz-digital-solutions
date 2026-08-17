"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import MobileNav from "@/components/layout/MobileNav";
import { navLinks, ctaLink } from "@/lib/nav";

export default function Navbar({ logoSrc }: { logoSrc: string | null }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
        <Logo src={logoSrc} />

        <nav className="hidden items-center gap-9 md:flex">
          {navLinks.map((link) =>
            link.children ? (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1.5 text-sm font-medium text-zaz-text-secondary transition-colors duration-200 hover:text-zaz-text"
                >
                  {link.label}
                  <svg
                    aria-hidden
                    width="9"
                    height="6"
                    viewBox="0 0 9 6"
                    fill="none"
                    className="mt-px transition-transform duration-200 ease-[var(--zaz-ease)] group-hover:-rotate-180 group-focus-within:-rotate-180"
                  >
                    <path d="M1 1L4.5 5L8 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </Link>

                <div className="invisible absolute left-1/2 top-full w-[420px] -translate-x-1/2 translate-y-1 pt-4 opacity-0 transition-all duration-300 ease-[var(--zaz-ease)] group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="grid gap-1 rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-md">
                    {link.children.map((child, childIndex) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block translate-y-1 rounded-[var(--zaz-radius-sm)] p-3 opacity-0 transition-all duration-300 ease-[var(--zaz-ease)] hover:bg-zaz-surface-alt group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                        style={{ transitionDelay: `${childIndex * 50}ms` }}
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

        <div className="hidden md:block">
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
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
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

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
