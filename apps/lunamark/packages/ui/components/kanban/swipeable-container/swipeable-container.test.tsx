import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SwipeableContainer } from "./swipeable-container";

vi.mock("@ui/hooks/navigation/use-swipe-navigation", () => ({
    useSwipeNavigation: ({ onIndexChange: _onIndexChange }: { onIndexChange: (index: number) => void }) => ({
        handleTouchStart: vi.fn(),
        handleTouchMove: vi.fn(),
        handleTouchEnd: vi.fn(),
        containerRef: { current: null },
    }),
}));

describe("SwipeableContainer", () => {
    const defaultProps = {
        activeIndex: 0,
        onIndexChange: vi.fn(),
        children: [
            <div key="0" aria-label="Todo">
                Panel 1
            </div>,
            <div key="1" aria-label="In Progress">
                Panel 2
            </div>,
            <div key="2" aria-label="Done">
                Panel 3
            </div>,
        ],
    };

    it("renders all children as panels", () => {
        render(<SwipeableContainer {...defaultProps} />);
        expect(screen.getByText("Panel 1")).toBeInTheDocument();
        expect(screen.getByText("Panel 2")).toBeInTheDocument();
        expect(screen.getByText("Panel 3")).toBeInTheDocument();
    });

    it("has role='region' for accessibility", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} />);
        expect(container.firstChild).toHaveAttribute("role", "region");
    });

    it("has aria-live attribute for screen reader announcements", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} />);
        expect(container.firstChild).toHaveAttribute("aria-live", "polite");
    });

    it("allows custom ariaLive prop", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} ariaLive="assertive" />);
        expect(container.firstChild).toHaveAttribute("aria-live", "assertive");
    });

    it("announces active tab label via aria-label", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} activeIndex={1} />);
        expect(container.firstChild).toHaveAttribute("aria-label", "Showing In Progress");
    });

    it("falls back to Column N when no aria-label on child", () => {
        const propsWithoutLabels = {
            ...defaultProps,
            children: [<div key="0">Panel 1</div>, <div key="1">Panel 2</div>],
        };
        const { container } = render(<SwipeableContainer {...propsWithoutLabels} activeIndex={1} />);
        expect(container.firstChild).toHaveAttribute("aria-label", "Showing Column 2");
    });

    it("renders children with role='tabpanel'", () => {
        render(<SwipeableContainer {...defaultProps} />);
        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        expect(panels).toHaveLength(3);
    });

    it("sets tabIndex=0 on active panel and -1 on others", () => {
        render(<SwipeableContainer {...defaultProps} activeIndex={1} />);
        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        expect(panels[0]).toHaveAttribute("tabindex", "-1");
        expect(panels[1]).toHaveAttribute("tabindex", "0");
        expect(panels[2]).toHaveAttribute("tabindex", "-1");
    });

    it("hides inactive panels with hidden attribute", () => {
        render(<SwipeableContainer {...defaultProps} activeIndex={0} />);
        const panels = screen.getAllByRole("tabpanel", { hidden: true });
        expect(panels[0]).not.toHaveAttribute("hidden");
        expect(panels[1]).toHaveAttribute("hidden");
        expect(panels[2]).toHaveAttribute("hidden");
    });

    it("accepts className prop", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} className="custom-class" />);
        expect(container.firstChild).toHaveClass("custom-class");
    });

    it("has aria-atomic='true' for complete announcements", () => {
        const { container } = render(<SwipeableContainer {...defaultProps} />);
        expect(container.firstChild).toHaveAttribute("aria-atomic", "true");
    });
});
