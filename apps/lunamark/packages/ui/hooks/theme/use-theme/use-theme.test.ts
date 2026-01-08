import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const createMatchMedia = (initialMatches: boolean) => {
	let matches = initialMatches;
	const listeners = new Set<(e: { matches: boolean }) => void>();
	const matchMedia = vi.fn().mockImplementation((query: string) => ({
		matches,
		media: query,
		onchange: null,
		addListener: vi.fn(),
		removeListener: vi.fn(),
		addEventListener: (_event: string, callback: (e: { matches: boolean }) => void) => {
			listeners.add(callback);
		},
		removeEventListener: (_event: string, callback: (e: { matches: boolean }) => void) => {
			listeners.delete(callback);
		},
		dispatchEvent: vi.fn(),
	}));

	return {
		matchMedia,
		setMatches(nextMatches: boolean) {
			matches = nextMatches;
			for (const listener of listeners) {
				listener({ matches: nextMatches });
			}
		},
	};
};

describe("useTheme", () => {
	let originalMatchMedia: typeof window.matchMedia;
	let matchMediaController: ReturnType<typeof createMatchMedia>;

	beforeEach(() => {
		localStorage.clear();
		document.documentElement.removeAttribute("data-theme");
		originalMatchMedia = window.matchMedia;
		matchMediaController = createMatchMedia(false);
		window.matchMedia = matchMediaController.matchMedia;
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
			matchMediaController = createMatchMedia(false);
			window.matchMedia = matchMediaController.matchMedia;
			vi.resetModules();
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());
			expect(result.current.resolvedTheme).toBe("light");
		});

		it("resolves to dark when prefers-color-scheme is dark", async () => {
			matchMediaController = createMatchMedia(true);
			window.matchMedia = matchMediaController.matchMedia;
			vi.resetModules();
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => result.current.setTheme("system"));

			expect(result.current.resolvedTheme).toBe("dark");
		});

		it("updates resolvedTheme when system preference changes", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			expect(result.current.theme).toBe("system");
			expect(result.current.resolvedTheme).toBe("light");

			act(() => {
				matchMediaController.setMatches(true);
			});

			expect(result.current.resolvedTheme).toBe("dark");
		});

		it("returns explicit theme as resolvedTheme when not system", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => result.current.setTheme("dark"));

			expect(result.current.resolvedTheme).toBe("dark");
		});
	});

	describe("storage sync", () => {
		it("updates theme when storage event fires", async () => {
			const { useTheme } = await import("./use-theme");
			const { result } = renderHook(() => useTheme());

			act(() => {
				window.dispatchEvent(
					new StorageEvent("storage", {
						key: "ui-theme",
						newValue: "dark",
					})
				);
			});

			expect(result.current.theme).toBe("dark");
			expect(result.current.resolvedTheme).toBe("dark");
		});
	});
});
