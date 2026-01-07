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

	it("returns initial state matching isOpen", () => {
		const { result: openResult } = renderHook(() => useExitAnimation(true));
		expect(openResult.current).toBe(true);

		const { result: closedResult } = renderHook(() => useExitAnimation(false));
		expect(closedResult.current).toBe(false);
	});

	it("immediately shows content when opening", () => {
		const { result, rerender } = renderHook(
			({ isOpen }) => useExitAnimation(isOpen),
			{ initialProps: { isOpen: false } },
		);

		expect(result.current).toBe(false);

		rerender({ isOpen: true });
		expect(result.current).toBe(true);
	});

	it("delays unmount when closing", () => {
		const { result, rerender } = renderHook(
			({ isOpen }) => useExitAnimation(isOpen, 200),
			{ initialProps: { isOpen: true } },
		);

		rerender({ isOpen: false });
		expect(result.current).toBe(true);

		act(() => {
			vi.advanceTimersByTime(200);
		});
		expect(result.current).toBe(false);
	});

	it("cancels exit when re-opened during animation", () => {
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
