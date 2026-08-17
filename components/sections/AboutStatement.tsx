import Container from "@/components/ui/Container";
import RevealText from "@/components/ui/RevealText";
import AmbientGlow from "@/components/ui/AmbientGlow";

/**
 * One large scroll-revealed typographic moment — distinct wording from the
 * hero's blockquote so it reads as its own "wow" beat further down the page
 * rather than a repeat. Two-stage word-stagger reveal (RevealText), each
 * line triggering independently as it enters view.
 */
export default function AboutStatement() {
  return (
    <section className="relative py-28">
      <AmbientGlow grid />
      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <RevealText
            as="h2"
            text="We don't just build digital experiences."
            className="font-heading font-semibold text-zaz-muted"
            style={{ fontSize: "var(--zaz-text-h1)" }}
          />
          <RevealText
            as="h2"
            text="We build digital presence with purpose."
            delay={0.15}
            className="mt-2 font-heading font-semibold text-zaz-text"
            style={{ fontSize: "var(--zaz-text-h1)" }}
          />
        </div>
      </Container>
    </section>
  );
}
