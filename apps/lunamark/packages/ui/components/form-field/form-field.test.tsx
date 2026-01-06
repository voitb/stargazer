import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { FormField, type FormFieldRenderProps } from "./form-field";

describe("FormField", () => {
	// BEHAVIOR
	it("renders label and children", () => {
		render(
			<FormField label="Username">
				<input type="text" />
			</FormField>,
		);

		expect(screen.getByText("Username")).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("renders description when provided and no error", () => {
		render(
			<FormField label="Email" description="We'll never share it">
				<input type="email" />
			</FormField>,
		);

		expect(screen.getByText("We'll never share it")).toBeInTheDocument();
	});

	it("renders error and hides description when error provided", () => {
		render(
			<FormField label="Email" description="Help text" error="Invalid email">
				<input type="email" />
			</FormField>,
		);

		expect(screen.queryByText("Help text")).not.toBeInTheDocument();
		expect(screen.getByText("Invalid email")).toBeInTheDocument();
	});

	// ACCESSIBILITY
	it("associates label with input via htmlFor", () => {
		render(
			<FormField label="Username">
				{(props) => <input {...props} type="text" />}
			</FormField>,
		);

		expect(screen.getByLabelText("Username")).toBeInTheDocument();
	});

	it("links description to input via aria-describedby", () => {
		render(
			<FormField label="Email" description="Enter your email">
				{(props) => <input {...props} type="email" />}
			</FormField>,
		);

		const input = screen.getByLabelText("Email");
		expect(input).toHaveAttribute("aria-describedby");

		const describedById = input.getAttribute("aria-describedby");
		const descriptionElement = document.getElementById(describedById!);
		expect(descriptionElement).toHaveTextContent("Enter your email");
	});

	it("error has role=alert for screen readers", () => {
		render(
			<FormField label="Email" error="Invalid email">
				{(props) => <input {...props} type="email" />}
			</FormField>,
		);

		expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(
			<FormField label="Email" description="Help text">
				{(props) => <input {...props} type="email" />}
			</FormField>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	// RENDER PROPS
	it("provides correct render props based on state", () => {
		let receivedProps: FormFieldRenderProps | null = null;

		const { rerender } = render(
			<FormField label="Email">
				{(props) => {
					receivedProps = props;
					return <input {...props} type="email" />;
				}}
			</FormField>,
		);

		expect(receivedProps!.id).toBeDefined();
		expect(receivedProps!["aria-invalid"]).toBeUndefined();

		rerender(
			<FormField label="Email" description="Help" error="Error">
				{(props) => {
					receivedProps = props;
					return <input {...props} type="email" />;
				}}
			</FormField>,
		);

		expect(receivedProps!["aria-describedby"]).toBeDefined();
		expect(receivedProps!["aria-invalid"]).toBe(true);
	});

	// API CONTRACT
	it("forwards ref to container div", () => {
		const ref = createRef<HTMLDivElement>();

		render(
			<FormField ref={ref} label="Test">
				<input type="text" />
			</FormField>,
		);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
