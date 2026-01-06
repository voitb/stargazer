import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import { Select, SelectGroup } from "./select";

describe("Select", () => {
	it("renders with placeholder", () => {
		render(
			<Select aria-label="Fruit" placeholder="Choose a fruit">
				<option value="apple">Apple</option>
			</Select>,
		);

		expect(screen.getByText("Choose a fruit")).toBeInTheDocument();
		expect(screen.getByText("Choose a fruit")).toBeDisabled();
	});

	it("calls onValueChange when selection changes", async () => {
		const user = userEvent.setup();
		const onValueChange = vi.fn();

		render(
			<Select aria-label="Fruit" onValueChange={onValueChange}>
				<option value="apple">Apple</option>
				<option value="banana">Banana</option>
			</Select>,
		);

		await user.selectOptions(screen.getByRole("combobox"), "banana");

		expect(onValueChange).toHaveBeenCalledWith("banana");
	});

	it("supports controlled value", () => {
		const { rerender } = render(
			<Select aria-label="Fruit" value="apple" onValueChange={() => {}}>
				<option value="apple">Apple</option>
				<option value="banana">Banana</option>
			</Select>,
		);

		expect(screen.getByRole("combobox")).toHaveValue("apple");

		rerender(
			<Select aria-label="Fruit" value="banana" onValueChange={() => {}}>
				<option value="apple">Apple</option>
				<option value="banana">Banana</option>
			</Select>,
		);

		expect(screen.getByRole("combobox")).toHaveValue("banana");
	});

	it("is disabled when disabled prop is true", () => {
		render(
			<Select aria-label="Fruit" disabled>
				<option value="apple">Apple</option>
			</Select>,
		);

		expect(screen.getByRole("combobox")).toBeDisabled();
	});

	it("sets aria-invalid when variant is error", () => {
		render(
			<Select aria-label="Fruit" variant="error">
				<option value="apple">Apple</option>
			</Select>,
		);

		expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSelectElement>();

		render(
			<Select ref={ref} aria-label="Fruit">
				<option value="apple">Apple</option>
			</Select>,
		);

		expect(ref.current).toBeInstanceOf(HTMLSelectElement);
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(
			<label>
				Fruit
				<Select>
					<option value="apple">Apple</option>
					<option value="banana">Banana</option>
				</Select>
			</label>,
		);

		expect(await axe(container)).toHaveNoViolations();
	});

	describe("SelectGroup", () => {
		it("renders optgroup with label", () => {
			render(
				<Select aria-label="Food">
					<SelectGroup label="Fruits">
						<option value="apple">Apple</option>
					</SelectGroup>
					<SelectGroup label="Vegetables">
						<option value="carrot">Carrot</option>
					</SelectGroup>
				</Select>,
			);

			expect(screen.getByRole("group", { name: "Fruits" })).toBeInTheDocument();
			expect(screen.getByRole("group", { name: "Vegetables" })).toBeInTheDocument();
		});
	});
});
