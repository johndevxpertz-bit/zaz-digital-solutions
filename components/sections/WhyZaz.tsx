import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import AmbientGlow from "@/components/ui/AmbientGlow";

const reasons = [
  {
    name: "Three disciplines, one team",
    description:
      "Logo, website, and marketing handled without handoffs between vendors — one team that stays accountable end to end.",
  },
  {
    name: "WordPress or fully custom-coded",
    description: "The right foundation for your budget and goals — not a one-size-fits-all platform.",
  },
  {
    name: "Built to be found",
    description: "SEO and performance are considered from day one, not bolted on after launch.",
  },
  {
    name: "Transparent, structured pricing",
    description:
      "Every package is scoped and priced up front through one centralized system — not quoted in the dark.",
  },
];

export default function WhyZaz() {
  return (
    <section className="relative py-28">
      <AmbientGlow />
      <Container>
        <Reveal>
          <SectionHeading kicker="Why ZAZ" title="A studio built around follow-through." className="mb-14" />
        </Reveal>

        <div className="grid gap-px overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-border sm:grid-cols-2">
          {reasons.map((reason, index) => (
            <Reveal
              key={reason.name}
              delay={index * 0.06}
              variant="blur-up"
              className="bg-zaz-bg-deep p-8 transition-colors duration-300 hover:bg-zaz-surface"
            >
              <h3 className="font-heading text-lg font-semibold text-zaz-text">{reason.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zaz-text-secondary">{reason.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
