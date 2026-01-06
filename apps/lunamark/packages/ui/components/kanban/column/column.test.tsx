import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Column, ColumnHeader } from "./column";

describe("Column", () => {
	it("renders children", () => {
		render(<Column>Test content</Column>);
		expect(screen.getByText("Test content")).toBeInTheDocument();
	});

	it("forwards ref and className", () => {
		const ref = createRef<HTMLDivElement>();
		render(<Column ref={ref} className="custom">Content</Column>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
		expect(ref.current).toHaveClass("custom");
	});

	it("has role='region' for accessibility", () => {
		render(<Column data-testid="column">Content</Column>);
		expect(screen.getByTestId("column")).toHaveAttribute("role", "region");
	});

	it("renders header slot when provided", () => {
		render(<Column header={<span>Header</span>}>Content</Column>);
		expect(screen.getByText("Header")).toBeInTheDocument();
	});

	it("renders footer slot when provided", () => {
		render(<Column footer={<span>Footer</span>}>Content</Column>);
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("accepts all variant/size props without error", () => {
		const variants = ["default", "active"] as const;
		const sizes = ["sm", "md", "lg"] as const;
		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(<Column variant={variant} size={size}>Content</Column>);
				expect(screen.getByText("Content")).toBeInTheDocument();
				unmount();
			});
		});
	});
});

describe("ColumnHeader", () => {
	it("renders title and count", () => {
		render(<ColumnHeader title="Todo" count={5} />);
		expect(screen.getByText("Todo")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<ColumnHeader ref={ref} title="Test" count={0} />);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("renders title as h2", () => {
		render(<ColumnHeader title="Test" count={0} />);
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Test");
	});

	it("renders dotColor when provided", () => {
		const { container } = render(<ColumnHeader title="Test" count={0} dotColor="bg-green-500" />);
		expect(container.querySelector(".rounded-full")).toBeInTheDocument();
	});
});
