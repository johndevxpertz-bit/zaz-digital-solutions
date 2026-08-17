type AmbientGlowProps = {
  className?: string;
  /** Adds the same faint grid texture used in the hero, for sections that want a touch more depth. */
  grid?: boolean;
};

/**
 * Reusable decorative atmosphere layer — two slow-floating glow blobs on the
 * existing accent token, optionally a faint grid texture. Pure CSS (the
 * zaz-float-a/zaz-float-b keyframes in globals.css), so this stays a plain
 * server component — no JS needed, and prefers-reduced-motion is already
 * handled globally for any `animation`. Kept deliberately subtle (low
 * opacity) per the "elegant, not flashy" brief.
 */
export default function AmbientGlow({ className, grid = false }: AmbientGlowProps) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 -z-10 overflow-hidden ${className ?? ""}`}>
      <div
        className="zaz-float-a absolute -left-[10%] top-[5%] h-[50vh] w-[50vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)",
          opacity: 0.06,
        }}
      />
      <div
        className="zaz-float-b absolute -right-[10%] bottom-[0%] h-[45vh] w-[45vh] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)",
          opacity: 0.05,
        }}
      />
      {grid && (
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--zaz-text) 1px, transparent 1px), linear-gradient(90deg, var(--zaz-text) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 50%, black 0%, transparent 75%)",
          }}
        />
      )}
    </div>
  );
}
