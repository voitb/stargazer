import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MultiSelectChips } from "./multi-select-chips";

const options = [
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
	it("renders chips for all visible options", () => {
		render(<MultiSelectChips options={options.slice(0, 3)} aria-label="Frameworks" />);

		expect(screen.getByRole("button", { name: "React" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Vue" })).toBeInTheDocument();
		expect(screen.getByRole("button", { name: "Angular" })).toBeInTheDocument();
	});

	it("selects chip on click", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();

		render(
			<MultiSelectChips
				options={options}
				values={[]}
				onValuesChange={onValuesChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "React" }));

		expect(onValuesChange).toHaveBeenCalledWith(["react"]);
	});

	it("deselects chip on click", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();

		render(
			<MultiSelectChips
				options={options}
				values={["react"]}
				onValuesChange={onValuesChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: /React/i }));

		expect(onValuesChange).toHaveBeenCalledWith([]);
	});

	it("reflects selection state with aria-pressed", () => {
		render(<MultiSelectChips options={options} values={["react"]} />);

		expect(screen.getByRole("button", { name: /React/i })).toHaveAttribute("aria-pressed", "true");
		expect(screen.getByRole("button", { name: "Vue" })).toHaveAttribute("aria-pressed", "false");
	});

	it("calls onToggle with toggled value", async () => {
		const user = userEvent.setup();
		const onToggle = vi.fn();

		render(<MultiSelectChips options={options} values={[]} onToggle={onToggle} />);

		await user.click(screen.getByRole("button", { name: "React" }));

		expect(onToggle).toHaveBeenCalledWith("react");
	});

	it("shows overflow menu when options exceed maxDisplay", async () => {
		const user = userEvent.setup();
		render(<MultiSelectChips options={options} maxDisplay={3} values={[]} />);

		const trigger = screen.getByText("+5");
		expect(trigger).toBeInTheDocument();

		await user.click(trigger);

		expect(screen.getByRole("listbox")).toBeInTheDocument();
	});

	it("clears all selections when Clear is clicked", async () => {
		const user = userEvent.setup();
		const onValuesChange = vi.fn();

		render(
			<MultiSelectChips
				options={options}
				values={["react", "vue"]}
				onValuesChange={onValuesChange}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Clear" }));

		expect(onValuesChange).toHaveBeenCalledWith([]);
	});
});
