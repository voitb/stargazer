import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
	describe("uncontrolled mode", () => {
		it("uses defaultValue as initial state", () => {
			const { result } = renderHook(() =>
				useControllableState({ defaultValue: "initial" }),
			);

			expect(result.current[0]).toBe("initial");
		});

		it("updates internal state when setValue called", () => {
			const { result } = renderHook(() =>
				useControllableState({ defaultValue: "initial" }),
			);

			act(() => {
				result.current[1]("updated");
			});

			expect(result.current[0]).toBe("updated");
		});

		it("calls onChange callback when setValue called", () => {
			const onChange = vi.fn();
			const { result } = renderHook(() =>
				useControllableState({ defaultValue: "initial", onChange }),
			);

			act(() => {
				result.current[1]("updated");
			});

			expect(onChange).toHaveBeenCalledWith("updated");
		});
	});

	describe("controlled mode", () => {
		it("uses value prop and ignores defaultValue", () => {
			const { result } = renderHook(() =>
				useControllableState({ value: "controlled", defaultValue: "default" }),
			);

			expect(result.current[0]).toBe("controlled");
		});

		it("calls onChange without updating internal state", () => {
			const onChange = vi.fn();
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({ value, defaultValue: "default", onChange }),
				{ initialProps: { value: "initial" } },
			);

			act(() => {
				result.current[1]("new-value");
			});

			expect(onChange).toHaveBeenCalledWith("new-value");
			expect(result.current[0]).toBe("initial");

			rerender({ value: "new-value" });
			expect(result.current[0]).toBe("new-value");
		});
	});

	describe("mode stability", () => {
		it("maintains initial control mode throughout component lifecycle", () => {
			const onChange = vi.fn();

			// Start UNCONTROLLED (value=undefined)
			const uncontrolled = renderHook(
				({ value }) =>
					useControllableState({ value, defaultValue: "default", onChange }),
				{ initialProps: { value: undefined as string | undefined } },
			);

			act(() => {
				uncontrolled.result.current[1]("updated");
			});
			expect(uncontrolled.result.current[0]).toBe("updated");

			// Try to switch to controlled - should be ignored
			uncontrolled.rerender({ value: "controlled-attempt" });
			expect(uncontrolled.result.current[0]).toBe("updated");

			// Start CONTROLLED (value defined)
			const controlled = renderHook(
				({ value }) =>
					useControllableState({ value, defaultValue: "default", onChange }),
				{ initialProps: { value: "controlled" as string | undefined } },
			);

			act(() => {
				controlled.result.current[1]("attempt-update");
			});
			expect(controlled.result.current[0]).toBe("controlled");
			expect(onChange).toHaveBeenCalledWith("attempt-update");

			// Try to switch to uncontrolled - should stay controlled
			controlled.rerender({ value: undefined });
			act(() => {
				controlled.result.current[1]("still-controlled");
			});
			expect(onChange).toHaveBeenCalledWith("still-controlled");
		});
	});

	describe("edge cases", () => {
		it("handles null as a valid controlled value", () => {
			const { result } = renderHook(() =>
				useControllableState({ defaultValue: "initial" as string | null }),
			);

			act(() => {
				result.current[1](null);
			});

			expect(result.current[0]).toBe(null);
		});

		it("handles object values with reference equality", () => {
			const initialObj = { name: "initial" };
			const { result } = renderHook(() =>
				useControllableState({ defaultValue: initialObj }),
			);

			expect(result.current[0]).toBe(initialObj);

			const newObj = { name: "updated" };
			act(() => {
				result.current[1](newObj);
			});

			expect(result.current[0]).toBe(newObj);
		});
	});
});
