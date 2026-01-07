import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "vitest-axe";
import { describe, it, expect, vi } from "vitest";
import {
	Dropdown,
	DropdownTrigger,
	DropdownContent,
	DropdownItem,
	DropdownSeparator,
	DropdownLabel,
	type DropdownTriggerRenderProps,
} from "./index";

function setup(jsx: React.ReactElement) {
	return {
		user: userEvent.setup(),
		...render(jsx),
	};
}

type TestDropdownProps = {
	trigger?: "hover" | "click";
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	items?: Array<{
		value: string;
		label: string;
		onSelect?: () => void;
		disabled?: boolean;
	}>;
};

function TestDropdown({
	trigger = "click",
	open,
	onOpenChange,
	items = [
		{ value: "profile", label: "Profile" },
		{ value: "settings", label: "Settings" },
		{ value: "logout", label: "Log out" },
	],
}: TestDropdownProps) {
	return (
		<Dropdown trigger={trigger} open={open} onOpenChange={onOpenChange}>
			<DropdownTrigger>
				{({ isOpen: _isOpen, ...props }: DropdownTriggerRenderProps) => (
					<button data-testid="trigger" {...props}>
						Open Menu
					</button>
				)}
			</DropdownTrigger>
			<DropdownContent data-testid="content">
				<DropdownLabel>Actions</DropdownLabel>
				{items.map((item) => (
					<DropdownItem
						key={item.value}
						onSelect={item.onSelect}
						disabled={item.disabled}
						data-testid={`item-${item.value}`}
					>
						{item.label}
					</DropdownItem>
				))}
				<DropdownSeparator />
			</DropdownContent>
		</Dropdown>
	);
}

describe("Dropdown", () => {
	it("opens on click and closes on Escape/outside click", async () => {
		const { user } = setup(
			<div>
				<TestDropdown />
				<button data-testid="outside">Outside</button>
			</div>,
		);

		expect(screen.queryByTestId("content")).not.toBeInTheDocument();

		await user.click(screen.getByTestId("trigger"));
		expect(screen.getByTestId("content")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByTestId("content")).not.toBeInTheDocument();
		});

		await user.click(screen.getByTestId("trigger"));
		expect(screen.getByTestId("content")).toBeInTheDocument();

		await user.click(screen.getByTestId("outside"));
		await waitFor(() => {
			expect(screen.queryByTestId("content")).not.toBeInTheDocument();
		});
	});

	it("opens on hover when trigger='hover'", async () => {
		const { user } = setup(<TestDropdown trigger="hover" />);

		await user.hover(screen.getByTestId("trigger"));
		await waitFor(() => {
			expect(screen.getByTestId("content")).toBeInTheDocument();
		});

		await user.unhover(screen.getByTestId("trigger"));
		await waitFor(
			() => {
				expect(screen.queryByTestId("content")).not.toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});

	it("calls onSelect when item clicked and closes", async () => {
		const onSelect = vi.fn();
		const { user } = setup(
			<TestDropdown items={[{ value: "test", label: "Test", onSelect }]} />,
		);

		await user.click(screen.getByTestId("trigger"));
		await user.click(screen.getByTestId("item-test"));

		expect(onSelect).toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.queryByTestId("content")).not.toBeInTheDocument();
		});
	});

	it("supports controlled open state", async () => {
		const { user, rerender } = setup(<TestDropdown open={true} />);

		expect(screen.getByTestId("content")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(screen.getByTestId("content")).toBeInTheDocument();

		rerender(<TestDropdown open={false} />);
		await waitFor(() => {
			expect(screen.queryByTestId("content")).not.toBeInTheDocument();
		});
	});

	it("calls onOpenChange callback", async () => {
		const onOpenChange = vi.fn();
		const { user } = setup(<TestDropdown onOpenChange={onOpenChange} />);

		await user.click(screen.getByTestId("trigger"));
		expect(onOpenChange).toHaveBeenCalledWith(true);

		await user.keyboard("{Escape}");
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("navigates with keyboard (Arrow keys, Enter) and loops", async () => {
		const onSelect = vi.fn();
		const { user } = setup(
			<TestDropdown
				items={[
					{ value: "first", label: "First", onSelect },
					{ value: "second", label: "Second" },
					{ value: "third", label: "Third" },
				]}
			/>,
		);

		await user.click(screen.getByTestId("trigger"));

		await user.keyboard("{ArrowDown}");
		expect(screen.getByTestId("item-first")).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowDown}");
		expect(screen.getByTestId("item-second")).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowUp}");
		expect(screen.getByTestId("item-first")).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowUp}");
		expect(screen.getByTestId("item-third")).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowDown}");
		expect(screen.getByTestId("item-first")).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{Enter}");
		expect(onSelect).toHaveBeenCalled();
	});

	it("supports typeahead search", async () => {
		const { user } = setup(<TestDropdown />);

		await user.click(screen.getByTestId("trigger"));
		await user.keyboard("s");

		expect(screen.getByTestId("item-settings")).toHaveAttribute("data-highlighted", "true");
	});

	it("disabled items don't trigger onSelect", async () => {
		const onSelect = vi.fn();
		const { user } = setup(
			<TestDropdown
				items={[{ value: "disabled", label: "Disabled", onSelect, disabled: true }]}
			/>,
		);

		await user.click(screen.getByTestId("trigger"));
		await user.click(screen.getByTestId("item-disabled"));

		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByTestId("content")).toBeInTheDocument();
	});

	it("passes axe accessibility checks", async () => {
		render(<TestDropdown open={true} />);
		const results = await axe(document.body, {
			rules: {
				"aria-command-name": { enabled: false },
				region: { enabled: false },
			},
		});
		expect(results).toHaveNoViolations();
	});

	it("render props expose isOpen state", async () => {
		const { user } = setup(
			<Dropdown>
				<DropdownTrigger>
					{({ isOpen, ...props }: DropdownTriggerRenderProps) => (
						<button data-testid="trigger" data-open={isOpen} {...props}>
							{isOpen ? "Close" : "Open"}
						</button>
					)}
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem>Item</DropdownItem>
				</DropdownContent>
			</Dropdown>,
		);

		expect(screen.getByTestId("trigger")).toHaveTextContent("Open");
		expect(screen.getByTestId("trigger")).toHaveAttribute("data-open", "false");

		await user.click(screen.getByTestId("trigger"));

		expect(screen.getByTestId("trigger")).toHaveTextContent("Close");
		expect(screen.getByTestId("trigger")).toHaveAttribute("data-open", "true");
	});

	it("throws when components used outside provider", () => {
		const consoleError = vi.spyOn(console, "error").mockImplementation(() => { });

		expect(() => render(<DropdownTrigger>Trigger</DropdownTrigger>)).toThrow(
			"<DropdownTrigger> must be used within a <Dropdown> provider",
		);
		expect(() => render(<DropdownContent><DropdownItem>Item</DropdownItem></DropdownContent>)).toThrow(
			"<DropdownContent> must be used within a <Dropdown> provider",
		);
		expect(() => render(<DropdownItem>Item</DropdownItem>)).toThrow(
			"<DropdownItem> must be used within a <Dropdown> provider",
		);

		consoleError.mockRestore();
	});

});
