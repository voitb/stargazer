import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useBoardKeyboardShortcuts } from "./use-board-keyboard-shortcuts";

function pressKey(key: string) {
	const event = new KeyboardEvent("keydown", { key, bubbles: true });
	Object.defineProperty(event, "target", { value: document.body });
	document.dispatchEvent(event);
}

describe("useBoardKeyboardShortcuts", () => {
	it("calls onCreateTask with 'todo' when N is pressed", () => {
		const onCreateTask = vi.fn();
		renderHook(() => useBoardKeyboardShortcuts({ onCreateTask }));

		pressKey("n");

		expect(onCreateTask).toHaveBeenCalledWith("todo");
	});

	it("works with uppercase N", () => {
		const onCreateTask = vi.fn();
		renderHook(() => useBoardKeyboardShortcuts({ onCreateTask }));

		pressKey("N");

		expect(onCreateTask).toHaveBeenCalledWith("todo");
	});

	it("does not call onCreateTask when disabled", () => {
		const onCreateTask = vi.fn();
		renderHook(() =>
			useBoardKeyboardShortcuts({ onCreateTask, enabled: false }),
		);

		pressKey("n");

		expect(onCreateTask).not.toHaveBeenCalled();
	});

	it("cleans up on unmount", () => {
		const onCreateTask = vi.fn();
		const { unmount } = renderHook(() =>
			useBoardKeyboardShortcuts({ onCreateTask }),
		);

		unmount();
		pressKey("n");

		expect(onCreateTask).not.toHaveBeenCalled();
	});
});
