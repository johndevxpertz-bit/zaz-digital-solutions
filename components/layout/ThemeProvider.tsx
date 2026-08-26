"use client";

import { createContext, useCallback, useContext, useSyncExternalStore } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "zaz-theme";
const THEME_CHANGE_EVENT = "zaz-theme-change";

function getSnapshot(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

// The server has no access to localStorage/matchMedia — this matches the
// CSS's own unthemed :root, i.e. dark, exactly what the server renders.
function getServerSnapshot(): Theme {
  return "dark";
}

function subscribe(callback: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, callback);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, callback);
}

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Hand-rolled theme context — no dependency. The actual "no flash of the
 * wrong theme" work happens earlier, via the inline blocking script in
 * app/layout.tsx's <head>, which sets `data-theme` on <html> before this
 * component — or anything else — ever renders.
 *
 * `data-theme` on <html> is the real source of truth, not a piece of React
 * state copied from it. useSyncExternalStore reads it directly:
 * getServerSnapshot returns "dark" (matching what the server always
 * renders, since it can't see localStorage/matchMedia), getSnapshot reads
 * the real attribute on the client — already set correctly by the
 * blocking script before hydration, so there's nothing to reconcile.
 * toggleTheme updates the DOM attribute + localStorage directly and
 * dispatches an event so every subscriber (any ThemeToggle instance)
 * re-renders in sync — no useEffect-driven setState, no cascading render.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can throw (private browsing, disabled storage) — the theme
      // still applies for this page view, it just won't persist.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }, []);

  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : "dark");
  }, [theme, applyTheme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
