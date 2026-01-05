import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { createRef, useState } from "react";
import { describe, it, expect, vi, afterEach } from "vitest";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "./dialog";

function ControlledDialog({
	initialOpen = false,
	closeOnBackdropClick = true,
}: {
	initialOpen?: boolean;
	closeOnBackdropClick?: boolean;
}) {
	const [open, setOpen] = useState(initialOpen);
	return (
		<>
			<button data-testid="trigger" onClick={() => setOpen(true)}>
				Open
			</button>
			<Dialog
				open={open}
				onOpenChange={setOpen}
				closeOnBackdropClick={closeOnBackdropClick}
			>
				<DialogContent data-testid="dialog-content">
					<DialogHeader>
						<DialogTitle>Test Dialog Title</DialogTitle>
						<DialogDescription>Test dialog description text</DialogDescription>
					</DialogHeader>
					<input data-testid="dialog-input" placeholder="Input field" />
					<DialogFooter>
						<button onClick={() => setOpen(false)}>Cancel</button>
						<button>Confirm</button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}

describe("Dialog", () => {
	afterEach(() => {
		document.body.style.overflow = "";
	});

	// BEHAVIOR
	it("renders when open and unmounts when closed", async () => {
		vi.useFakeTimers();
		const { rerender } = render(
			<Dialog open={true} onOpenChange={() => {}}>
				<DialogContent>Content</DialogContent>
			</Dialog>,
		);
		expect(screen.getByRole("dialog")).toBeInTheDocument();

		rerender(
			<Dialog open={false} onOpenChange={() => {}}>
				<DialogContent>Content</DialogContent>
			</Dialog>,
		);
		await act(() => vi.advanceTimersByTime(150));
		expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		vi.useRealTimers();
	});

	it("uses data-state for exit animation", () => {
		const { rerender } = render(
			<Dialog open={true} onOpenChange={() => {}}>
				<DialogContent data-testid="dialog">Content</DialogContent>
			</Dialog>,
		);
		expect(screen.getByTestId("dialog")).toHaveAttribute("data-state", "open");

		rerender(
			<Dialog open={false} onOpenChange={() => {}}>
				<DialogContent data-testid="dialog">Content</DialogContent>
			</Dialog>,
		);
		expect(screen.getByTestId("dialog")).toHaveAttribute("data-state", "closed");
	});

	it("locks body scroll when open and restores on close", () => {
		document.body.style.overflow = "auto";
		const { rerender } = render(
			<Dialog open={true} onOpenChange={() => {}}>
				<DialogContent>Content</DialogContent>
			</Dialog>,
		);
		expect(document.body.style.overflow).toBe("hidden");

		rerender(
			<Dialog open={false} onOpenChange={() => {}}>
				<DialogContent>Content</DialogContent>
			</Dialog>,
		);
		expect(document.body.style.overflow).toBe("auto");
	});

	// ACCESSIBILITY
	it("has correct ARIA attributes", () => {
		render(
			<Dialog open={true} onOpenChange={() => {}}>
				<DialogContent>
					<DialogTitle>My Title</DialogTitle>
					<DialogDescription>My Description</DialogDescription>
				</DialogContent>
			</Dialog>,
		);
		const dialog = screen.getByRole("dialog");
		expect(dialog).toHaveAttribute("aria-modal", "true");
		expect(dialog).toHaveAttribute("aria-labelledby", screen.getByText("My Title").id);
		expect(dialog).toHaveAttribute("aria-describedby", screen.getByText("My Description").id);
	});

	it("passes axe accessibility checks", async () => {
		render(<ControlledDialog initialOpen={true} />);
		const results = await axe(document.body);
		expect(results).toHaveNoViolations();
	});

	it("traps focus within dialog", async () => {
		render(<ControlledDialog initialOpen={true} />);
		const user = userEvent.setup();

		const closeButton = screen.getByRole("button", { name: "Close" });
		closeButton.focus();
		await user.tab();

		const activeElement = document.activeElement;
		expect(screen.getByTestId("dialog-content").contains(activeElement)).toBe(true);
	});

	// INTERACTION
	it("closes on Escape key", () => {
		const onOpenChange = vi.fn();
		render(
			<Dialog open={true} onOpenChange={onOpenChange}>
				<DialogContent>Content</DialogContent>
			</Dialog>,
		);
		fireEvent.keyDown(document, { key: "Escape" });
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("closes on backdrop click when enabled, not when disabled", () => {
		const onOpenChange = vi.fn();
		const { rerender } = render(
			<Dialog open={true} onOpenChange={onOpenChange} closeOnBackdropClick={true}>
				<DialogContent data-testid="dialog">Content</DialogContent>
			</Dialog>,
		);
		fireEvent.click(screen.getByTestId("dialog").parentElement!);
		expect(onOpenChange).toHaveBeenCalledWith(false);

		onOpenChange.mockClear();
		rerender(
			<Dialog open={true} onOpenChange={onOpenChange} closeOnBackdropClick={false}>
				<DialogContent data-testid="dialog">Content</DialogContent>
			</Dialog>,
		);
		fireEvent.click(screen.getByTestId("dialog").parentElement!);
		expect(onOpenChange).not.toHaveBeenCalled();
	});

	it("closes on close button click", async () => {
		const user = userEvent.setup();
		render(<ControlledDialog initialOpen={true} />);

		await user.click(screen.getByRole("button", { name: "Close" }));
		await waitFor(() => {
			expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
		});
	});

	// API CONTRACT
	it("forwards ref to content element", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<Dialog open={true} onOpenChange={() => {}}>
				<DialogContent ref={ref}>Content</DialogContent>
			</Dialog>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});

	// CONTEXT ERROR
	it("throws error when components used outside Dialog", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
		expect(() => render(<DialogContent>Content</DialogContent>)).toThrow(
			"Dialog components must be used within a Dialog provider",
		);
		consoleError.mockRestore();
	});
});
