import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Checkbox } from "./checkbox";

describe("Checkbox", () => {
	describe("rendering", () => {
		it("renders with default props", () => {
			render(<Checkbox aria-label="Test checkbox" />);

			const checkbox = screen.getByRole("checkbox", { name: "Test checkbox" });
			expect(checkbox).toBeInTheDocument();
		});

		it("applies custom className", () => {
			render(<Checkbox aria-label="Test" className="custom-class" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveClass("custom-class");
		});

		it("forwards ref", () => {
			const ref = createRef<HTMLInputElement>();
			render(<Checkbox ref={ref} aria-label="Test" />);

			expect(ref.current).toBeInstanceOf(HTMLInputElement);
		});

		it("passes through additional props", () => {
			render(<Checkbox aria-label="Test" data-testid="custom-checkbox" />);

			expect(screen.getByTestId("custom-checkbox")).toBeInTheDocument();
		});
	});

	describe("sizes", () => {
		it("applies sm size", () => {
			render(<Checkbox size="sm" aria-label="Small" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveClass("h-4", "w-4");
		});

		it("applies md size by default", () => {
			render(<Checkbox aria-label="Medium" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveClass("h-5", "w-5");
		});

		it("applies lg size", () => {
			render(<Checkbox size="lg" aria-label="Large" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveClass("h-6", "w-6");
		});
	});

	describe("states", () => {
		it("is unchecked by default", () => {
			render(<Checkbox aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "unchecked");
		});

		it("is checked when checked=true", () => {
			render(<Checkbox checked aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "checked");
		});

		it("is checked when defaultChecked=true", () => {
			render(<Checkbox defaultChecked aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "checked");
		});

		it("indeterminate state shows in data-state", () => {
			render(<Checkbox indeterminate aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		});

		it("indeterminate overrides checked visual state", () => {
			render(<Checkbox checked indeterminate aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toHaveAttribute("data-state", "indeterminate");
		});

		it("sets indeterminate DOM property", () => {
			render(<Checkbox indeterminate aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
			expect(checkbox.indeterminate).toBe(true);
		});

		it("updates indeterminate DOM property when prop changes", () => {
			const { rerender } = render(<Checkbox aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
			expect(checkbox.indeterminate).toBe(false);

			rerender(<Checkbox indeterminate aria-label="Test" />);
			expect(checkbox.indeterminate).toBe(true);

			rerender(<Checkbox aria-label="Test" />);
			expect(checkbox.indeterminate).toBe(false);
		});
	});

	describe("controlled mode", () => {
		it("calls onChange with new checked value when clicked", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();

			render(<Checkbox checked={false} onChange={onChange} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange).toHaveBeenCalledWith(true);
		});

		it("respects controlled checked value", async () => {
			const user = userEvent.setup();

			render(<Checkbox checked={false} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(checkbox).not.toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "unchecked");
		});

		it("updates when controlled value changes", () => {
			const { rerender } = render(
				<Checkbox checked={false} aria-label="Test" />,
			);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();

			rerender(<Checkbox checked aria-label="Test" />);
			expect(checkbox).toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "checked");
		});
	});

	describe("uncontrolled mode", () => {
		it("toggles state on click", async () => {
			const user = userEvent.setup();

			render(<Checkbox aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).not.toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "unchecked");

			await user.click(checkbox);

			expect(checkbox).toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "checked");

			await user.click(checkbox);

			expect(checkbox).not.toBeChecked();
			expect(checkbox).toHaveAttribute("data-state", "unchecked");
		});

		it("uses defaultChecked as initial value", async () => {
			const user = userEvent.setup();

			render(<Checkbox defaultChecked aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeChecked();

			await user.click(checkbox);

			expect(checkbox).not.toBeChecked();
		});

		it("calls onChange callback in uncontrolled mode", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();

			render(<Checkbox defaultChecked={false} onChange={onChange} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(onChange).toHaveBeenCalledTimes(1);
			expect(onChange).toHaveBeenCalledWith(true);
		});
	});

	describe("interaction", () => {
		it("toggles on click", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();

			render(<Checkbox onChange={onChange} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(onChange).toHaveBeenCalledWith(true);
		});

		it("toggles on Space key", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();

			render(<Checkbox onChange={onChange} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			checkbox.focus();
			await user.keyboard(" ");

			expect(onChange).toHaveBeenCalledWith(true);
		});

		it("does not toggle when disabled", async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();

			render(<Checkbox disabled onChange={onChange} aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			await user.click(checkbox);

			expect(onChange).not.toHaveBeenCalled();
			expect(checkbox).not.toBeChecked();
		});

	});

	describe("accessibility", () => {
		it("has checkbox role", () => {
			render(<Checkbox aria-label="Test" />);

			expect(screen.getByRole("checkbox")).toBeInTheDocument();
		});

		it("is focusable", () => {
			render(<Checkbox aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			checkbox.focus();

			expect(document.activeElement).toBe(checkbox);
		});

		it("supports aria-label", () => {
			render(<Checkbox aria-label="Accept terms" />);

			expect(
				screen.getByRole("checkbox", { name: "Accept terms" }),
			).toBeInTheDocument();
		});

		it("supports aria-labelledby", () => {
			render(
				<>
					<label id="terms-label">Accept the terms and conditions</label>
					<Checkbox aria-labelledby="terms-label" />
				</>,
			);

			expect(
				screen.getByRole("checkbox", { name: "Accept the terms and conditions" }),
			).toBeInTheDocument();
		});

		it("is disabled when disabled prop is set", () => {
			render(<Checkbox disabled aria-label="Test" />);

			const checkbox = screen.getByRole("checkbox");
			expect(checkbox).toBeDisabled();
		});
	});

});
