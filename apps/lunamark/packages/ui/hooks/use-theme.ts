import { useCallback, useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "ui-theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "system";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): ResolvedTheme {
  return theme === "system" ? getSystemTheme() : theme;
}

function applyTheme(theme: ResolvedTheme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

let currentTheme: Theme = getStoredTheme();
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  listeners.forEach((listener) => listener());
}

function getSnapshot(): Theme {
  return currentTheme;
}

function getServerSnapshot(): Theme {
  return "system";
}

export interface UseThemeReturn {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

/**
 * Manages theme state with localStorage persistence and system preference detection.
 * Supports light, dark, and system (auto) themes.
 *
 * @example
 * const { theme, resolvedTheme, setTheme } = useTheme();
 * // theme: "light" | "dark" | "system" (user selection)
 * // resolvedTheme: "light" | "dark" (actual applied theme)
 */
export function useTheme(): UseThemeReturn {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const resolvedTheme = resolveTheme(theme);

  const setTheme = useCallback((newTheme: Theme) => {
    currentTheme = newTheme;
    localStorage.setItem(STORAGE_KEY, newTheme);
    applyTheme(resolveTheme(newTheme));
    notifyListeners();
  }, []);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      applyTheme(getSystemTheme());
      notifyListeners();
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  return { theme, resolvedTheme, setTheme };
}
