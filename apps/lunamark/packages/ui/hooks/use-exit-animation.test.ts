import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useExitAnimation } from "./use-exit-animation";

describe("useExitAnimation", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("initial state", () => {
		it("returns true when isOpen is true", () => {
			const { result } = renderHook(() => useExitAnimation(true));
			expect(result.current).toBe(true);
		});

		it("returns false when isOpen starts false", () => {
			const { result } = renderHook(() => useExitAnimation(false));
			expect(result.current).toBe(false);
		});
	});

	describe("opening transition", () => {
		it("immediately returns true when opening", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen),
				{ initialProps: { isOpen: false } },
			);

			expect(result.current).toBe(false);

			rerender({ isOpen: true });
			expect(result.current).toBe(true);
		});
	});

	describe("closing transition", () => {
		it("delays unmount for specified duration when closing", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen, 200),
				{ initialProps: { isOpen: true } },
			);

			expect(result.current).toBe(true);

			rerender({ isOpen: false });
			expect(result.current).toBe(true);

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(result.current).toBe(true);

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(result.current).toBe(false);
		});

		it("returns false after duration expires", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen),
				{ initialProps: { isOpen: true } },
			);

			rerender({ isOpen: false });

			act(() => {
				vi.advanceTimersByTime(150);
			});

			expect(result.current).toBe(false);
		});
	});

	describe("custom duration", () => {
		it("respects custom duration parameter", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen, 500),
				{ initialProps: { isOpen: true } },
			);

			rerender({ isOpen: false });

			act(() => {
				vi.advanceTimersByTime(400);
			});
			expect(result.current).toBe(true);

			act(() => {
				vi.advanceTimersByTime(100);
			});
			expect(result.current).toBe(false);
		});

		it("uses default 150ms duration", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen),
				{ initialProps: { isOpen: true } },
			);

			rerender({ isOpen: false });

			act(() => {
				vi.advanceTimersByTime(149);
			});
			expect(result.current).toBe(true);

			act(() => {
				vi.advanceTimersByTime(1);
			});
			expect(result.current).toBe(false);
		});
	});

	describe("cleanup", () => {
		it("clears timeout on unmount", () => {
			const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

			const { rerender, unmount } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen),
				{ initialProps: { isOpen: true } },
			);

			rerender({ isOpen: false });
			unmount();

			expect(clearTimeoutSpy).toHaveBeenCalled();
		});

		it("clears previous timeout when isOpen changes rapidly", () => {
			const { result, rerender } = renderHook(
				({ isOpen }) => useExitAnimation(isOpen),
				{ initialProps: { isOpen: true } },
			);

			rerender({ isOpen: false });

			act(() => {
				vi.advanceTimersByTime(50);
			});

			rerender({ isOpen: true });
			expect(result.current).toBe(true);

			act(() => {
				vi.advanceTimersByTime(200);
			});

			expect(result.current).toBe(true);
		});
	});
});
