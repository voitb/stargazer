import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Badge } from "./badge";

describe("Badge", () => {
	it("renders children correctly", () => {
		render(<Badge>Status</Badge>);
		expect(screen.getByText("Status")).toBeInTheDocument();
	});

	it("accepts all variant and size props without error", () => {
		const variants = [
			"default",
			"secondary",
			"success",
			"warning",
			"danger",
			"outline",
		] as const;
		const sizes = ["sm", "md", "lg", "icon"] as const;

		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<Badge variant={variant} size={size}>
						Test
					</Badge>,
				);
				expect(screen.getByText("Test")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Badge ref={ref}>Test</Badge>);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("spreads additional props", () => {
		render(
			<Badge data-testid="my-badge" aria-label="Status badge">
				Test
			</Badge>,
		);
		const badge = screen.getByTestId("my-badge");
		expect(badge).toHaveAttribute("aria-label", "Status badge");
	});

	it("passes className to render function for polymorphism", () => {
		render(
			<Badge variant="success">
				{({ className }) => (
					<a href="/status" className={className}>
						Link Badge
					</a>
				)}
			</Badge>,
		);

		const link = screen.getByRole("link");
		expect(link).toHaveTextContent("Link Badge");
		expect(link).toHaveAttribute("href", "/status");
	});

	it("allows custom element rendering with className and ref", () => {
		const ref = createRef<HTMLButtonElement>();

		render(
			<Badge variant="outline" className="extra-class">
				{({ className, ref: badgeRef }) => (
					<button
						type="button"
						className={className}
						ref={(el) => {
							if (typeof badgeRef === "function") badgeRef(el);
							(ref as React.MutableRefObject<HTMLButtonElement | null>).current =
								el;
						}}
					>
						Button Badge
					</button>
				)}
			</Badge>,
		);

		const button = screen.getByRole("button");
		expect(button).toHaveTextContent("Button Badge");
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
