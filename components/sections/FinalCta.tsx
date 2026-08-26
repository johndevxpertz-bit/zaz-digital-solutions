import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Button from "@/components/ui/Button";
import AmbientGlow from "@/components/ui/AmbientGlow";

export default function FinalCta() {
  return (
    <section className="py-32">
      <Container>
        <Reveal variant="clip-reveal">
          <div className="relative overflow-hidden rounded-[var(--zaz-radius)] border border-zaz-border bg-zaz-surface px-8 py-20 text-center">
            <AmbientGlow grid />
            <span
              aria-hidden
              className="zaz-glow-pulse pointer-events-none absolute inset-0 -z-10"
              style={{
                background:
                  "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(var(--zaz-accent-rgb),0.08) 0%, transparent 70%)",
              }}
            />

            <h2
              className="mx-auto max-w-2xl font-heading font-semibold text-zaz-text"
              style={{ fontSize: "var(--zaz-text-h1)" }}
            >
              Let&apos;s build something premium.
            </h2>
            <p
              className="mx-auto mt-5 max-w-lg text-zaz-text-secondary"
              style={{ fontSize: "var(--zaz-text-body-lg)" }}
            >
              Tell us about the project — logo, website, marketing, or all three.
            </p>
            <div className="mt-10 flex justify-center">
              <Button href="/contact" variant="primary">
                Start a project
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
