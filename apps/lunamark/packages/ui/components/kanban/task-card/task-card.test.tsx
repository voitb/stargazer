import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { TaskCard, TaskCardHeader, TaskCardContent, TaskCardFooter } from "./index";

describe("TaskCard", () => {
	it("renders children", () => {
		render(<TaskCard>Card content</TaskCard>);
		expect(screen.getByText("Card content")).toBeInTheDocument();
	});

	it("has data-slot='task-card'", () => {
		render(<TaskCard data-testid="card">Content</TaskCard>);
		expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "task-card");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(<TaskCard ref={ref} className="custom">Content</TaskCard>);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("calls onClick handler", () => {
		const handleClick = vi.fn();
		render(<TaskCard onClick={handleClick} data-testid="card">Content</TaskCard>);
		fireEvent.click(screen.getByTestId("card"));
		expect(handleClick).toHaveBeenCalledTimes(1);
	});

	it("accepts drag state props without error", () => {
		const dragStates = [
			{ isDragging: true, isDragOverlay: false },
			{ isDragging: false, isDragOverlay: true },
			{ isDragging: true, isDragOverlay: true },
		];
		dragStates.forEach((props) => {
			const { unmount } = render(<TaskCard {...props}>Content</TaskCard>);
			expect(screen.getByText("Content")).toBeInTheDocument();
			unmount();
		});
	});
});

describe("TaskCard Sub-components", () => {
	it.each([
		{ Component: TaskCardHeader, slot: "task-card-header" },
		{ Component: TaskCardContent, slot: "task-card-content" },
		{ Component: TaskCardFooter, slot: "task-card-footer" },
	])("$slot renders with correct data-slot and forwards ref", ({ Component, slot }) => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Component ref={ref} data-testid="element" className="custom">
				Content
			</Component>
		);
		const element = screen.getByTestId("element");
		expect(element).toHaveAttribute("data-slot", slot);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("TaskCard Composition", () => {
	it("renders all sub-components together", () => {
		render(
			<TaskCard>
				<TaskCardHeader>Header</TaskCardHeader>
				<TaskCardContent>Content</TaskCardContent>
				<TaskCardFooter>Footer</TaskCardFooter>
			</TaskCard>
		);
		expect(screen.getByText("Header")).toBeInTheDocument();
		expect(screen.getByText("Content")).toBeInTheDocument();
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});
});
