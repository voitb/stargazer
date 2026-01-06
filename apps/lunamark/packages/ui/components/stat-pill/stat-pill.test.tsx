import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "vitest-axe";
import { StatPill } from "./stat-pill";

const MockIcon = ({ className }: { className?: string }) => (
	<svg data-testid="mock-icon" className={className} aria-hidden="true">
		<circle cx="12" cy="12" r="10" />
	</svg>
);

describe("StatPill", () => {
	it("renders icon, value, and label", () => {
		render(<StatPill icon={MockIcon} value={42} label="items" />);

		expect(screen.getByTestId("mock-icon")).toBeInTheDocument();
		expect(screen.getByText("42")).toBeInTheDocument();
		expect(screen.getByText("items")).toBeInTheDocument();
	});

	it("renders all variants without error", () => {
		const variants = ["default", "success", "warning", "danger"] as const;

		variants.forEach((variant) => {
			const { unmount } = render(
				<StatPill icon={MockIcon} value={10} label={variant} variant={variant} />
			);
			expect(screen.getByText(variant)).toBeInTheDocument();
			unmount();
		});
	});

	it("hides icon from screen readers", () => {
		render(<StatPill icon={MockIcon} value={42} label="items" />);

		expect(screen.getByTestId("mock-icon")).toHaveAttribute("aria-hidden", "true");
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(
			<StatPill icon={MockIcon} value={42} label="items" />
		);

		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
