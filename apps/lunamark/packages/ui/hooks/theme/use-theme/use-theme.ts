"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";
type ThemeSnapshot = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
};

const STORAGE_KEY = "ui-theme";

function parseStoredTheme(value: string | null): Theme {
	if (value === "light" || value === "dark" || value === "system") {
		return value;
	}
	return "system";
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return parseStoredTheme(localStorage.getItem(STORAGE_KEY));
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

const storedTheme = getStoredTheme();
let currentSnapshot: ThemeSnapshot = {
	theme: storedTheme,
	resolvedTheme: resolveTheme(storedTheme),
};
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
	listeners.forEach((listener) => listener());
}

function updateSnapshot(nextTheme: Theme, nextResolvedTheme: ResolvedTheme): void {
	currentSnapshot = { theme: nextTheme, resolvedTheme: nextResolvedTheme };
	notifyListeners();
}

function getSnapshot(): ThemeSnapshot {
	return currentSnapshot;
}

function getServerSnapshot(): ThemeSnapshot {
	return { theme: "system", resolvedTheme: "light" };
}

export interface UseThemeReturn {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
}

export function useTheme(): UseThemeReturn {
	const { theme, resolvedTheme } = useSyncExternalStore(
		subscribe,
		getSnapshot,
		getServerSnapshot
	);
	const [, startTransition] = useTransition();

	function setTheme(newTheme: Theme) {
		startTransition(() => {
			localStorage.setItem(STORAGE_KEY, newTheme);
			updateSnapshot(newTheme, resolveTheme(newTheme));
		});
	}

	useEffect(() => {
		applyTheme(resolvedTheme);
	}, [resolvedTheme]);

	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
		const handleChange = (event: MediaQueryListEvent) => {
			if (currentSnapshot.theme !== "system") return;
			const nextResolvedTheme = event.matches ? "dark" : "light";
			if (currentSnapshot.resolvedTheme === nextResolvedTheme) return;
			updateSnapshot("system", nextResolvedTheme);
		};

		mediaQuery.addEventListener("change", handleChange);
		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	useEffect(() => {
		const handleStorage = (event: StorageEvent) => {
			if (event.key !== STORAGE_KEY) return;
			const nextTheme = parseStoredTheme(event.newValue);
			updateSnapshot(nextTheme, resolveTheme(nextTheme));
		};

		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, []);

	return { theme, resolvedTheme, setTheme };
}
