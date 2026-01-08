import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Column } from "./column";
import { ColumnContent } from "./column-content";
import { ColumnFooter } from "./column-footer";
import { ColumnHeader } from "./column-header";

vi.mock("@dnd-kit/react", () => ({
	useDroppable: () => ({
		ref: vi.fn(),
		isDropTarget: false,
	}),
}));

describe("Column", () => {
	it("renders children with compound component API", () => {
		render(
			<Column id="test">
				<ColumnHeader title="Todo" />
				<ColumnContent>Test content</ColumnContent>
				<ColumnFooter>Footer</ColumnFooter>
			</Column>
		);
		expect(screen.getByText("Test content")).toBeInTheDocument();
		expect(screen.getByText("Footer")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Column id="ref-test" ref={ref} className="custom">
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	it("has role='region' for accessibility", () => {
		render(
			<Column id="a11y" data-testid="column">
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(screen.getByTestId("column")).toHaveAttribute("role", "region");
	});

	it("accepts all variant/fluid/size props without error", () => {
		const variants = ["default", "active"] as const;
		const fluids = [true, false] as const;
		const sizes = ["sm", "md", "lg"] as const;
		variants.forEach((variant) => {
			fluids.forEach((fluid) => {
				sizes.forEach((size) => {
					const { unmount } = render(
						<Column id={`${variant}-${fluid}-${size}`} variant={variant} fluid={fluid} size={size}>
							<ColumnContent>Content</ColumnContent>
						</Column>
					);
					expect(screen.getByText("Content")).toBeInTheDocument();
					unmount();
				});
			});
		});
	});

	it("supports controlled collapse state", () => {
		const onCollapsedChange = vi.fn();
		render(
			<Column id="controlled" collapsed={false} onCollapsedChange={onCollapsedChange}>
				<ColumnHeader title="Test" showCollapseButton />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);

		const collapseButton = screen.getByRole("button");
		fireEvent.click(collapseButton);
		expect(onCollapsedChange).toHaveBeenCalledWith(true);
	});

	it("supports uncontrolled collapse with defaultCollapsed", () => {
		render(
			<Column id="uncontrolled" defaultCollapsed>
				<ColumnHeader title="Test" />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);

		const content = screen.getByText("Content");
		expect(content).toHaveAttribute("aria-hidden", "true");
	});

	it("passes items count to context", () => {
		const items = [{ id: 1 }, { id: 2 }, { id: 3 }];
		render(
			<Column id="items" items={items}>
				<ColumnHeader title="Test" />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(screen.getByText("3")).toBeInTheDocument();
	});

	it("passes size to context for header/badge", () => {
		render(
			<Column id="size" size="lg" items={[1, 2]}>
				<ColumnHeader title="Large" />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(screen.getByText("Large")).toBeInTheDocument();
		expect(screen.getByText("2")).toBeInTheDocument();
	});
});

describe("ColumnHeader", () => {
	const renderWithColumn = (headerProps: Parameters<typeof ColumnHeader>[0]) =>
		render(
			<Column id="header-test">
				<ColumnHeader {...headerProps} />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);

	it("renders title and count from context", () => {
		render(
			<Column id="count" items={[1, 2, 3, 4, 5]}>
				<ColumnHeader title="Todo" />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(screen.getByText("Todo")).toBeInTheDocument();
		expect(screen.getByText("5")).toBeInTheDocument();
	});

	it("allows count override via prop", () => {
		render(
			<Column id="override" items={[1, 2, 3]}>
				<ColumnHeader title="Todo" count={99} />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);
		expect(screen.getByText("99")).toBeInTheDocument();
	});

	it("renders title as h2", () => {
		renderWithColumn({ title: "Test" });
		expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Test");
	});

	it("renders dot indicator when dotColor is provided", () => {
		const { container } = renderWithColumn({ title: "Test", dotColor: "bg-green-500" });
		expect(container.querySelector("[data-column-dot]")).toBeInTheDocument();
	});

	it("toggles collapse on button click", () => {
		render(
			<Column id="toggle">
				<ColumnHeader title="Test" showCollapseButton />
				<ColumnContent>Content</ColumnContent>
			</Column>
		);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-expanded", "true");

		fireEvent.click(button);
		expect(button).toHaveAttribute("aria-expanded", "false");
	});

	it("hides collapse button when showCollapseButton is false", () => {
		renderWithColumn({ title: "Test", showCollapseButton: false });
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});

describe("ColumnContent", () => {
	it("renders children", () => {
		render(
			<Column id="content">
				<ColumnContent>Child content</ColumnContent>
			</Column>
		);
		expect(screen.getByText("Child content")).toBeInTheDocument();
	});

	it("has data-column-content attribute", () => {
		render(
			<Column id="slot">
				<ColumnContent data-testid="content">Content</ColumnContent>
			</Column>
		);
		expect(screen.getByTestId("content")).toHaveAttribute("data-column-content");
	});

	it("sets aria-hidden when collapsed", () => {
		render(
			<Column id="hidden" defaultCollapsed>
				<ColumnContent data-testid="content">Content</ColumnContent>
			</Column>
		);
		expect(screen.getByTestId("content")).toHaveAttribute("aria-hidden", "true");
	});
});

describe("ColumnFooter", () => {
	it("renders children", () => {
		render(
			<Column id="footer">
				<ColumnContent>Content</ColumnContent>
				<ColumnFooter>Footer content</ColumnFooter>
			</Column>
		);
		expect(screen.getByText("Footer content")).toBeInTheDocument();
	});

	it("has data-column-footer attribute", () => {
		render(
			<Column id="footer-slot">
				<ColumnContent>Content</ColumnContent>
				<ColumnFooter data-testid="footer">Footer</ColumnFooter>
			</Column>
		);
		expect(screen.getByTestId("footer")).toHaveAttribute("data-column-footer");
	});
});
