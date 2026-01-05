import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useControllableState } from "./use-controllable-state";

describe("useControllableState", () => {
	describe("uncontrolled mode", () => {
		it("uses defaultValue in uncontrolled mode", () => {
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: "initial",
				}),
			);

			expect(result.current[0]).toBe("initial");
		});

		it("updates internal state when setValue called", () => {
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: "initial",
				}),
			);

			act(() => {
				result.current[1]("updated");
			});

			expect(result.current[0]).toBe("updated");
		});

		it("calls onChange in uncontrolled mode", () => {
			const onChange = vi.fn();
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: "initial",
					onChange,
				}),
			);

			act(() => {
				result.current[1]("updated");
			});

			expect(onChange).toHaveBeenCalledWith("updated");
		});

		it("works without onChange callback", () => {
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: false,
				}),
			);

			act(() => {
				result.current[1](true);
			});

			expect(result.current[0]).toBe(true);
		});
	});

	describe("controlled mode", () => {
		it("uses value prop in controlled mode", () => {
			const { result } = renderHook(() =>
				useControllableState({
					value: "controlled",
					defaultValue: "default",
				}),
			);

			expect(result.current[0]).toBe("controlled");
		});

		it("only calls onChange in controlled mode (no internal update)", () => {
			const onChange = vi.fn();
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({
						value,
						defaultValue: "default",
						onChange,
					}),
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

		it("reflects prop changes", () => {
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({
						value,
						defaultValue: "default",
					}),
				{ initialProps: { value: "first" } },
			);

			expect(result.current[0]).toBe("first");

			rerender({ value: "second" });
			expect(result.current[0]).toBe("second");
		});
	});

	describe("mode stability", () => {
		it("maintains controlled mode when started as controlled", () => {
			const onChange = vi.fn();
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({
						value,
						defaultValue: "default",
						onChange,
					}),
				{ initialProps: { value: "controlled" as string | undefined } },
			);

			act(() => {
				result.current[1]("attempt-update");
			});
			expect(result.current[0]).toBe("controlled");
			expect(onChange).toHaveBeenCalledWith("attempt-update");

			rerender({ value: undefined });

			act(() => {
				result.current[1]("still-controlled");
			});
			expect(onChange).toHaveBeenCalledWith("still-controlled");
		});

		it("maintains uncontrolled mode when started as uncontrolled", () => {
			const onChange = vi.fn();
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({
						value,
						defaultValue: "default",
						onChange,
					}),
				{ initialProps: { value: undefined as string | undefined } },
			);

			act(() => {
				result.current[1]("updated");
			});
			expect(result.current[0]).toBe("updated");

			rerender({ value: "controlled-attempt" });

			expect(result.current[0]).toBe("updated");
		});

		it("does not switch modes mid-lifecycle", () => {
			const onChange = vi.fn();
			const { result, rerender } = renderHook(
				({ value }) =>
					useControllableState({
						value,
						defaultValue: "default",
						onChange,
					}),
				{ initialProps: { value: undefined as string | undefined } },
			);

			expect(result.current[0]).toBe("default");

			rerender({ value: "controlled" });
			expect(result.current[0]).toBe("default");

			rerender({ value: undefined });

			act(() => {
				result.current[1]("internal-update");
			});
			expect(result.current[0]).toBe("internal-update");
		});
	});

	describe("edge cases", () => {
		it("handles boolean values", () => {
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: false,
				}),
			);

			expect(result.current[0]).toBe(false);

			act(() => {
				result.current[1](true);
			});

			expect(result.current[0]).toBe(true);
		});

		it("handles null as a valid value", () => {
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: "initial" as string | null,
				}),
			);

			act(() => {
				result.current[1](null);
			});

			expect(result.current[0]).toBe(null);
		});

		it("handles object values", () => {
			const initialObj = { name: "initial" };
			const { result } = renderHook(() =>
				useControllableState({
					defaultValue: initialObj,
				}),
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
