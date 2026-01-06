import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { FilterGroup } from "./filter-group";

describe("FilterGroup", () => {
	describe("rendering", () => {
		it("renders children content", () => {
			render(<FilterGroup label="Test">Filter content</FilterGroup>);

			expect(screen.getByText("Filter content")).toBeInTheDocument();
		});

		it("renders label text", () => {
			render(<FilterGroup label="Priority">Content</FilterGroup>);

			expect(screen.getByText("Priority")).toBeInTheDocument();
		});

		it("applies custom className", () => {
			render(
				<FilterGroup label="Test" className="custom-class">
					Content
				</FilterGroup>,
			);

			const group = screen.getByRole("group");
			expect(group.className).toContain("custom-class");
		});

		it("forwards ref", () => {
			const ref = createRef<HTMLDivElement>();
			render(
				<FilterGroup ref={ref} label="Test">
					Content
				</FilterGroup>,
			);

			expect(ref.current).toBeInstanceOf(HTMLDivElement);
		});

		it("spreads additional props", () => {
			render(
				<FilterGroup label="Test" data-testid="filter-group" id="priority-group">
					Content
				</FilterGroup>,
			);

			const group = screen.getByRole("group");
			expect(group).toHaveAttribute("data-testid", "filter-group");
			expect(group).toHaveAttribute("id", "priority-group");
		});
	});

	describe("accessibility", () => {
		it("has role group", () => {
			render(<FilterGroup label="Test">Content</FilterGroup>);

			expect(screen.getByRole("group")).toBeInTheDocument();
		});

		it("aria-labelledby links to visible label text", () => {
			render(<FilterGroup label="Priority">Content</FilterGroup>);

			const group = screen.getByRole("group");
			const labelId = group.getAttribute("aria-labelledby");
			expect(labelId).toBeTruthy();
			expect(document.getElementById(labelId!)).toHaveTextContent("Priority");
		});

		it("is accessible by role with name query", () => {
			render(<FilterGroup label="Priority">Content</FilterGroup>);

			expect(
				screen.getByRole("group", { name: "Priority" }),
			).toBeInTheDocument();
		});
	});

	describe("visibility", () => {
		it("renders when visible is true by default", () => {
			render(<FilterGroup label="Test">Content</FilterGroup>);

			expect(screen.getByRole("group")).toBeInTheDocument();
		});

		it("returns null when visible is false", () => {
			const { container } = render(
				<FilterGroup label="Hidden" visible={false}>
					Content
				</FilterGroup>,
			);

			expect(container).toBeEmptyDOMElement();
		});
	});
});
