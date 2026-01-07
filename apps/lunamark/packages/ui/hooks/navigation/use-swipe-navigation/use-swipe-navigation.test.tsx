import { render, renderHook, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { useSwipeNavigation } from "./use-swipe-navigation";

type KeyboardHarnessProps = {
	activeIndex: number;
	itemCount?: number;
	enableKeyboard?: boolean;
	onIndexChange: (index: number) => void;
};

type SwipeTouchEvent = Parameters<
	ReturnType<typeof useSwipeNavigation>["handleTouchStart"]
>[0];

function KeyboardHarness({
	activeIndex,
	itemCount = 3,
	enableKeyboard = true,
	onIndexChange,
}: KeyboardHarnessProps) {
	const { containerRef } = useSwipeNavigation({
		itemCount,
		activeIndex,
		onIndexChange,
		enableKeyboard,
	});

	return <div ref={containerRef} data-testid="swipe-container" />;
}

describe("useSwipeNavigation", () => {
	let onIndexChange: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		onIndexChange = vi.fn();
	});

	it("returns touch handlers and container ref", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 0,
				onIndexChange,
			})
		);

		expect(result.current.handleTouchStart).toBeInstanceOf(Function);
		expect(result.current.handleTouchMove).toBeInstanceOf(Function);
		expect(result.current.handleTouchEnd).toBeInstanceOf(Function);
		expect(result.current.containerRef).toBeDefined();
	});

	it("navigates to next index on swipe right (positive diff)", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 0,
				onIndexChange,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(-60));
		result.current.handleTouchEnd();

		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	it("navigates to previous index on swipe left (negative diff)", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 1,
				onIndexChange,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(60));
		result.current.handleTouchEnd();

		expect(onIndexChange).toHaveBeenCalledWith(0);
	});

	it("does not navigate when swipe distance is below threshold", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 0,
				onIndexChange,
				threshold: 50,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(-30));
		result.current.handleTouchEnd();

		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("does not navigate past the last item", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 2,
				onIndexChange,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(-60));
		result.current.handleTouchEnd();

		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("does not navigate before the first item", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 0,
				onIndexChange,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(60));
		result.current.handleTouchEnd();

		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("ignores keyboard navigation when enableKeyboard is false", () => {
		render(
			<KeyboardHarness
				activeIndex={0}
				onIndexChange={onIndexChange}
				enableKeyboard={false}
			/>,
		);

		const container = screen.getByTestId("swipe-container");
		fireEvent.keyDown(container, { key: "ArrowRight" });

		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("navigates to next item on ArrowRight key", () => {
		render(
			<KeyboardHarness activeIndex={0} onIndexChange={onIndexChange} />,
		);

		const container = screen.getByTestId("swipe-container");
		fireEvent.keyDown(container, { key: "ArrowRight" });

		expect(onIndexChange).toHaveBeenCalledWith(1);
	});

	it("navigates to previous item on ArrowLeft key", () => {
		render(
			<KeyboardHarness activeIndex={1} onIndexChange={onIndexChange} />,
		);

		const container = screen.getByTestId("swipe-container");
		fireEvent.keyDown(container, { key: "ArrowLeft" });

		expect(onIndexChange).toHaveBeenCalledWith(0);
	});

	it("cleans up keyboard event listener on unmount", () => {
		const { unmount } = render(
			<KeyboardHarness activeIndex={0} onIndexChange={onIndexChange} />,
		);

		const container = screen.getByTestId("swipe-container");
		fireEvent.keyDown(container, { key: "ArrowRight" });
		expect(onIndexChange).toHaveBeenCalledWith(1);

		unmount();

		onIndexChange.mockClear();
		fireEvent.keyDown(container, { key: "ArrowRight" });
		expect(onIndexChange).not.toHaveBeenCalled();
	});

	it("uses custom threshold when provided", () => {
		const { result } = renderHook(() =>
			useSwipeNavigation({
				itemCount: 3,
				activeIndex: 0,
				onIndexChange,
				threshold: 100,
			})
		);

		const touchEvent = (clientX: number): SwipeTouchEvent => ({
			touches: [{ clientX }],
		});

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(-60));
		result.current.handleTouchEnd();

		expect(onIndexChange).not.toHaveBeenCalled();

		result.current.handleTouchStart(touchEvent(0));
		result.current.handleTouchMove(touchEvent(-120));
		result.current.handleTouchEnd();

		expect(onIndexChange).toHaveBeenCalledWith(1);
	});
});
