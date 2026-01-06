import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
	it("renders children content", () => {
		render(<FilterBar>Filter content</FilterBar>);

		expect(screen.getByText("Filter content")).toBeInTheDocument();
	});

	it("shows clear button only when hasActiveFilters and onClear provided", () => {
		const { rerender } = render(<FilterBar>Content</FilterBar>);
		expect(screen.queryByRole("button", { name: "Clear filters" })).not.toBeInTheDocument();

		rerender(
			<FilterBar hasActiveFilters onClear={() => {}}>
				Content
			</FilterBar>,
		);
		expect(screen.getByRole("button", { name: "Clear filters" })).toBeInTheDocument();
	});

	it("has toolbar role", () => {
		render(<FilterBar>Content</FilterBar>);

		expect(screen.getByRole("toolbar")).toBeInTheDocument();
	});

	it("supports aria-label", () => {
		render(<FilterBar aria-label="Filter tasks">Content</FilterBar>);

		expect(screen.getByRole("toolbar", { name: "Filter tasks" })).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<FilterBar ref={ref}>Content</FilterBar>);

		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("merges custom className", () => {
		render(<FilterBar className="custom-class">Content</FilterBar>);

		expect(screen.getByRole("toolbar")).toHaveClass("custom-class");
	});

	it("calls onClear when clear button clicked", async () => {
		const user = userEvent.setup();
		const onClear = vi.fn();

		render(
			<FilterBar hasActiveFilters onClear={onClear}>
				Content
			</FilterBar>,
		);

		await user.click(screen.getByRole("button", { name: "Clear filters" }));
		expect(onClear).toHaveBeenCalledTimes(1);
	});
});
