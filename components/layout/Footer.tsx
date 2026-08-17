import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";
import { navLinks } from "@/lib/nav";
import { servicePillars } from "@/lib/data/servicePillars";
import { contactInfo } from "@/lib/data/contact";

export default function Footer({ logoSrc }: { logoSrc: string | null }) {
  return (
    <footer className="border-t border-zaz-border bg-zaz-bg-deep">
      <Container className="grid gap-12 py-20 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo src={logoSrc} imgClassName="h-20 w-auto" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-zaz-text-secondary">
            Logo design, website design, and digital marketing — built as one connected practice.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-zaz-text-secondary">
            <a href={`mailto:${contactInfo.email}`} className="w-fit transition-colors hover:text-zaz-text">
              {contactInfo.email}
            </a>
            <a href={`tel:${contactInfo.phoneHref}`} className="w-fit transition-colors hover:text-zaz-text">
              {contactInfo.phone}
            </a>
            <p>{contactInfo.address}</p>
          </div>
        </div>

        <div>
          <p className="zaz-label mb-5">Explore</p>
          <nav className="grid gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-fit text-sm text-zaz-text-secondary transition-colors hover:text-zaz-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="zaz-label mb-5">Services</p>
          <nav className="grid gap-3">
            {servicePillars.map((pillar) => (
              <Link
                key={pillar.href}
                href={pillar.href}
                className="w-fit text-sm text-zaz-text-secondary transition-colors hover:text-zaz-text"
              >
                {pillar.name}
              </Link>
            ))}
          </nav>
        </div>
      </Container>

      <div className="border-t border-zaz-border">
        <Container className="flex flex-col items-start justify-between gap-3 py-6 text-xs text-zaz-muted sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} ZAZ Digital Solutions. All rights reserved.</p>
          <p>Houston, TX</p>
        </Container>
      </div>
    </footer>
  );
}
