import RevealText from "@/components/ui/RevealText";

type SectionHeadingProps = {
  kicker?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
};

export default function SectionHeading({
  kicker,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""} ${className ?? ""}`}>
      {kicker && <p className="zaz-label mb-4">{kicker}</p>}
      <RevealText
        as="h2"
        text={title}
        delay={0.1}
        className="font-heading font-semibold text-zaz-text"
        style={{ fontSize: "var(--zaz-text-h1)" }}
      />
      {description && (
        <p className="mt-5 text-zaz-text-secondary" style={{ fontSize: "var(--zaz-text-body-lg)" }}>
          {description}
        </p>
      )}
    </div>
  );
}
