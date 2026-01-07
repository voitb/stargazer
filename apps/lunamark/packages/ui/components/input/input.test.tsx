import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Input } from "./input";

describe("Input", () => {

	it("renders as an input element", () => {
		render(<Input aria-label="Test input" />);

		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("displays placeholder text", () => {
		render(<Input placeholder="Enter your name" />);

		expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
	});

	it("shows entered value", async () => {
		const user = userEvent.setup();

		render(<Input aria-label="Test input" />);

		const input = screen.getByRole("textbox");
		await user.type(input, "Hello world");

		expect(input).toHaveValue("Hello world");
	});

	it("is keyboard focusable", () => {
		render(<Input aria-label="Test input" />);

		const input = screen.getByRole("textbox");
		input.focus();

		expect(document.activeElement).toBe(input);
	});

	it("has accessible name when used with label", () => {
		render(
			<>
				<label htmlFor="email-input">Email address</label>
				<Input id="email-input" />
			</>,
		);

		expect(screen.getByLabelText("Email address")).toBeInTheDocument();
	});

	it("passes vitest-axe accessibility checks", async () => {
		const { container } = render(
			<>
				<label htmlFor="accessible-input">Username</label>
				<Input id="accessible-input" />
			</>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("forwards ref to input element", () => {
		const ref = createRef<HTMLInputElement>();

		render(<Input ref={ref} aria-label="Test" />);

		expect(ref.current).toBeInstanceOf(HTMLInputElement);
	});

	it("calls onChange when value changes", async () => {
		const user = userEvent.setup();
		const handleChange = vi.fn();

		render(<Input aria-label="Test" onChange={handleChange} />);

		await user.type(screen.getByRole("textbox"), "a");

		expect(handleChange).toHaveBeenCalled();
	});

	it("accepts all variant and size props without error", () => {
		const variants = ["default", "error"] as const;
		const sizes = ["sm", "md", "lg"] as const;

		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<Input variant={variant} size={size} aria-label="Test" />,
				);
				expect(screen.getByRole("textbox")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("applies custom className", () => {
		render(<Input aria-label="Test" className="custom-class" />);

		expect(screen.getByRole("textbox")).toHaveClass("custom-class");
	});

	it("is disabled when disabled prop is set", () => {
		render(<Input disabled aria-label="Test" />);

		expect(screen.getByRole("textbox")).toBeDisabled();
	});

	it("supports aria-invalid for error state", () => {
		render(<Input aria-invalid="true" aria-label="Test" />);

		expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
	});
});
