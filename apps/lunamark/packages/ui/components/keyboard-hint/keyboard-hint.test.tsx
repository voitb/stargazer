import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { KeyboardHint } from "./keyboard-hint";

describe("KeyboardHint", () => {
	// BEHAVIOR
	it("renders a single key", () => {
		render(<KeyboardHint keys={["K"]} />);

		expect(screen.getByText("K")).toBeInTheDocument();
	});

	it("renders multiple keys with separators", () => {
		render(<KeyboardHint keys={["Ctrl", "Shift", "P"]} />);

		expect(screen.getByText("Ctrl")).toBeInTheDocument();
		expect(screen.getByText("Shift")).toBeInTheDocument();
		expect(screen.getByText("P")).toBeInTheDocument();
		expect(screen.getAllByText("+")).toHaveLength(2);
	});

	// ACCESSIBILITY
	it("passes vitest-axe accessibility checks", async () => {
		const { container } = render(<KeyboardHint keys={["Cmd", "K"]} />);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});

	// API CONTRACT
	it("accepts all variant and size props without error", () => {
		const variants = ["default", "inverted"] as const;
		const sizes = ["sm", "md", "lg"] as const;

		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<KeyboardHint keys={["Test"]} variant={variant} size={size} />,
				);
				expect(screen.getByText("Test")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();

		render(<KeyboardHint keys={["K"]} ref={ref} />);

		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("spreads additional props", () => {
		render(
			<KeyboardHint
				keys={["Esc"]}
				data-testid="shortcut"
				aria-label="Press Escape to close"
			/>,
		);

		const element = screen.getByTestId("shortcut");
		expect(element).toHaveAttribute("aria-label", "Press Escape to close");
	});
});
