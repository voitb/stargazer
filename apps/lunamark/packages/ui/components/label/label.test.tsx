import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { Label } from "./label";

describe("Label", () => {
	it("renders children correctly", () => {
		render(<Label>Username</Label>);

		expect(screen.getByText("Username")).toBeInTheDocument();
	});

	it("shows required asterisk when required prop is true", () => {
		render(<Label required>Email</Label>);

		expect(screen.getByText("*")).toBeInTheDocument();
	});

	it("associates with input element via htmlFor", () => {
		render(
			<>
				<Label htmlFor="email-input">Email address</Label>
				<input id="email-input" type="email" />
			</>,
		);

		expect(screen.getByLabelText("Email address")).toBeInTheDocument();
	});

	it("passes vitest-axe accessibility checks", async () => {
		const { container } = render(
			<>
				<Label htmlFor="name-input">Full name</Label>
				<input id="name-input" type="text" />
			</>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("forwards ref to label element", () => {
		const ref = createRef<HTMLLabelElement>();

		render(<Label ref={ref}>Username</Label>);

		expect(ref.current).toBeInstanceOf(HTMLLabelElement);
	});

	it("spreads additional props", () => {
		render(
			<Label data-testid="my-label" aria-describedby="helper-text">
				Password
			</Label>,
		);

		const label = screen.getByTestId("my-label");
		expect(label).toHaveAttribute("aria-describedby", "helper-text");
	});

	it("accepts className prop without error", () => {
		render(<Label className="custom-style">Username</Label>);

		expect(screen.getByText("Username")).toBeInTheDocument();
	});
});
