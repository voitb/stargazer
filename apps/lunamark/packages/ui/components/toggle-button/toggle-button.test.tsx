import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { ToggleButton } from "./toggle-button";

describe("ToggleButton", () => {
	it("renders unpressed by default", () => {
		render(<ToggleButton>Toggle</ToggleButton>);
		const button = screen.getByRole("button", { name: "Toggle" });
		expect(button).toHaveAttribute("aria-pressed", "false");
		expect(button).toHaveAttribute("data-state", "off");
	});

	it("toggles state in uncontrolled mode", async () => {
		const user = userEvent.setup();
		const onPressedChange = vi.fn();
		render(<ToggleButton onPressedChange={onPressedChange}>Toggle</ToggleButton>);

		const button = screen.getByRole("button", { name: "Toggle" });
		await user.click(button);

		expect(button).toHaveAttribute("aria-pressed", "true");
		expect(button).toHaveAttribute("data-state", "on");
		expect(onPressedChange).toHaveBeenCalledWith(true);
	});

	it("respects defaultPressed", () => {
		render(<ToggleButton defaultPressed>Toggle</ToggleButton>);
		const button = screen.getByRole("button", { name: "Toggle" });
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("calls onPressedChange without mutating controlled state", async () => {
		const user = userEvent.setup();
		const onPressedChange = vi.fn();
		render(
			<ToggleButton pressed={true} onPressedChange={onPressedChange}>
				Toggle
			</ToggleButton>,
		);

		const button = screen.getByRole("button", { name: "Toggle" });
		await user.click(button);

		expect(onPressedChange).toHaveBeenCalledWith(false);
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<ToggleButton ref={ref}>Toggle</ToggleButton>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("accepts all variant and size props without error", () => {
		const variants = ["default", "ghost", "outline"] as const;
		const sizes = ["sm", "md", "lg"] as const;

		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<ToggleButton variant={variant} size={size}>
						Toggle
					</ToggleButton>,
				);
				expect(screen.getByRole("button")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("calls onClick alongside state updates", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();
		render(<ToggleButton onClick={onClick}>Toggle</ToggleButton>);

		const button = screen.getByRole("button", { name: "Toggle" });
		await user.click(button);

		expect(onClick).toHaveBeenCalledOnce();
	});
});
