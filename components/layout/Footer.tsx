import Link from "next/link";
import Logo from "@/components/ui/Logo";
import Container from "@/components/ui/Container";
import { navLinks } from "@/lib/nav";
import { servicePillars } from "@/lib/data/servicePillars";
import { contactInfo } from "@/lib/data/contact";

// Same circular icon-button treatment as the Navbar's phone link — a
// consistent "small outline glyph in a bordered circle" pattern already
// established elsewhere in the site, not a new visual language.
const socialLinkClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-zaz-border-strong text-zaz-text-secondary transition-colors duration-200 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4";

const socialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/zazdigitalsolutions?igsi=MTBjMXhuenNjN2g2aA==",
    icon: (
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61587543749336",
    icon: (
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 8.5h2V5.2c-.35-.05-1.55-.15-2.95-.15-2.92 0-4.92 1.83-4.92 5.2v2.75H6.2v3.7h2.93V21.5h3.7v-8.8h2.82l.45-3.7h-3.27V10.6c0-1.07.29-1.8 1.87-1.8Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function Footer({ logoSrc }: { logoSrc: string | null }) {
  return (
    <footer className="border-t border-zaz-border bg-zaz-bg-deep">
      <Container className="grid gap-12 py-20 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Logo src={logoSrc} imgClassName="h-[104px] w-auto" />
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
          <div className="mt-6 flex items-center gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Follow ZAZ Digital Solutions on ${social.label} — opens in a new tab`}
                className={socialLinkClass}
              >
                {social.icon}
              </a>
            ))}
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
