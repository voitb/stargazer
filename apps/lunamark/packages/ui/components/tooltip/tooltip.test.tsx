import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { useState } from "react";
import { describe, it, expect } from "vitest";
import { Tooltip, TooltipTrigger, TooltipContent } from "./tooltip";

function TestTooltip() {
	return (
		<Tooltip delayDuration={0}>
			<TooltipTrigger>
				<button>Hover me</button>
			</TooltipTrigger>
			<TooltipContent>Tooltip content</TooltipContent>
		</Tooltip>
	);
}

function ControlledTooltip({ initialOpen = false }: { initialOpen?: boolean }) {
	const [open, setOpen] = useState(initialOpen);
	return (
		<Tooltip open={open} onOpenChange={setOpen} delayDuration={0}>
			<TooltipTrigger>
				<button>Hover me</button>
			</TooltipTrigger>
			<TooltipContent>Tooltip content</TooltipContent>
		</Tooltip>
	);
}

describe("Tooltip", () => {
	it("shows tooltip on hover", async () => {
		const user = userEvent.setup();
		render(<TestTooltip />);

		expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

		await user.hover(screen.getByRole("button"));

		await waitFor(() => {
			expect(screen.getByRole("tooltip")).toHaveTextContent("Tooltip content");
		});
	});

	it("shows tooltip on focus", async () => {
		render(<TestTooltip />);

		act(() => {
			screen.getByRole("button").focus();
		});

		await waitFor(() => {
			expect(screen.getByRole("tooltip")).toBeInTheDocument();
		});
	});

	it("dismisses tooltip on Escape key", async () => {
		const user = userEvent.setup();
		render(<ControlledTooltip initialOpen={true} />);

		expect(screen.getByRole("tooltip")).toBeInTheDocument();

		await user.keyboard("{Escape}");

		await waitFor(() => {
			expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
		}, { timeout: 500 });
	});

	it("passes axe accessibility checks", async () => {
		render(
			<main>
				<ControlledTooltip initialOpen={true} />
			</main>
		);

		const results = await axe(document.body, {
			rules: { region: { enabled: false } },
		});
		expect(results).toHaveNoViolations();
	});
});
