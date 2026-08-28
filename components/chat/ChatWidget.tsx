"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { lockPageScroll, unlockPageScroll } from "@/lib/animation/lenisController";

// Code-split: ChatWidget itself mounts on every route (see app/layout.tsx),
// but ChatPanel's JS — and everything it pulls in — should only be fetched
// once a visitor actually opens the chat, not as part of every page's
// initial bundle. `open && <ChatPanel />` below already deferred *mounting*
// it; wrapping the import in next/dynamic defers *downloading* it too.
const ChatPanel = dynamic(() => import("@/components/chat/ChatPanel"));

/**
 * Floating chat entry point, mounted once from app/layout.tsx (a sibling of
 * PageLoader, inside ThemeProvider) so it persists across route navigation
 * instead of remounting per page. Entirely token-driven styling — no theme
 * logic of its own, same as every other component in this project.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const panelId = "zaz-ai-chat-panel";
  const buttonRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  // Mirrors MobileNav's own scroll-lock pattern, but scoped to small
  // viewports only — the panel is a floating card on desktop (page scroll
  // stays live), and a near-full-screen overlay on mobile, where background
  // scroll needs to be locked exactly like the mobile nav already does.
  useEffect(() => {
    if (!open) return;

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    let locked = false;

    function sync() {
      if (mediaQuery.matches && !locked) {
        lockPageScroll();
        locked = true;
      } else if (!mediaQuery.matches && locked) {
        unlockPageScroll();
        locked = false;
      }
    }

    sync();
    mediaQuery.addEventListener("change", sync);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      mediaQuery.removeEventListener("change", sync);
      window.removeEventListener("keydown", handleKeyDown);
      if (locked) unlockPageScroll();
    };
  }, [open, close]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close ZAZ AI chat" : "Open ZAZ AI chat"}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        className={`fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full border border-zaz-border-strong bg-zaz-surface text-zaz-text shadow-2xl shadow-black/30 transition-all duration-300 ease-[var(--zaz-ease)] hover:-translate-y-0.5 hover:border-zaz-accent hover:text-zaz-accent focus-visible:outline focus-visible:outline-1 focus-visible:outline-zaz-accent focus-visible:outline-offset-4 ${
          open ? "scale-90 opacity-0 pointer-events-none" : "scale-100 opacity-100"
        }`}
      >
        <svg aria-hidden width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12.3C4 7.7 7.8 4 12.4 4C17 4 20.8 7.7 20.8 12.3C20.8 16.9 17 20.6 12.4 20.6C11 20.6 9.7 20.3 8.6 19.7L4 20.8L5.2 16.6C4.4 15.4 4 13.9 4 12.3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <circle cx="8.6" cy="12.3" r="1" fill="currentColor" />
          <circle cx="12.4" cy="12.3" r="1" fill="currentColor" />
          <circle cx="16.2" cy="12.3" r="1" fill="currentColor" />
        </svg>
        {/* Subtle "assistant is available" indicator — reuses the site's
            existing pulse-glow animation/accent color rather than
            introducing a new status color. */}
        <span
          aria-hidden
          className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-zaz-bg-deep bg-zaz-accent zaz-glow-pulse"
        />
      </button>

      <div
        id={panelId}
        role="dialog"
        aria-modal="true"
        aria-label="ZAZ AI chat"
        className={`fixed inset-0 z-[90] flex flex-col overflow-hidden bg-zaz-bg-deep transition-all duration-300 ease-[var(--zaz-ease)] sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100vh-7rem)] sm:w-[400px] sm:rounded-[var(--zaz-radius)] sm:border sm:border-zaz-border sm:shadow-2xl sm:shadow-black/40 ${
          open ? "visible translate-y-0 opacity-100" : "invisible translate-y-4 opacity-0 sm:pointer-events-none"
        }`}
      >
        {open && <ChatPanel onClose={close} />}
      </div>
    </>
  );
}
