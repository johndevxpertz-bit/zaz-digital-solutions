export type ServiceGlyphIcon = "mark" | "browser" | "bars";

/**
 * Small abstract glyphs — letterform / browser chrome / signal bars — used
 * as a visual anchor wherever a service/discipline needs a compact icon
 * without a real logo or invented iconography. Extracted from ServicesIntro
 * so the About page's capability grid can reuse the exact same visual
 * language instead of introducing new icon shapes.
 */
export default function ServiceGlyph({ icon }: { icon: ServiceGlyphIcon }) {
  if (icon === "mark") {
    return (
      <span
        aria-hidden
        className="flex h-11 w-11 items-center justify-center rounded-full border border-zaz-border-strong font-heading text-lg font-semibold text-zaz-accent"
      >
        Z
      </span>
    );
  }

  if (icon === "browser") {
    return (
      <span aria-hidden className="flex h-11 w-11 flex-col overflow-hidden rounded-[6px] border border-zaz-border-strong">
        <span className="flex h-3 shrink-0 items-center gap-1 border-b border-zaz-border-strong bg-zaz-surface-alt px-1.5">
          <span className="h-[3px] w-[3px] rounded-full bg-zaz-muted" />
          <span className="h-[3px] w-[3px] rounded-full bg-zaz-muted" />
          <span className="h-[3px] w-[3px] rounded-full bg-zaz-muted" />
        </span>
        <span className="flex-1 bg-zaz-surface" />
      </span>
    );
  }

  return (
    <span aria-hidden className="flex h-11 w-11 items-end gap-1 rounded-full border border-zaz-border-strong px-2.5 py-2">
      {[40, 70, 55, 90].map((height, index) => (
        <span
          key={index}
          className="flex-1 rounded-sm bg-zaz-accent"
          style={{ height: `${height}%`, opacity: 0.55 + index * 0.12 }}
        />
      ))}
    </span>
  );
}
