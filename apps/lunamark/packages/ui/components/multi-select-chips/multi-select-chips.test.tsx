import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelectChips } from "./multi-select-chips";

const mockOptions = [
	{ value: "react", label: "React" },
	{ value: "vue", label: "Vue" },
	{ value: "angular", label: "Angular" },
	{ value: "svelte", label: "Svelte" },
	{ value: "solid", label: "Solid" },
	{ value: "qwik", label: "Qwik" },
	{ value: "preact", label: "Preact" },
	{ value: "lit", label: "Lit" },
];

describe("MultiSelectChips", () => {
	describe("ARIA attributes", () => {
		it("renders with role=group and aria-label", () => {
			render(
				<MultiSelectChips
					options={mockOptions}
					aria-label="Select frameworks"
				/>,
			);

			const group = screen.getByRole("group", { name: "Select frameworks" });
			expect(group).toBeInTheDocument();
		});

		it("selected chips have aria-pressed=true and data-state=selected", () => {
			render(
				<MultiSelectChips options={mockOptions} values={["react", "vue"]} />,
			);

			const reactChip = screen.getByRole("button", { name: /React/i });
			expect(reactChip).toHaveAttribute("aria-pressed", "true");
			expect(reactChip).toHaveAttribute("data-state", "selected");
		});

		it("unselected chips have aria-pressed=false and data-state=unselected", () => {
			render(<MultiSelectChips options={mockOptions} values={["react"]} />);

			const vueChip = screen.getByRole("button", { name: "Vue" });
			expect(vueChip).toHaveAttribute("aria-pressed", "false");
			expect(vueChip).toHaveAttribute("data-state", "unselected");
		});

		it("overflow trigger has aria-haspopup=listbox and aria-expanded", () => {
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={2} values={[]} />,
			);

			const trigger = screen.getByText(/\+\d/);
			expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
			expect(trigger).toHaveAttribute("aria-expanded", "false");
		});
	});

	describe("overflow menu ARIA", () => {
		it("overflow menu has role=listbox and aria-multiselectable", async () => {
			const user = userEvent.setup();
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={2} values={[]} />,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			const listbox = screen.getByRole("listbox", { name: "Additional options" });
			expect(listbox).toBeInTheDocument();
			expect(listbox).toHaveAttribute("aria-multiselectable", "true");
		});

		it("overflow items have role=option and aria-selected", async () => {
			const user = userEvent.setup();
			render(
				<MultiSelectChips
					options={mockOptions}
					maxDisplay={2}
					values={["angular"]}
				/>,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			const options = screen.getAllByRole("option");
			expect(options.length).toBeGreaterThan(0);

			// Check for aria-selected on overflow items
			options.forEach((option) => {
				expect(option).toHaveAttribute("aria-selected");
			});
		});
	});

	describe("selection behavior", () => {
		it("clicking unselected chip calls onValuesChange with new value", async () => {
			const user = userEvent.setup();
			const onValuesChange = vi.fn();

			render(
				<MultiSelectChips
					options={mockOptions}
					values={[]}
					onValuesChange={onValuesChange}
				/>,
			);

			const reactChip = screen.getByRole("button", { name: "React" });
			await user.click(reactChip);

			expect(onValuesChange).toHaveBeenCalledWith(["react"]);
		});

		it("clicking selected chip removes it from values", async () => {
			const user = userEvent.setup();
			const onValuesChange = vi.fn();

			render(
				<MultiSelectChips
					options={mockOptions}
					values={["react"]}
					onValuesChange={onValuesChange}
				/>,
			);

			const reactChip = screen.getByRole("button", { name: /React/i });
			await user.click(reactChip);

			expect(onValuesChange).toHaveBeenCalledWith([]);
		});

		it("clicking Clear removes all selections", async () => {
			const user = userEvent.setup();
			const onValuesChange = vi.fn();

			render(
				<MultiSelectChips
					options={mockOptions}
					values={["react", "vue"]}
					onValuesChange={onValuesChange}
				/>,
			);

			const clearButton = screen.getByRole("button", { name: "Clear" });
			await user.click(clearButton);

			expect(onValuesChange).toHaveBeenCalledWith([]);
		});

		it("onToggle is called with the toggled value", async () => {
			const user = userEvent.setup();
			const onToggle = vi.fn();

			render(
				<MultiSelectChips
					options={mockOptions}
					values={[]}
					onToggle={onToggle}
				/>,
			);

			const reactChip = screen.getByRole("button", { name: "React" });
			await user.click(reactChip);

			expect(onToggle).toHaveBeenCalledWith("react");
		});
	});

	describe("overflow behavior", () => {
		it("shows overflow trigger when options exceed maxDisplay", () => {
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={3} values={[]} />,
			);

			const trigger = screen.getByText(`+${mockOptions.length - 3}`);
			expect(trigger).toBeInTheDocument();
		});

		it("does not show overflow trigger when options fit within maxDisplay", () => {
			render(
				<MultiSelectChips
					options={mockOptions.slice(0, 3)}
					maxDisplay={6}
					values={[]}
				/>,
			);

			const trigger = screen.queryByText(/\+\d/);
			expect(trigger).not.toBeInTheDocument();
		});

		it("opens overflow menu on trigger click", async () => {
			const user = userEvent.setup();
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={2} values={[]} />,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			const listbox = screen.getByRole("listbox");
			expect(listbox).toBeInTheDocument();
		});

		it("closes overflow menu on Escape", async () => {
			const user = userEvent.setup();
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={2} values={[]} />,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			expect(screen.getByRole("listbox")).toBeInTheDocument();

			await user.keyboard("{Escape}");

			// Wait for exit animation
			await vi.waitFor(() => {
				expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
			});
		});
	});

	describe("keyboard navigation in overflow menu", () => {
		it("listbox opens with keyboard navigation enabled", async () => {
			const user = userEvent.setup();
			render(
				<MultiSelectChips options={mockOptions} maxDisplay={2} values={[]} />,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			const listbox = screen.getByRole("listbox");
			expect(listbox).toBeInTheDocument();

			const options = screen.getAllByRole("option");
			// All options should be present
			expect(options.length).toBeGreaterThan(0);

			// Options should have tabIndex attribute (keyboard navigable)
			options.forEach((option) => {
				expect(option).toHaveAttribute("tabIndex");
			});
		});

		it("clicking option in overflow menu selects it", async () => {
			const user = userEvent.setup();
			const onValuesChange = vi.fn();

			render(
				<MultiSelectChips
					options={mockOptions}
					maxDisplay={2}
					values={[]}
					onValuesChange={onValuesChange}
				/>,
			);

			const trigger = screen.getByText(/\+\d/);
			await user.click(trigger);

			const options = screen.getAllByRole("option");
			await user.click(options[0]);

			expect(onValuesChange).toHaveBeenCalled();
		});
	});

	describe("controlled vs uncontrolled", () => {
		it("works in uncontrolled mode - selections persist", async () => {
			const user = userEvent.setup();
			render(<MultiSelectChips options={mockOptions} aria-label="Frameworks" />);

			// Initially, React chip should be unselected
			const reactChipUnselected = screen.getByRole("button", { name: "React" });
			expect(reactChipUnselected).toHaveAttribute("aria-pressed", "false");

			// Click to select
			await user.click(reactChipUnselected);

			// After click, there should be a selected React chip with aria-pressed="true"
			// The chip moves to selectedOptions and re-renders as SelectedChip
			const selectedChips = screen
				.getAllByRole("button")
				.filter((btn) => btn.getAttribute("aria-pressed") === "true");
			expect(selectedChips.length).toBeGreaterThan(0);

			// Clear button should appear when there are selections
			expect(screen.getByRole("button", { name: "Clear" })).toBeInTheDocument();
		});

		it("respects controlled values prop", () => {
			const { rerender } = render(
				<MultiSelectChips options={mockOptions} values={["react"]} />,
			);

			expect(
				screen.getByRole("button", { name: /React/i }),
			).toHaveAttribute("aria-pressed", "true");

			rerender(<MultiSelectChips options={mockOptions} values={["vue"]} />);

			expect(
				screen.getByRole("button", { name: /Vue/i }),
			).toHaveAttribute("aria-pressed", "true");
			expect(
				screen.getByRole("button", { name: "React" }),
			).toHaveAttribute("aria-pressed", "false");
		});
	});
});
