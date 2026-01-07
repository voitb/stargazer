
import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import {
	FormControl,
	type FormControlRenderProps,
	FormDescription,
	FormError,
	FormField,
	FormLabel,
} from "./index";

describe("FormField", () => {
	it("renders label and children", () => {
		render(
			<FormField>
				<FormLabel>Username</FormLabel>
				<FormControl>
					{(props) => <input type="text" {...props} />}
				</FormControl>
			</FormField>,
		);

		expect(screen.getByText("Username")).toBeInTheDocument();
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("renders description when provided", () => {
		render(
			<FormField>
				<FormLabel>Email</FormLabel>
				<FormControl>
					{(props) => <input type="email" {...props} />}
				</FormControl>
				<FormDescription>We'll never share it</FormDescription>
			</FormField>,
		);

		expect(screen.getByText("We'll never share it")).toBeInTheDocument();
	});

	it("renders error and still renders description (unless manually hidden)", () => {
		render(
			<FormField error="Invalid email">
				<FormLabel>Email</FormLabel>
				<FormControl>
					{(props) => <input type="email" {...props} />}
				</FormControl>
				<FormDescription>Help text</FormDescription>
				<FormError />
			</FormField>,
		);

		expect(screen.getByText("Help text")).toBeInTheDocument();
		expect(screen.getByText("Invalid email")).toBeInTheDocument();
	});

	it("renders with horizontal layout variant", () => {
		render(
			<FormField layout="horizontal">
				<FormLabel>Email</FormLabel>
				<FormControl>
					{(props) => <input type="email" {...props} />}
				</FormControl>
			</FormField>,
		);
		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("renders with compact layout variant", () => {
		render(
			<FormField layout="compact">
				<FormLabel>Email</FormLabel>
				<FormControl>
					{(props) => <input type="email" {...props} />}
				</FormControl>
			</FormField>,
		);

		expect(screen.getByRole("textbox")).toBeInTheDocument();
	});

	it("accepts all layout and size props without error", () => {
		const layouts = ["vertical", "horizontal", "compact"] as const;
		const sizes = ["sm", "md", "lg"] as const;

		layouts.forEach((layout) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<FormField layout={layout} size={size}>
						<FormLabel>Email</FormLabel>
						<FormControl>
							{(props) => <input type="email" {...props} />}
						</FormControl>
					</FormField>,
				);
				expect(screen.getByRole("textbox")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("associates label with input via htmlFor", () => {
		render(
			<FormField>
				<FormLabel>Username</FormLabel>
				<FormControl>{(props) => <input {...props} />}</FormControl>
			</FormField>,
		);

		expect(screen.getByLabelText("Username")).toBeInTheDocument();
	});

	it("links description to input via aria-describedby", () => {
		const { container } = render(
			<FormField>
				<FormLabel>Email</FormLabel>
				<FormControl>{(props) => <input {...props} />}</FormControl>
				<FormDescription>Enter your email</FormDescription>
			</FormField>,
		);
		const input = container.querySelector("input");
		expect(input).toHaveAttribute("aria-describedby");

		const describedById = input?.getAttribute("aria-describedby");
		const descriptionElement = document.getElementById(
			describedById?.split(" ")[0] || "",
		);
		expect(descriptionElement).toHaveTextContent("Enter your email");
	});

	it("error has role=alert for screen readers", () => {
		render(
			<FormField error="Invalid email">
				<FormLabel>Email</FormLabel>
				<FormControl>{(props) => <input {...props} />}</FormControl>
				<FormError />
			</FormField>,
		);

		expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(
			<FormField>
				<FormLabel>Email</FormLabel>
				<FormControl>{(props) => <input {...props} />}</FormControl>
				<FormDescription>Help text</FormDescription>
			</FormField>,
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	it("provides correct render props based on state", () => {
		let receivedProps: FormControlRenderProps | null = null;

		const { rerender } = render(
			<FormField>
				<FormControl>
					{(props) => {
						receivedProps = props;
						return <input {...props} />;
					}}
				</FormControl>
			</FormField>,
		);

		expect(receivedProps!.id).toBeDefined();
		expect(receivedProps!["aria-invalid"]).toBeUndefined();

		rerender(
			<FormField error="Error">
				<FormControl>
					{(props) => {
						receivedProps = props;
						return <input {...props} />;
					}}
				</FormControl>
				<FormDescription>Help</FormDescription>
				<FormError />
			</FormField>,
		);

		expect(receivedProps!["aria-describedby"]).toBeDefined();
		expect(receivedProps!["aria-invalid"]).toBe(true);
	});

	it("forwards ref to container div", () => {
		const ref = createRef<HTMLDivElement>();

		render(
			<FormField ref={ref}>
				<FormLabel>Test</FormLabel>
				<FormControl>{(props) => <input {...props} />}</FormControl>
			</FormField>,
		);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});
