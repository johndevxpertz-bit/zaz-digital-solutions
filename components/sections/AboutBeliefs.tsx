import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import Reveal from "@/components/ui/Reveal";
import TiltCard from "@/components/ui/TiltCard";

const beliefs = [
  {
    number: "01",
    name: "Strategy First",
    description: "Every project starts with understanding the business and its goals — not a template.",
  },
  {
    number: "02",
    name: "Design With Purpose",
    description: "Design should not just look good — it should communicate and convert.",
  },
  {
    number: "03",
    name: "Technology That Performs",
    description: "Websites should be fast, scalable, responsive, and easy to use.",
  },
  {
    number: "04",
    name: "Built For Growth",
    description: "The final product should help the business grow, not just exist online.",
  },
];

export default function AboutBeliefs() {
  return (
    <section className="pb-28">
      <Container>
        <Reveal>
          <SectionHeading kicker="What we believe" title="Principles, not a pitch deck." className="mb-14" />
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2">
          {beliefs.map((belief, index) => (
            <Reveal key={belief.name} delay={index * 0.07} variant="fade-scale">
              <TiltCard max={5} scale={1.015}>
                <div className="group h-full rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8 transition-all duration-300 hover:border-zaz-accent hover:shadow-[0_20px_45px_-26px_rgba(216,211,200,0.3)]">
                  <span className="zaz-label text-zaz-muted transition-colors duration-300 group-hover:text-zaz-accent">
                    {belief.number}
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-zaz-text">{belief.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zaz-text-secondary">{belief.description}</p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
