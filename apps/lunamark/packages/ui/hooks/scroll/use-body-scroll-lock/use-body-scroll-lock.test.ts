import { renderHook } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { useBodyScrollLock } from "./use-body-scroll-lock";

describe("useBodyScrollLock", () => {
	const originalOverflow = "visible";
	const originalPaddingRight = "0px";

	beforeEach(() => {
		document.body.style.overflow = originalOverflow;
		document.body.style.paddingRight = originalPaddingRight;
	});

	afterEach(() => {
		document.body.style.overflow = originalOverflow;
		document.body.style.paddingRight = originalPaddingRight;
	});

	it("does not modify body styles when not locked", () => {
		renderHook(() => useBodyScrollLock(false));

		expect(document.body.style.overflow).toBe(originalOverflow);
		expect(document.body.style.paddingRight).toBe(originalPaddingRight);
	});

	it("locks body scroll when isLocked is true", () => {
		renderHook(() => useBodyScrollLock(true));

		expect(document.body.style.overflow).toBe("hidden");
	});

	it("adds padding right equal to scrollbar width to prevent layout shift", () => {
		Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
		Object.defineProperty(document.documentElement, "clientWidth", { value: 1000, writable: true });

		renderHook(() => useBodyScrollLock(true));

		expect(document.body.style.paddingRight).toBe("24px");
	});

	it("does not add padding right when scrollbar width is zero", () => {
		Object.defineProperty(window, "innerWidth", { value: 1000, writable: true });
		Object.defineProperty(document.documentElement, "clientWidth", { value: 1000, writable: true });

		renderHook(() => useBodyScrollLock(true));

		expect(document.body.style.paddingRight).toBe(originalPaddingRight);
	});

	it("restores original styles on unmount", () => {
		document.body.style.overflow = "scroll";
		document.body.style.paddingRight = "10px";

		const { unmount } = renderHook(() => useBodyScrollLock(true));

		unmount();

		expect(document.body.style.overflow).toBe("scroll");
		expect(document.body.style.paddingRight).toBe("10px");
	});

	it("restores original styles when isLocked changes to false", () => {
		document.body.style.overflow = "auto";
		document.body.style.paddingRight = "5px";

		const { rerender } = renderHook(({ isLocked }) => useBodyScrollLock(isLocked), {
			initialProps: { isLocked: true },
		});

		rerender({ isLocked: false });

		expect(document.body.style.overflow).toBe("auto");
		expect(document.body.style.paddingRight).toBe("5px");
	});

	it("handles multiple lock/unlock cycles correctly", () => {
		const { rerender } = renderHook(({ isLocked }) => useBodyScrollLock(isLocked), {
			initialProps: { isLocked: false },
		});

		rerender({ isLocked: true });
		expect(document.body.style.overflow).toBe("hidden");

		rerender({ isLocked: false });
		expect(document.body.style.overflow).toBe(originalOverflow);

		rerender({ isLocked: true });
		expect(document.body.style.overflow).toBe("hidden");

		rerender({ isLocked: false });
		expect(document.body.style.overflow).toBe(originalOverflow);
	});
});
