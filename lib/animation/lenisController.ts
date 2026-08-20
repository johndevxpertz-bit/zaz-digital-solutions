"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;
let lockCount = 0;

/**
 * Blocks background touch-scrolling while a lock is active, without ever
 * touching `<body>`'s position/layout. `overflow: hidden` on body/html does
 * not reliably stop touch-driven scrolling on iOS Safari (a well-known
 * WebKit gap) — this plugs that gap directly at the event level instead.
 *
 * The `position: fixed; top: -scrollY` body-pinning technique was tried
 * first and reverted: forcing a layout/compositing change on `<body>` right
 * as a real touch scroll gesture is settling (inertia, rubber-banding, the
 * address bar collapsing) is a documented source of exactly the
 * "unresponsive until you touch the screen again" freeze this was meant to
 * fix, on real iOS Safari — invisible to programmatic/dispatched-event
 * testing since nothing there ever has real scroll momentum in flight. Never
 * moving `<body>` at all sidesteps that failure mode entirely, and since
 * scroll position is therefore never touched, there is nothing to restore.
 */
function preventBackgroundTouchMove(event: TouchEvent) {
  const target = event.target;
  // Scrolling inside the open mobile nav's own content (if it overflows) is
  // still allowed — only touches outside it are the "background" this is
  // meant to freeze.
  if (target instanceof Element && target.closest("#mobile-nav")) return;
  if (event.cancelable) event.preventDefault();
}

export function setLenisInstance(lenis: Lenis | null) {
  instance = lenis;
  // PageLoader locks scroll in its own mount effect, which can commit before
  // SmoothScrollProvider's effect has created this instance (React runs
  // sibling effects in tree order, and the two are siblings). When that
  // happens, the earlier lockPageScroll() call's stopSmoothScroll() silently
  // no-ops on a null instance, so a freshly-created Lenis starts fully live
  // underneath the visual overflow:hidden lock — tracking wheel/touch input
  // it never renders — and then jumps to "catch up" the moment the lock
  // lifts. Stop it immediately if a lock is already active when it arrives.
  if (instance && lockCount > 0) {
    instance.stop();
  }
}

/**
 * Pause Lenis's own scroll handling. Lenis drives `window.scrollTo()` itself
 * via its own wheel/touch listeners and RAF loop — it has no idea when
 * something else (a modal, the mobile nav) locks scroll via `overflow:
 * hidden` on body. Without stopping it explicitly, Lenis keeps accumulating
 * a target scroll position from wheel input while the page is visually
 * locked, then jumps/catches up to that stale target once unlocked — the
 * "hang / feels stuck / jerky after repeated scrolling" symptom. Call this
 * whenever scroll is locked elsewhere, and startSmoothScroll() when unlocked.
 */
export function stopSmoothScroll() {
  instance?.stop();
}

export function startSmoothScroll() {
  instance?.start();
}

/**
 * Full page-scroll lock for modals/overlays (mobile nav, the page-load
 * intro): stops Lenis, sets `overflow: hidden` on both `<html>` and `<body>`
 * (locking wheel-driven and desktop scrolling), and additionally blocks
 * touchmove at the document level (locking touch-driven scrolling, which
 * `overflow: hidden` alone does not reliably stop on iOS). `<body>`'s
 * position/layout is never touched, so scroll position never moves and
 * there is nothing to restore. Always pair with unlockPageScroll() in the
 * same effect's cleanup.
 */
/**
 * Reentrant: tracks how many callers currently want scroll locked, so one
 * caller closing (e.g. a lightbox) can never prematurely restore scroll while
 * another lock (e.g. the mobile nav) is still active. Only the last matching
 * unlockPageScroll() call actually applies/removes anything.
 */
export function lockPageScroll() {
  lockCount++;
  if (lockCount === 1) {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    document.addEventListener("touchmove", preventBackgroundTouchMove, { passive: false });
  }
  stopSmoothScroll();
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.removeEventListener("touchmove", preventBackgroundTouchMove);
  startSmoothScroll();
}

/**
 * Scroll an element into view, routed through the live Lenis instance when
 * one exists so it doesn't fight Lenis's own RAF-driven scroll position (a
 * plain `el.scrollIntoView()` would get silently overridden the next frame).
 * Falls back to native `scrollIntoView` when Lenis isn't running (e.g.
 * prefers-reduced-motion, where SmoothScrollProvider never creates it) —
 * instant in that case, since there's no smooth-scroll system to animate it.
 */
export function scrollToElement(el: HTMLElement, offset = 0) {
  if (instance) {
    instance.scrollTo(el, { offset, duration: 1 });
  } else {
    el.scrollIntoView({ behavior: "auto", block: "start" });
  }
}
