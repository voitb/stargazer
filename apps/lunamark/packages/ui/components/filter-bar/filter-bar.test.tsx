import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { FilterBar } from "./filter-bar";

describe("FilterBar", () => {
  describe("rendering", () => {
    it("renders children content", () => {
      render(<FilterBar>Filter content</FilterBar>);

      expect(screen.getByText("Filter content")).toBeInTheDocument();
    });

    it("applies custom className", () => {
      render(<FilterBar className="custom-class">Content</FilterBar>);

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveClass("custom-class");
    });

    it("forwards ref", () => {
      const ref = createRef<HTMLDivElement>();
      render(<FilterBar ref={ref}>Content</FilterBar>);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    it("spreads additional props", () => {
      render(
        <FilterBar data-testid="filter-bar" id="main-filters">
          Content
        </FilterBar>,
      );

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveAttribute("data-testid", "filter-bar");
      expect(toolbar).toHaveAttribute("id", "main-filters");
    });
  });

  describe("accessibility", () => {
    it("has toolbar role", () => {
      render(<FilterBar>Content</FilterBar>);

      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("applies aria-label", () => {
      render(<FilterBar aria-label="Filter tasks">Content</FilterBar>);

      const toolbar = screen.getByRole("toolbar", { name: "Filter tasks" });
      expect(toolbar).toBeInTheDocument();
    });

    it("has data-filter-bar attribute", () => {
      render(<FilterBar>Content</FilterBar>);

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveAttribute("data-filter-bar");
    });
  });

  describe("clear button", () => {
    it("shows when hasActiveFilters=true and onClear provided", () => {
      render(
        <FilterBar hasActiveFilters onClear={() => {}}>
          Content
        </FilterBar>,
      );

      expect(
        screen.getByRole("button", { name: "Clear filters" }),
      ).toBeInTheDocument();
    });

    it("hidden when hasActiveFilters=false", () => {
      render(
        <FilterBar hasActiveFilters={false} onClear={() => {}}>
          Content
        </FilterBar>,
      );

      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).not.toBeInTheDocument();
    });

    it("hidden when onClear not provided", () => {
      render(<FilterBar hasActiveFilters>Content</FilterBar>);

      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).not.toBeInTheDocument();
    });

    it("has ml-auto class for right alignment", () => {
      render(
        <FilterBar hasActiveFilters onClear={() => {}}>
          Content
        </FilterBar>,
      );

      const button = screen.getByRole("button", { name: "Clear filters" });
      expect(button).toHaveClass("ml-auto");
    });
  });

  describe("interaction", () => {
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

    it("clear button is keyboard accessible with Enter", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <FilterBar hasActiveFilters onClear={onClear}>
          Content
        </FilterBar>,
      );

      const button = screen.getByRole("button", { name: "Clear filters" });
      button.focus();
      await user.keyboard("{Enter}");

      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it("clear button is keyboard accessible with Space", async () => {
      const user = userEvent.setup();
      const onClear = vi.fn();

      render(
        <FilterBar hasActiveFilters onClear={onClear}>
          Content
        </FilterBar>,
      );

      const button = screen.getByRole("button", { name: "Clear filters" });
      button.focus();
      await user.keyboard(" ");

      expect(onClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("default props", () => {
    it("hasActiveFilters defaults to false", () => {
      render(<FilterBar onClear={() => {}}>Content</FilterBar>);

      expect(
        screen.queryByRole("button", { name: "Clear filters" }),
      ).not.toBeInTheDocument();
    });
  });
});
