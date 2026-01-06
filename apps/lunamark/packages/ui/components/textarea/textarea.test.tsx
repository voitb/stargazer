import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Textarea } from "./textarea";

describe("Textarea", () => {
	it("renders with placeholder text", () => {
		render(<Textarea placeholder="Enter your message" />);

		expect(screen.getByPlaceholderText("Enter your message")).toBeInTheDocument();
	});

	it("accepts user input", async () => {
		const user = userEvent.setup();
		render(<Textarea placeholder="Type here" />);

		await user.type(screen.getByPlaceholderText("Type here"), "Hello World");

		expect(screen.getByPlaceholderText("Type here")).toHaveValue("Hello World");
	});

	it("shows aria-invalid when in error state", () => {
		render(<Textarea aria-invalid={true} placeholder="Invalid" />);

		expect(screen.getByPlaceholderText("Invalid")).toHaveAttribute("aria-invalid", "true");
	});

	it("prevents input when disabled", () => {
		render(<Textarea disabled placeholder="Disabled" />);

		expect(screen.getByPlaceholderText("Disabled")).toBeDisabled();
	});

	it("prevents editing when readonly", () => {
		render(<Textarea readOnly defaultValue="Read only content" />);

		expect(screen.getByDisplayValue("Read only content")).toHaveAttribute("readonly");
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(
			<label>
				Message
				<Textarea placeholder="Enter your message" />
			</label>
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
