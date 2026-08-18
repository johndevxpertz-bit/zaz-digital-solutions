"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/animation/gsap";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";
import Logo from "@/components/ui/Logo";
import AmbientGlow from "@/components/ui/AmbientGlow";

const SESSION_KEY = "zaz-intro-shown";

/**
 * One-time brand intro on the visitor's first page load per browser session
 * (gated via sessionStorage) — not a per-navigation loading screen, since
 * every route here is prerendered static and navigates instantly; adding an
 * overlay on every route change would only add perceived latency.
 *
 * Rendered unconditionally with display:none baked into the initial markup
 * (server and first client paint match exactly, no hydration mismatch) and
 * controlled purely imperatively via refs/GSAP in one mount effect — no
 * React state — since visibility here depends on a browser-only API
 * (sessionStorage) that can't be read during render.
 */
export default function PageLoader({ logoSrc }: { logoSrc: string | null }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const mark = markRef.current;
    const glow = glowRef.current;
    if (!overlay || !mark || !glow) return;

    // Only mark "shown" once the animation actually completes — not
    // eagerly at the top of the effect. React StrictMode's dev-mode
    // mount→cleanup→mount cycle immediately kills whatever the first pass
    // starts; if that first pass had already written sessionStorage, the
    // second (real, surviving) pass would see "already shown" and skip
    // rendering the intro entirely, so it would never actually appear.
    if (sessionStorage.getItem(SESSION_KEY) || prefersReducedMotion()) return;

    overlay.style.display = "flex";
    lockPageScroll();

    // The animation timeline is driven by GSAP's rAF-based ticker, which
    // browsers pause while the tab/window is backgrounded or not visible —
    // e.g. a link opened in a background tab, or the window losing focus
    // during load. If that happens mid-intro, onComplete below never fires,
    // so nothing was ever un-stopping Lenis or clearing the overflow:hidden
    // lock — scroll stayed dead site-wide (this persists across client-side
    // navigation since this component lives in the root layout and never
    // remounts). `settle()` is the single release valve: it always runs
    // exactly once, whether the animation actually finished or this timeout
    // had to force it, so the lock is guaranteed to lift either way.
    let settled = false;
    function settle() {
      if (settled) return;
      settled = true;
      clearTimeout(safetyTimeout);
      sessionStorage.setItem(SESSION_KEY, "1");
      unlockPageScroll();
      overlay!.style.display = "none";
    }

    const safetyTimeout = window.setTimeout(settle, 2500);

    const tl = gsap.timeline({ onComplete: settle });

    tl.fromTo(
      glow,
      { opacity: 0, scale: 0.8 },
      { opacity: 0.55, scale: 1.15, duration: 0.9, ease: "power2.out" },
      0
    )
      .fromTo(mark, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 0.1)
      .to({}, { duration: 0.4 })
      .to(overlay, { opacity: 0, duration: 0.4, ease: "power2.inOut" });

    return () => {
      // Killing mid-animation skips onComplete, so restore everything it
      // would have restored — otherwise React StrictMode's dev-mode
      // mount→cleanup→mount cycle leaves this full-screen overlay stuck
      // visible: the first pass kills the timeline before completion, and
      // the second pass early-returns (sessionStorage already marked
      // "shown"), so nothing else would ever reset the display.
      clearTimeout(safetyTimeout);
      tl.kill();
      overlay.style.display = "none";
      if (!settled) unlockPageScroll();
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="fixed inset-0 z-[100] flex items-center justify-center bg-zaz-bg-deep"
      style={{ display: "none" }}
    >
      <AmbientGlow />
      <div
        ref={glowRef}
        className="pointer-events-none absolute h-[46vh] w-[46vh] rounded-full opacity-0 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--zaz-accent) 0%, transparent 70%)" }}
      />
      <div ref={markRef} className="relative opacity-0">
        <Logo src={logoSrc} imgClassName="h-36 w-auto sm:h-44" />
      </div>
    </div>
  );
}
