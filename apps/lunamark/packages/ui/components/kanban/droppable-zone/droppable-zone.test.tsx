import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DroppableZone } from "./droppable-zone";

const mockUseDroppable = vi.fn();

vi.mock("@dnd-kit/react", () => ({
	useDroppable: (props: unknown) => mockUseDroppable(props),
}));

describe("DroppableZone", () => {
	beforeEach(() => {
		mockUseDroppable.mockReset();
		mockUseDroppable.mockReturnValue({
			ref: vi.fn(),
			isDropTarget: false,
		});
	});

	it("renders static children", () => {
		render(<DroppableZone id="test">Content</DroppableZone>);
		expect(screen.getByText("Content")).toBeInTheDocument();
	});

	it("renders function children and passes isDropTarget", () => {
		render(
			<DroppableZone id="test">
				{(isDropTarget) => <span data-testid="indicator">{String(isDropTarget)}</span>}
			</DroppableZone>
		);
		expect(screen.getByTestId("indicator")).toHaveTextContent("false");
	});

	it("calls useDroppable with correct props", () => {
		render(
			<DroppableZone
				id="col-1"
				type="column"
				accept={["task"]}
				data={{ index: 0 }}
				disabled={true}
			>
				Content
			</DroppableZone>
		);
		expect(mockUseDroppable).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "col-1",
				type: "column",
				accept: ["task"],
				data: { index: 0 },
				disabled: true,
			})
		);
	});

	it("uses default type and accept values", () => {
		render(<DroppableZone id="zone-1">Content</DroppableZone>);
		expect(mockUseDroppable).toHaveBeenCalledWith(
			expect.objectContaining({
				id: "zone-1",
				type: "column",
				accept: ["item"],
			})
		);
	});
});
