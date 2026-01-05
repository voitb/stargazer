import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { configureAxe } from "vitest-axe";

// Configure axe for component testing (not full page)
// Disable rules that don't apply to isolated component tests or are Floating UI internals
const componentAxe = configureAxe({
	rules: {
		// Component testing doesn't have page landmarks
		region: { enabled: false },
		// Floating UI's focus guards have role="button" without labels (library internals)
		"aria-command-name": { enabled: false },
	},
});
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxOption,
	ComboboxSeparator,
} from "./combobox";

const mockOptions = [
	{ value: "react", label: "React" },
	{ value: "vue", label: "Vue" },
	{ value: "angular", label: "Angular" },
	{ value: "svelte", label: "Svelte" },
];

function TestCombobox({
	value,
	onValueChange,
	open,
	disabled,
	options = mockOptions,
}: {
	value?: string | null;
	onValueChange?: (value: string | null) => void;
	open?: boolean;
	disabled?: boolean;
	options?: Array<{ value: string; label: string; disabled?: boolean }>;
}) {
	return (
		<Combobox value={value} onValueChange={onValueChange} open={open} disabled={disabled}>
			<ComboboxInput placeholder="Select framework..." />
			<ComboboxContent>
				{options.map((option) => (
					<ComboboxOption key={option.value} value={option.value} disabled={option.disabled}>
						{option.label}
					</ComboboxOption>
				))}
			</ComboboxContent>
		</Combobox>
	);
}

describe("Combobox", () => {
	describe("accessibility", () => {
		it("has no violations when closed", async () => {
			render(<TestCombobox />);
			expect(await componentAxe(document.body)).toHaveNoViolations();
		});

		it("has no violations when open", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			await user.click(screen.getByRole("combobox"));
			expect(await componentAxe(document.body)).toHaveNoViolations();
		});
	});

	describe("core behavior", () => {
		it("opens on click", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			await user.click(screen.getByRole("combobox"));
			expect(screen.getByRole("listbox")).toBeInTheDocument();
		});

		it("closes on Escape", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			await user.click(screen.getByRole("combobox"));
			await user.keyboard("{Escape}");
			await vi.waitFor(() => {
				expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
			});
		});

		it("selects option on click", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			const input = screen.getByRole("combobox") as HTMLInputElement;
			await user.click(input);
			await user.click(screen.getByRole("option", { name: "React" }));
			expect(input.value).toBe("React");
		});

		it("selects option with keyboard", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			const input = screen.getByRole("combobox") as HTMLInputElement;
			await user.click(input);
			await user.keyboard("{ArrowDown}{Enter}");
			expect(input.value).toBe("React");
		});

		it("navigates with arrow keys", async () => {
			const user = userEvent.setup();
			render(<TestCombobox />);
			await user.click(screen.getByRole("combobox"));
			await user.keyboard("{ArrowDown}{ArrowDown}");
			expect(screen.getByRole("option", { name: "Vue" })).toHaveAttribute(
				"data-highlighted",
				"true",
			);
		});

		it("disabled options cannot be selected", async () => {
			const user = userEvent.setup();
			const onValueChange = vi.fn();
			render(
				<TestCombobox
					options={[...mockOptions, { value: "disabled", label: "Disabled", disabled: true }]}
					onValueChange={onValueChange}
				/>,
			);
			await user.click(screen.getByRole("combobox"));
			await user.click(screen.getByRole("option", { name: "Disabled" }));
			expect(onValueChange).not.toHaveBeenCalled();
		});
	});

	describe("API contract", () => {
		it("respects controlled value", async () => {
			const user = userEvent.setup();
			render(<TestCombobox value="react" />);
			await user.click(screen.getByRole("combobox"));
			expect(screen.getByRole("option", { name: "React" })).toHaveAttribute(
				"aria-selected",
				"true",
			);
		});

		it("respects controlled open", () => {
			render(<TestCombobox open={true} />);
			expect(screen.getByRole("listbox")).toBeInTheDocument();
		});

		it("forwards ref to input", () => {
			const ref = createRef<HTMLInputElement>();
			render(
				<Combobox>
					<ComboboxInput ref={ref} />
					<ComboboxContent>
						<ComboboxOption value="test">Test</ComboboxOption>
					</ComboboxContent>
				</Combobox>,
			);
			expect(ref.current).toBeInstanceOf(HTMLInputElement);
		});
	});

	describe("subcomponents", () => {
		it("renders Empty, Group, Separator", async () => {
			const user = userEvent.setup();
			render(
				<Combobox>
					<ComboboxInput />
					<ComboboxContent>
						<ComboboxGroup label="Frameworks">
							<ComboboxOption value="react">React</ComboboxOption>
						</ComboboxGroup>
						<ComboboxSeparator />
						<ComboboxEmpty>No results</ComboboxEmpty>
					</ComboboxContent>
				</Combobox>,
			);
			await user.click(screen.getByRole("combobox"));
			expect(screen.getByRole("group", { name: "Frameworks" })).toBeInTheDocument();
			expect(screen.getByRole("separator")).toBeInTheDocument();
			expect(screen.getByText("No results")).toBeInTheDocument();
		});
	});
});
