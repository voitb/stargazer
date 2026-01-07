import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ColumnTabs } from "./column-tabs";

describe("ColumnTabs", () => {
    const defaultTabs = [
        { id: "todo", title: "To Do", count: 5, color: "#3b82f6" },
        { id: "progress", title: "In Progress", count: 3 },
        { id: "done", title: "Done", count: 8, color: "#22c55e" },
    ];

    const defaultProps = {
        tabs: defaultTabs,
        activeIndex: 0,
        onTabChange: vi.fn(),
    };

    it("renders all tabs", () => {
        render(<ColumnTabs {...defaultProps} />);
        expect(screen.getByText("To Do")).toBeInTheDocument();
        expect(screen.getByText("In Progress")).toBeInTheDocument();
        expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("displays tab counts", () => {
        render(<ColumnTabs {...defaultProps} />);
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.getByText("3")).toBeInTheDocument();
        expect(screen.getByText("8")).toBeInTheDocument();
    });

    it("has role='tablist' for accessibility", () => {
        render(<ColumnTabs {...defaultProps} />);
        expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("has aria-label on tablist", () => {
        render(<ColumnTabs {...defaultProps} />);
        expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Kanban columns");
    });

    it("renders tabs with role='tab'", () => {
        render(<ColumnTabs {...defaultProps} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs).toHaveLength(3);
    });

    it("sets aria-selected correctly on active tab", () => {
        render(<ColumnTabs {...defaultProps} activeIndex={1} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toHaveAttribute("aria-selected", "false");
        expect(tabs[1]).toHaveAttribute("aria-selected", "true");
        expect(tabs[2]).toHaveAttribute("aria-selected", "false");
    });

    it("sets tabIndex=0 on active tab and -1 on others", () => {
        render(<ColumnTabs {...defaultProps} activeIndex={1} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toHaveAttribute("tabindex", "-1");
        expect(tabs[1]).toHaveAttribute("tabindex", "0");
        expect(tabs[2]).toHaveAttribute("tabindex", "-1");
    });

    it("calls onTabChange when tab is clicked", () => {
        const onTabChange = vi.fn();
        render(<ColumnTabs {...defaultProps} onTabChange={onTabChange} />);
        const tabs = screen.getAllByRole("tab");
        fireEvent.click(tabs[2]);
        expect(onTabChange).toHaveBeenCalledWith(2);
    });

    it("renders color indicators when provided", () => {
        const { container } = render(<ColumnTabs {...defaultProps} />);
        const indicators = container.querySelectorAll("[aria-hidden='true']");
        expect(indicators).toHaveLength(2);
    });

    it("sets aria-controls on tabs", () => {
        render(<ColumnTabs {...defaultProps} />);
        const tabs = screen.getAllByRole("tab");
        expect(tabs[0]).toHaveAttribute("aria-controls", "column-panel-todo");
        expect(tabs[1]).toHaveAttribute("aria-controls", "column-panel-progress");
        expect(tabs[2]).toHaveAttribute("aria-controls", "column-panel-done");
    });

    it("accepts variant prop without error", () => {
        render(<ColumnTabs {...defaultProps} variant="default" />);
        expect(screen.getByRole("tablist")).toBeInTheDocument();
    });

    it("has accessible label for count", () => {
        render(<ColumnTabs {...defaultProps} />);
        expect(screen.getByLabelText("5 tasks")).toBeInTheDocument();
        expect(screen.getByLabelText("3 tasks")).toBeInTheDocument();
        expect(screen.getByLabelText("8 tasks")).toBeInTheDocument();
    });
});
