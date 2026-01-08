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
					<button {...props}>Open Menu</button>
				)}
			</DropdownTrigger>
			<DropdownContent>
				<DropdownLabel>Actions</DropdownLabel>
				{items.map((item) => (
					<DropdownItem
						key={item.value}
						onSelect={item.onSelect}
						disabled={item.disabled}
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
				<button>Outside</button>
			</div>,
		);

		expect(screen.queryByRole("menu")).not.toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.click(screen.getByRole("button", { name: "Outside" }));
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});
	});

	it("opens on hover when trigger='hover'", async () => {
		const { user } = setup(<TestDropdown trigger="hover" />);

		await user.hover(screen.getByRole("button", { name: "Open Menu" }));
		await waitFor(() => {
			expect(screen.getByRole("menu")).toBeInTheDocument();
		});

		await user.unhover(screen.getByRole("button", { name: "Open Menu" }));
		await waitFor(
			() => {
				expect(screen.queryByRole("menu")).not.toBeInTheDocument();
			},
			{ timeout: 500 },
		);
	});

	it("calls onSelect when item clicked and closes", async () => {
		const onSelect = vi.fn();
		const { user } = setup(
			<TestDropdown items={[{ value: "test", label: "Test", onSelect }]} />,
		);

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
		await user.click(screen.getByRole("menuitem", { name: "Test" }));

		expect(onSelect).toHaveBeenCalled();
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});
	});

	it("supports controlled open state", async () => {
		const { user, rerender } = setup(<TestDropdown open={true} />);

		expect(screen.getByRole("menu")).toBeInTheDocument();

		await user.keyboard("{Escape}");
		expect(screen.getByRole("menu")).toBeInTheDocument();

		rerender(<TestDropdown open={false} />);
		await waitFor(() => {
			expect(screen.queryByRole("menu")).not.toBeInTheDocument();
		});
	});

	it("calls onOpenChange callback", async () => {
		const onOpenChange = vi.fn();
		const { user } = setup(<TestDropdown onOpenChange={onOpenChange} />);

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
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

		await user.click(screen.getByRole("button", { name: "Open Menu" }));

		await user.keyboard("{ArrowDown}");
		expect(screen.getByRole("menuitem", { name: "First" })).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowDown}");
		expect(screen.getByRole("menuitem", { name: "Second" })).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowUp}");
		expect(screen.getByRole("menuitem", { name: "First" })).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowUp}");
		expect(screen.getByRole("menuitem", { name: "Third" })).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{ArrowDown}");
		expect(screen.getByRole("menuitem", { name: "First" })).toHaveAttribute("data-highlighted", "true");

		await user.keyboard("{Enter}");
		expect(onSelect).toHaveBeenCalled();
	});

	it("supports typeahead search", async () => {
		const { user } = setup(<TestDropdown />);

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
		await user.keyboard("s");

		expect(screen.getByRole("menuitem", { name: "Settings" })).toHaveAttribute("data-highlighted", "true");
	});

	it("disabled items don't trigger onSelect", async () => {
		const onSelect = vi.fn();
		const { user } = setup(
			<TestDropdown
				items={[{ value: "disabled", label: "Disabled", onSelect, disabled: true }]}
			/>,
		);

		await user.click(screen.getByRole("button", { name: "Open Menu" }));
		await user.click(screen.getByRole("menuitem", { name: "Disabled" }));

		expect(onSelect).not.toHaveBeenCalled();
		expect(screen.getByRole("menu")).toBeInTheDocument();
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
						<button data-open={isOpen} {...props}>
							{isOpen ? "Close" : "Open"}
						</button>
					)}
				</DropdownTrigger>
				<DropdownContent>
					<DropdownItem>Item</DropdownItem>
				</DropdownContent>
			</Dropdown>,
		);

		expect(screen.getByRole("button", { name: "Open" })).toHaveTextContent("Open");
		expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute("data-open", "false");

		await user.click(screen.getByRole("button", { name: "Open" }));

		expect(screen.getByRole("button", { name: "Close" })).toHaveTextContent("Close");
		expect(screen.getByRole("button", { name: "Close" })).toHaveAttribute("data-open", "true");
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
			"<DropdownItem> must be used within a <DropdownContent> or <DropdownSubContent> provider",
		);

		consoleError.mockRestore();
	});

});
