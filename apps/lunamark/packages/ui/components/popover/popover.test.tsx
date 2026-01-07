import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, it, expect, vi } from "vitest";
import { Popover, PopoverTrigger, PopoverContent, PopoverClose } from ".";

function TestPopover() {
	return (
		<Popover trigger="click">
			<PopoverTrigger>Open</PopoverTrigger>
			<PopoverContent>
				<p>Content</p>
				<PopoverClose />
			</PopoverContent>
		</Popover>
	);
}

describe("Popover", () => {
	it("opens on trigger click", async () => {
		const user = userEvent.setup();
		render(<TestPopover />);

		await user.click(screen.getByRole("button", { name: "Open" }));

		await waitFor(() => {
			expect(screen.getByRole("dialog")).toBeInTheDocument();
		});
	});

	it("closes on trigger click when open", async () => {
		const user = userEvent.setup();
		render(<TestPopover />);

		await user.click(screen.getByRole("button", { name: "Open" }));
		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

		await user.click(screen.getByRole("button", { name: "Open" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("uses data-state for exit animation", () => {
		const { rerender } = render(
			<Popover trigger="click" open onOpenChange={() => {}}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);
		expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "open");

		rerender(
			<Popover trigger="click" open={false} onOpenChange={() => {}}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);
		expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed");
	});

	it("closes on PopoverClose click", async () => {
		const user = userEvent.setup();
		render(<TestPopover />);

		await user.click(screen.getByRole("button", { name: "Open" }));
		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

		const dialog = screen.getByRole("dialog");
		await user.click(within(dialog).getByRole("button", { name: "Close" }));
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("closes on outside click", async () => {
		const user = userEvent.setup();
		render(
			<div>
				<TestPopover />
				<button data-testid="outside">Outside</button>
			</div>
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

		await user.click(screen.getByTestId("outside"));
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("closes on Escape key", async () => {
		const user = userEvent.setup();
		render(<TestPopover />);

		await user.click(screen.getByRole("button", { name: "Open" }));
		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());

		await user.keyboard("{Escape}");
		await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
	});

	it("calls onOpenChange when opening and closing", async () => {
		const onOpenChange = vi.fn();
		const user = userEvent.setup();
		render(
			<Popover trigger="click" onOpenChange={onOpenChange}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);

		await user.click(screen.getByRole("button", { name: "Open" }));
		expect(onOpenChange).toHaveBeenCalledWith(true);

		await user.keyboard("{Escape}");
		await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
	});

	it("opens on hover when trigger is hover", async () => {
		const user = userEvent.setup();
		render(
			<Popover trigger="hover">
				<PopoverTrigger>Hover me</PopoverTrigger>
				<PopoverContent>Hover content</PopoverContent>
			</Popover>
		);

		await user.hover(screen.getByRole("button", { name: "Hover me" }));
		await waitFor(() => expect(screen.getByRole("dialog")).toBeInTheDocument());
	});

	it("respects controlled open prop", () => {
		const { rerender } = render(
			<Popover trigger="click" open={false} onOpenChange={() => {}}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

		rerender(
			<Popover trigger="click" open onOpenChange={() => {}}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();
	});

	it("provides isOpen via render props", async () => {
		const user = userEvent.setup();
		render(
			<Popover trigger="click">
				<PopoverTrigger>
					{(props) => (
						<button data-testid="trigger" {...props}>
							{props.isOpen ? "Close" : "Open"}
						</button>
					)}
				</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);

		expect(screen.getByTestId("trigger")).toHaveTextContent("Open");
		await user.click(screen.getByTestId("trigger"));
		await waitFor(() => expect(screen.getByTestId("trigger")).toHaveTextContent("Close"));
	});

	it("has correct ARIA attributes", () => {
		render(
			<Popover trigger="click" open onOpenChange={() => {}}>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Content</PopoverContent>
			</Popover>
		);

		const trigger = screen.getByRole("button", { name: "Open" });
		expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
		expect(trigger).toHaveAttribute("aria-expanded", "true");
	});

	it("passes axe accessibility checks", async () => {
		render(
			<main>
				<Popover trigger="click" open onOpenChange={() => {}}>
					<PopoverTrigger>Open</PopoverTrigger>
					<PopoverContent>Content</PopoverContent>
				</Popover>
			</main>
		);
		const results = await axe(document.body, {
			rules: {
				region: { enabled: false },
				"aria-command-name": { enabled: false }, 
				"aria-dialog-name": { enabled: false }, 
			},
		});
		expect(results).toHaveNoViolations();
	});

	it("throws when used outside provider", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<PopoverTrigger>Trigger</PopoverTrigger>)).toThrow(
			"<PopoverTrigger> must be used within a <Popover> provider"
		);
		consoleError.mockRestore();
	});
});
