/**
 * Thin connecting thread placed between major homepage sections whose
 * combined top/bottom padding otherwise leaves a bare, disconnected gap —
 * reuses the same "flowing light trail" motif as HomeHeroVisual's connector
 * lines (zaz-dash-flow) so the page reads as one continuous system rather
 * than stacked blocks. Pure CSS/SVG, no JS, respects prefers-reduced-motion
 * via the existing global animation-duration override.
 */
export default function SectionSeam() {
  return (
    <div aria-hidden className="pointer-events-none relative z-10 h-0">
      <svg
        viewBox="0 0 2 220"
        preserveAspectRatio="none"
        className="absolute left-1/2 top-1/2 h-[220px] w-[2px] -translate-x-1/2 -translate-y-1/2 overflow-visible"
      >
        <line x1="1" y1="0" x2="1" y2="220" stroke="var(--zaz-border-strong)" strokeWidth="1" />
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="220"
          stroke="var(--zaz-accent)"
          strokeWidth="1"
          strokeOpacity="0.6"
          className="zaz-dash-flow"
        />
        <circle cx="1" cy="110" r="2" fill="var(--zaz-accent)" className="zaz-glow-pulse" />
      </svg>
    </div>
  );
}
