import Reveal from "@/components/ui/Reveal";
import AmbientGlow from "@/components/ui/AmbientGlow";
import type { MarketingCaseStudy } from "@/lib/data/marketingPortfolio";

type MarketingCaseStudyCardProps = {
  name: string;
  caseStudy: MarketingCaseStudy;
};

/**
 * Premium trust-building presentation for a marketing service — objective,
 * approach, and what's tracked — instead of a wall of stock-style images.
 * Process-based, not client-results-based: no numbers are invented here,
 * only how an engagement is actually run.
 */
export default function MarketingCaseStudyCard({ name, caseStudy }: MarketingCaseStudyCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface p-8 sm:p-10">
      <AmbientGlow />
      <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="zaz-label text-zaz-muted">Objective</p>
          <p className="mt-4 font-heading text-2xl font-semibold leading-snug text-zaz-text sm:text-3xl">
            {caseStudy.objective}
          </p>

          <p className="zaz-label mt-10 text-zaz-muted">What we track</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {caseStudy.focusAreas.map((area) => (
              <span
                key={area}
                className="rounded-[var(--zaz-radius-pill)] border border-zaz-border-strong px-3 py-1.5 text-xs font-medium text-zaz-text-secondary"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="zaz-label text-zaz-muted">Our approach — {name}</p>
          <Reveal variant="fade-scale">
            <ol className="mt-4 flex flex-col gap-4">
              {caseStudy.approach.map((step, index) => (
                <li key={step} className="flex items-start gap-4 border-t border-zaz-border pt-4 first:border-t-0 first:pt-0">
                  <span className="zaz-label mt-0.5 shrink-0 text-zaz-accent">{String(index + 1).padStart(2, "0")}</span>
                  <span className="text-sm leading-relaxed text-zaz-text-secondary">{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
