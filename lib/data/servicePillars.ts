export type ServicePillarIcon = "mark" | "browser" | "bars";

export type ServicePillar = {
  number: string;
  name: string;
  href: string;
  description: string;
  icon: ServicePillarIcon;
};

export const servicePillars: ServicePillar[] = [
  {
    number: "01",
    name: "Logo Design",
    href: "/services/logo-design",
    description:
      "Distinct marks built to work everywhere your brand shows up — from wordmarks to emblems, across seven logo styles.",
    icon: "mark",
  },
  {
    number: "02",
    name: "Website Design",
    href: "/services/website-design",
    description:
      "Custom-coded or WordPress builds across seven site types, with page-based packages that scale as your needs grow.",
    icon: "browser",
  },
  {
    number: "03",
    name: "Digital Marketing",
    href: "/services/digital-marketing",
    description:
      "SEO, Google Ads, social media, and Meta Ads built around visibility, traffic, and qualified leads.",
    icon: "bars",
  },
];
