export type NavLink = {
  label: string;
  href: string;
  description?: string;
  children?: NavLink[];
};

export const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        label: "Logo Design",
        href: "/services/logo-design",
        description: "Distinct marks built to work everywhere your brand shows up.",
      },
      {
        label: "Website Design",
        href: "/services/website-design",
        description: "Custom and WordPress builds across seven site types.",
      },
      {
        label: "Digital Marketing",
        href: "/services/digital-marketing",
        description: "SEO, PPC, social, and Meta Ads built around measurable growth.",
      },
    ],
  },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export const ctaLink: NavLink = { label: "Start a project", href: "/contact" };
