import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Avatar, AvatarGroup, SelectableAvatar } from "./avatar";

describe("Avatar", () => {
	it("renders image when src is provided", () => {
		render(<Avatar src="https://example.com/avatar.jpg" alt="Test User" />);

		const img = screen.getByRole("img");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
		expect(img).toHaveAttribute("alt", "Test User");
	});

	it("shows fallback when image fails to load", () => {
		render(<Avatar src="https://invalid.com/broken.jpg" alt="Test User" />);

		const img = screen.getByRole("img");
		fireEvent.error(img);

		expect(screen.getByText("T")).toBeInTheDocument();
		expect(screen.queryByRole("img")).not.toBeInTheDocument();
	});

	it("uses fallback hierarchy: custom > alt initial > '?'", () => {
		const { rerender } = render(<Avatar fallback="Custom" alt="Alice" />);
		expect(screen.getByText("Custom")).toBeInTheDocument();

		rerender(<Avatar alt="alice" />);
		expect(screen.getByText("A")).toBeInTheDocument();

		rerender(<Avatar />);
		expect(screen.getByText("?")).toBeInTheDocument();
	});

	it("resets error state when src changes", () => {
		const { rerender } = render(
			<Avatar src="https://invalid.com/broken.jpg" alt="Test" />,
		);

		fireEvent.error(screen.getByRole("img"));
		expect(screen.getByText("T")).toBeInTheDocument();

		rerender(<Avatar src="https://example.com/valid.jpg" alt="Test" />);
		expect(screen.getByRole("img")).toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLSpanElement>();
		render(<Avatar alt="Test" ref={ref} />);
		expect(ref.current).toBeInstanceOf(HTMLSpanElement);
	});

	it("accepts all size props without error", () => {
		const sizes = ["sm", "md", "lg"] as const;
		sizes.forEach((size) => {
			const { unmount } = render(<Avatar alt="Test" size={size} />);
			expect(screen.getByText("T")).toBeInTheDocument();
			unmount();
		});
	});
});

describe("AvatarGroup", () => {
	it("limits visible avatars and shows overflow count", () => {
		render(
			<AvatarGroup max={2}>
				<Avatar alt="Alice" />
				<Avatar alt="Bob" />
				<Avatar alt="Charlie" />
				<Avatar alt="Diana" />
			</AvatarGroup>,
		);

		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.queryByText("C")).not.toBeInTheDocument();
		expect(screen.getByText("+2")).toBeInTheDocument();
	});

	it("renders all avatars when count is less than max", () => {
		render(
			<AvatarGroup max={4}>
				<Avatar alt="Alice" />
				<Avatar alt="Bob" />
			</AvatarGroup>,
		);

		expect(screen.getByText("A")).toBeInTheDocument();
		expect(screen.getByText("B")).toBeInTheDocument();
		expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLDivElement>();
		render(
			<AvatarGroup ref={ref}>
				<Avatar alt="Alice" />
			</AvatarGroup>,
		);
		expect(ref.current).toBeInstanceOf(HTMLDivElement);
	});
});

describe("SelectableAvatar", () => {
	it("has correct aria-pressed and data-state based on isSelected", () => {
		const { rerender } = render(
			<SelectableAvatar alt="Test" isSelected={false} />,
		);

		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("aria-pressed", "false");
		expect(button).toHaveAttribute("data-state", "off");

		rerender(<SelectableAvatar alt="Test" isSelected={true} />);
		expect(button).toHaveAttribute("aria-pressed", "true");
		expect(button).toHaveAttribute("data-state", "on");
	});

	it("triggers onClick when clicked", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<SelectableAvatar alt="Test" onClick={onClick} />);

		await user.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("forwards ref and has type='button'", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<SelectableAvatar alt="Test" ref={ref} />);

		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
		expect(ref.current).toHaveAttribute("type", "button");
	});
});
