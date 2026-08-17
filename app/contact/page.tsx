import type { Metadata } from "next";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/sections/ContactForm";
import { contactInfo } from "@/lib/data/contact";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start a logo design, website design, or digital marketing project with ZAZ Digital Solutions.",
};

export default function ContactPage() {
  return (
    <section className="pt-40 pb-32 lg:flex lg:min-h-[100svh] lg:items-center lg:pb-24 lg:pt-32">
      <Container>
        <Reveal immediate>
          <SectionHeading
            kicker="Get in touch"
            title="Let's build something premium."
            description="Tell us about the project — logo, website, marketing, or all three — and we'll follow up to talk scope."
          />
        </Reveal>

        <div className="mt-16 grid gap-16 lg:grid-cols-[1.4fr_1fr]">
          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.18} variant="fade-scale">
            <div className="rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8">
              <p className="zaz-label mb-6">Direct</p>
              <dl className="grid gap-5 text-sm">
                <div>
                  <dt className="text-zaz-muted">Email</dt>
                  <dd className="mt-1">
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-zaz-text transition-colors duration-200 hover:text-zaz-accent"
                    >
                      {contactInfo.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-zaz-muted">Phone</dt>
                  <dd className="mt-1">
                    <a
                      href={`tel:${contactInfo.phoneHref}`}
                      className="text-zaz-text transition-colors duration-200 hover:text-zaz-accent"
                    >
                      {contactInfo.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-zaz-muted">Address</dt>
                  <dd className="mt-1 text-zaz-text">{contactInfo.address}</dd>
                </div>
              </dl>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
