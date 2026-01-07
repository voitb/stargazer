import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
	it("renders default message", () => {
		render(<EmptyState />);
		expect(screen.getByText("No items")).toBeInTheDocument();
	});

	it("renders custom message", () => {
		render(<EmptyState message="No tasks here" />);
		expect(screen.getByText("No tasks here")).toBeInTheDocument();
	});

	it("renders icon when provided", () => {
		render(<EmptyState icon={<span data-testid="icon">📭</span>} />);
		expect(screen.getByTestId("icon")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<EmptyState ref={ref} className="custom" data-testid="empty" />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("accepts all variant/size props without error", () => {
		const variants = ["default", "active"] as const;
		const sizes = ["sm", "md", "lg"] as const;
		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(<EmptyState variant={variant} size={size} />);
				expect(screen.getByText("No items")).toBeInTheDocument();
				unmount();
			});
		});
	});
});
