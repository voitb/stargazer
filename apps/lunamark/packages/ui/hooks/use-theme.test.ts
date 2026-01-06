import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockMatchMedia = (matches: boolean) => {
	const listeners: Array<(e: { matches: boolean }) => void> = [];
	return vi.fn().mockImplementation((query: string) => ({
		matches,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: (_event: string, callback: (e: { matches: boolean }) => void) => {
			listeners.push(callback);
		},
		removeEventListener: (_event: string, callback: (e: { matches: boolean }) => void) => {
			const index = listeners.indexOf(callback);
			if (index > -1) listeners.splice(index, 1);
		},
		dispatchEvent: vi.fn(),
	}));
};

describe("useTheme", () => {
	let originalMatchMedia: typeof window.matchMedia;

	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute("data-theme");
		originalMatchMedia = window.matchMedia;
		window.matchMedia = mockMatchMedia(false);
		vi.resetModules();
	});

	afterEach(() => {
		window.matchMedia = originalMatchMedia;
	});

	describe("initial state", () => {
		it("returns system as default theme", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());
			expect(result.current.theme).toBe("system");
		});

		it("loads stored theme from localStorage", async () => {
			localStorage.setItem("ui-theme", "dark");
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());
			expect(result.current.theme).toBe("dark");
		});

		it("ignores invalid localStorage values", async () => {
			localStorage.setItem("ui-theme", "invalid-theme");
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());
			expect(result.current.theme).toBe("system");
		});
	});

	describe("theme setting", () => {
		it("persists theme to localStorage and applies data-theme attribute", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => result.current.setTheme("dark"));

			expect(localStorage.getItem("ui-theme")).toBe("dark");
			expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
		});

		it("notifies all subscribers when theme changes", async () => {
			const { useTheme } = await import("./use-theme");
			const { result: result1 } = renderHook(() => useTheme());
			const { result: result2 } = renderHook(() => useTheme());

			act(() => result1.current.setTheme("dark"));

			expect(result1.current.theme).toBe("dark");
			expect(result2.current.theme).toBe("dark");
		});
	});

	describe("system theme resolution", () => {
		it("resolves system theme based on prefers-color-scheme", async () => {
			window.matchMedia = mockMatchMedia(false);
			vi.resetModules();
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());
			expect(result.current.resolvedTheme).toBe("light");
		});

		it("resolves to dark when prefers-color-scheme is dark", async () => {
			window.matchMedia = mockMatchMedia(true);
			vi.resetModules();
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => result.current.setTheme("system"));

			expect(result.current.resolvedTheme).toBe("dark");
		});

		it("returns explicit theme as resolvedTheme when not system", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => result.current.setTheme("dark"));

			expect(result.current.resolvedTheme).toBe("dark");
		});
	});
});
