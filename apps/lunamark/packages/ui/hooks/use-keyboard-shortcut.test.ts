import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useKeyboardShortcut } from "./use-keyboard-shortcut";

function pressKey(key: string, target: HTMLElement = document.body) {
	const event = new KeyboardEvent("keydown", { key, bubbles: true });
	Object.defineProperty(event, "target", { value: target });
	document.dispatchEvent(event);
	return event;
}

describe("useKeyboardShortcut", () => {
	it("calls handler when key is pressed", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		pressKey("n");

		expect(handler).toHaveBeenCalledOnce();
	});

	it("supports multiple keys", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: ["a", "b"], handler }));

		pressKey("a");
		pressKey("b");
		pressKey("c");

		expect(handler).toHaveBeenCalledTimes(2);
	});

	it("matches keys case-insensitively", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		pressKey("N");

		expect(handler).toHaveBeenCalledOnce();
	});

	it("ignores input fields by default", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		const input = document.createElement("input");
		pressKey("n", input);

		expect(handler).not.toHaveBeenCalled();
	});

	it("ignores textarea fields by default", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		const textarea = document.createElement("textarea");
		pressKey("n", textarea);

		expect(handler).not.toHaveBeenCalled();
	});

	it("ignores contentEditable elements by default", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		const div = document.createElement("div");
		div.setAttribute("contenteditable", "true");
		pressKey("n", div);

		expect(handler).not.toHaveBeenCalled();
	});

	it("does not ignore input fields when ignoreInputFields is false", () => {
		const handler = vi.fn();
		renderHook(() =>
			useKeyboardShortcut({ key: "Escape", handler, ignoreInputFields: false }),
		);

		const input = document.createElement("input");
		pressKey("Escape", input);

		expect(handler).toHaveBeenCalledOnce();
	});

	it("does not call handler when disabled", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler, enabled: false }));

		pressKey("n");

		expect(handler).not.toHaveBeenCalled();
	});

	it("cleans up listener on unmount", () => {
		const handler = vi.fn();
		const { unmount } = renderHook(() =>
			useKeyboardShortcut({ key: "n", handler }),
		);

		unmount();
		pressKey("n");

		expect(handler).not.toHaveBeenCalled();
	});

	it("passes keyboard event to handler", () => {
		const handler = vi.fn();
		renderHook(() => useKeyboardShortcut({ key: "n", handler }));

		pressKey("n");

		expect(handler).toHaveBeenCalledWith(expect.any(KeyboardEvent));
	});
});
