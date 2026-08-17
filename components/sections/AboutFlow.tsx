import Container from "@/components/ui/Container";
import RevealText from "@/components/ui/RevealText";

const flow = ["Strategy", "Design", "Development", "Growth"];

/**
 * Non-numeric "impact" section — the brief explicitly forbids inventing
 * client counts/revenue/years, so this communicates scale through the
 * process itself (typography + connecting motion) instead of fabricated
 * stats. Connector line reuses the same flowing-dash motif established on
 * the homepage (zaz-dash-flow) so the visual language stays consistent
 * site-wide rather than introducing a new one here.
 */
export default function AboutFlow() {
  return (
    <section className="pb-28">
      <Container>
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-6 text-center sm:gap-x-4">
          {flow.map((word, index) => (
            <div key={word} className="flex items-center gap-x-2 sm:gap-x-4">
              <RevealText
                as="p"
                text={word}
                delay={index * 0.12}
                className="font-heading font-semibold text-zaz-text"
                style={{ fontSize: "var(--zaz-text-h2)" }}
              />
              {index < flow.length - 1 && (
                <svg aria-hidden width="40" height="8" viewBox="0 0 40 8" fill="none" className="shrink-0 opacity-60">
                  <line x1="0" y1="4" x2="40" y2="4" stroke="var(--zaz-border-strong)" strokeWidth="1" />
                  <line
                    x1="0"
                    y1="4"
                    x2="40"
                    y2="4"
                    stroke="var(--zaz-accent)"
                    strokeWidth="1"
                    className="zaz-dash-flow"
                  />
                </svg>
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
