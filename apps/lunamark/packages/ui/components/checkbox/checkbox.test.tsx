import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
	it("renders unchecked by default", () => {
		render(<Checkbox aria-label="Test" />);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).not.toBeChecked();
		expect(checkbox).toHaveAttribute("data-state", "unchecked");
	});

	it("toggles state on click in uncontrolled mode", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Checkbox onChange={onChange} aria-label="Test" />);

		const checkbox = screen.getByRole("checkbox");
		await user.click(checkbox);

		expect(checkbox).toBeChecked();
		expect(onChange).toHaveBeenCalledWith(true);
	});

	it("supports indeterminate state", () => {
		render(<Checkbox indeterminate aria-label="Test" />);
		const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
		expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		expect(checkbox.indeterminate).toBe(true);
	});

	it("respects controlled checked value", async () => {
		const user = userEvent.setup();
		render(<Checkbox checked={false} aria-label="Test" />);

		const checkbox = screen.getByRole("checkbox");
		await user.click(checkbox);

		expect(checkbox).not.toBeChecked();
	});

	it("updates when controlled value changes", () => {
		const { rerender } = render(<Checkbox checked={false} aria-label="Test" />);
		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).not.toBeChecked();

		rerender(<Checkbox checked aria-label="Test" />);
		expect(checkbox).toBeChecked();
	});

	it("supports aria-label and aria-labelledby", () => {
		const { rerender } = render(<Checkbox aria-label="Direct label" />);
		expect(
			screen.getByRole("checkbox", { name: "Direct label" }),
		).toBeInTheDocument();

		rerender(
			<>
				<label id="ext">External label</label>
				<Checkbox aria-labelledby="ext" />
			</>,
		);
		expect(
			screen.getByRole("checkbox", { name: "External label" }),
		).toBeInTheDocument();
	});

	it("is disabled when disabled prop is set", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(<Checkbox disabled onChange={onChange} aria-label="Test" />);

		const checkbox = screen.getByRole("checkbox");
		expect(checkbox).toBeDisabled();
		await user.click(checkbox);
		expect(onChange).not.toHaveBeenCalled();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLInputElement>();
		render(<Checkbox ref={ref} aria-label="Test" />);
		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it("accepts all size props without error", () => {
		const sizes = ["sm", "md", "lg"] as const;
		sizes.forEach((size) => {
			const { unmount } = render(<Checkbox size={size} aria-label={size} />);
			expect(screen.getByRole("checkbox")).toBeInTheDocument();
			unmount();
		});
	});

	it("applies custom className", () => {
		render(<Checkbox className="custom-class" aria-label="Test" />);
		expect(screen.getByRole("checkbox")).toHaveClass("custom-class");
	});
});
