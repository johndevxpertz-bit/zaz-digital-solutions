"use client";

import type Lenis from "lenis";

let instance: Lenis | null = null;
let lockCount = 0;

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
 * intro): stops Lenis AND sets `overflow: hidden` on both `<html>` and
 * `<body>`. `overflow: hidden` on body alone is a well-known leaky lock in
 * some browser engines — locking the html element too is the standard,
 * reliable fix. Always pair with unlockPageScroll() in the same effect's
 * cleanup.
 */
/**
 * Reentrant: tracks how many callers currently want scroll locked, so one
 * caller closing (e.g. a lightbox) can never prematurely restore scroll while
 * another lock (e.g. the mobile nav) is still active. Only the last matching
 * unlockPageScroll() call actually restores anything.
 */
export function lockPageScroll() {
  lockCount++;
  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";
  stopSmoothScroll();
}

export function unlockPageScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  startSmoothScroll();
}
