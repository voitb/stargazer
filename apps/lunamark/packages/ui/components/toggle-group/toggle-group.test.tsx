import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { createRef, useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

function SingleSelectGroup({ initialValue = null }: { initialValue?: string | null }) {
	const [value, setValue] = useState<string | null>(initialValue);
	return (
		<ToggleGroup type="single" value={value} onValueChange={setValue}>
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
			<ToggleGroupItem value="c">C</ToggleGroupItem>
		</ToggleGroup>
	);
}

function MultiSelectGroup({ initialValues = [] }: { initialValues?: string[] }) {
	const [values, setValues] = useState<string[]>(initialValues);
	return (
		<ToggleGroup type="multiple" values={values} onValuesChange={setValues}>
			<ToggleGroupItem value="a">A</ToggleGroupItem>
			<ToggleGroupItem value="b">B</ToggleGroupItem>
			<ToggleGroupItem value="c">C</ToggleGroupItem>
		</ToggleGroup>
	);
}

describe("ToggleGroup", () => {
	describe("Single Selection", () => {
		it("selects and changes selection on click", async () => {
			const user = userEvent.setup();
			render(<SingleSelectGroup />);

			await user.click(screen.getByRole("radio", { name: "A" }));
			expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("aria-checked", "true");

			await user.click(screen.getByRole("radio", { name: "B" }));
			expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("aria-checked", "false");
			expect(screen.getByRole("radio", { name: "B" })).toHaveAttribute("aria-checked", "true");
		});

		it("deselects when clicking selected item", async () => {
			const user = userEvent.setup();
			render(<SingleSelectGroup initialValue="a" />);

			await user.click(screen.getByRole("radio", { name: "A" }));
			expect(screen.getByRole("radio", { name: "A" })).toHaveAttribute("aria-checked", "false");
		});

		it("calls onValueChange with correct value", async () => {
			const onValueChange = vi.fn();
			render(
				<ToggleGroup type="single" value={null} onValueChange={onValueChange}>
					<ToggleGroupItem value="a">A</ToggleGroupItem>
				</ToggleGroup>
			);

			await userEvent.click(screen.getByRole("radio", { name: "A" }));
			expect(onValueChange).toHaveBeenCalledWith("a");
		});
	});

	describe("Multiple Selection", () => {
		it("toggles individual items independently", async () => {
			const user = userEvent.setup();
			render(<MultiSelectGroup />);

			await user.click(screen.getByRole("button", { name: "A" }));
			await user.click(screen.getByRole("button", { name: "B" }));

			expect(screen.getByRole("button", { name: "A" })).toHaveAttribute("aria-pressed", "true");
			expect(screen.getByRole("button", { name: "B" })).toHaveAttribute("aria-pressed", "true");
			expect(screen.getByRole("button", { name: "C" })).toHaveAttribute("aria-pressed", "false");
		});

		it("calls onValuesChange with updated array", async () => {
			const onValuesChange = vi.fn();
			render(
				<ToggleGroup type="multiple" values={["a"]} onValuesChange={onValuesChange}>
					<ToggleGroupItem value="a">A</ToggleGroupItem>
					<ToggleGroupItem value="b">B</ToggleGroupItem>
				</ToggleGroup>
			);

			await userEvent.click(screen.getByRole("button", { name: "B" }));
			expect(onValuesChange).toHaveBeenCalledWith(["a", "b"]);
		});
	});

	describe("Accessibility", () => {
		it("single mode uses radiogroup role, multiple uses toolbar", () => {
			const { rerender } = render(<SingleSelectGroup />);
			expect(screen.getByRole("radiogroup")).toBeInTheDocument();

			rerender(<MultiSelectGroup />);
			expect(screen.getByRole("toolbar")).toBeInTheDocument();
		});

		it("passes axe checks", async () => {
			const { container } = render(<SingleSelectGroup initialValue="a" />);
			expect(await axe(container)).toHaveNoViolations();
		});
	});

	describe("Keyboard Navigation", () => {
		it("arrow keys move focus between items", async () => {
			const user = userEvent.setup();
			render(<SingleSelectGroup />);

			screen.getByRole("radio", { name: "A" }).focus();
			await user.keyboard("{ArrowRight}");
			expect(document.activeElement).toBe(screen.getByRole("radio", { name: "B" }));

			await user.keyboard("{ArrowLeft}");
			expect(document.activeElement).toBe(screen.getByRole("radio", { name: "A" }));
		});

		it("Home and End move to first and last items", async () => {
			const user = userEvent.setup();
			render(<SingleSelectGroup />);

			screen.getByRole("radio", { name: "B" }).focus();
			await user.keyboard("{Home}");
			expect(document.activeElement).toBe(screen.getByRole("radio", { name: "A" }));

			await user.keyboard("{End}");
			expect(document.activeElement).toBe(screen.getByRole("radio", { name: "C" }));
		});
	});

	describe("API Contract", () => {
		it("throws when ToggleGroupItem used outside provider", () => {
			const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
			expect(() => render(<ToggleGroupItem value="a">A</ToggleGroupItem>)).toThrow(
				"ToggleGroupItem must be used within a ToggleGroup provider"
			);
			consoleError.mockRestore();
		});

		it("forwards ref to group and item", () => {
			const groupRef = createRef<HTMLDivElement>();
			const itemRef = createRef<HTMLButtonElement>();
			render(
				<ToggleGroup ref={groupRef} type="single" value={null} onValueChange={() => {}}>
					<ToggleGroupItem ref={itemRef} value="a">A</ToggleGroupItem>
				</ToggleGroup>
			);
			expect(groupRef.current).toBeInstanceOf(HTMLDivElement);
			expect(itemRef.current).toBeInstanceOf(HTMLButtonElement);
		});
	});
});
