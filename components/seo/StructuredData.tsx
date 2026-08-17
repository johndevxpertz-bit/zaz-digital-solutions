import { contactInfo } from "@/lib/data/contact";
import { servicePillars } from "@/lib/data/servicePillars";
import { siteUrl } from "@/lib/site";

// Address components mirror the same source noted in lib/data/contact.ts
// (current live site, as of this build) — restructured for schema.org, not
// re-sourced or invented.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#organization`,
      name: "ZAZ Digital Solutions",
      url: siteUrl,
      description:
        "Premium logo design, website design, and digital marketing for US businesses.",
      email: contactInfo.email,
      telephone: contactInfo.phoneHref,
      address: {
        "@type": "PostalAddress",
        streetAddress: "10878 Westheimer Rd",
        addressLocality: "Houston",
        addressRegion: "TX",
        postalCode: "77042",
        addressCountry: "US",
      },
      areaServed: "US",
      makesOffer: servicePillars.map((pillar) => ({
        "@type": "Offer",
        url: `${siteUrl}${pillar.href}`,
        itemOffered: {
          "@type": "Service",
          name: pillar.name,
          description: pillar.description,
        },
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "ZAZ Digital Solutions",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
