import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { createRef, useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { Toggle } from "./toggle";

function ControlledToggle() {
	const [pressed, setPressed] = useState(false);
	return (
		<Toggle pressed={pressed} onPressedChange={setPressed}>
			Toggle
		</Toggle>
	);
}

describe("Toggle", () => {
	it("toggles state when clicked", async () => {
		const user = userEvent.setup();
		render(<Toggle>Toggle</Toggle>);
		const button = screen.getByRole("button");

		expect(button).toHaveAttribute("aria-pressed", "false");
		await user.click(button);
		expect(button).toHaveAttribute("aria-pressed", "true");
		await user.click(button);
		expect(button).toHaveAttribute("aria-pressed", "false");
	});

	it("works in controlled mode", async () => {
		const user = userEvent.setup();
		render(<ControlledToggle />);
		const button = screen.getByRole("button");

		expect(button).toHaveAttribute("aria-pressed", "false");
		await user.click(button);
		expect(button).toHaveAttribute("aria-pressed", "true");
	});

	it("calls onPressedChange callback", async () => {
		const user = userEvent.setup();
		const onPressedChange = vi.fn();
		render(<Toggle onPressedChange={onPressedChange}>Toggle</Toggle>);

		await user.click(screen.getByRole("button"));
		expect(onPressedChange).toHaveBeenCalledWith(true);
	});

	it("does not toggle when disabled", async () => {
		const user = userEvent.setup();
		const onPressedChange = vi.fn();
		render(
			<Toggle disabled onPressedChange={onPressedChange}>
				Toggle
			</Toggle>
		);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		await user.click(button);
		expect(onPressedChange).not.toHaveBeenCalled();
	});

	it("supports render props pattern", async () => {
		const user = userEvent.setup();
		render(
			<Toggle>
				{({ pressed, ...props }) => (
					<button {...props}>{pressed ? "ON" : "OFF"}</button>
				)}
			</Toggle>
		);

		expect(screen.getByText("OFF")).toBeInTheDocument();
		await user.click(screen.getByRole("button"));
		expect(screen.getByText("ON")).toBeInTheDocument();
	});

	it("toggles with Space and Enter keys", async () => {
		const user = userEvent.setup();
		render(<Toggle>Toggle</Toggle>);
		const button = screen.getByRole("button");

		button.focus();
		await user.keyboard(" ");
		expect(button).toHaveAttribute("aria-pressed", "true");

		await user.keyboard("{Enter}");
		expect(button).toHaveAttribute("aria-pressed", "false");
	});

	it("passes axe accessibility checks", async () => {
		const { container } = render(<Toggle>Toggle</Toggle>);
		expect(await axe(container)).toHaveNoViolations();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<Toggle ref={ref}>Toggle</Toggle>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});
});
