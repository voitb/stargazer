import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders with default props", () => {
		render(<Button>Click me</Button>);

		const button = screen.getByRole("button", { name: "Click me" });
		expect(button).toBeInTheDocument();
		expect(button).toHaveAttribute("type", "button");
	});

	it("shows spinner and disables when isLoading=true", () => {
		render(<Button isLoading>Loading</Button>);

		const button = screen.getByRole("button");
		expect(button).toBeDisabled();
		expect(button).toHaveAttribute("aria-busy", "true");
		expect(document.querySelector("svg")).toBeInTheDocument();
	});

	it("is disabled when disabled=true or isLoading=true", () => {
		const { rerender } = render(<Button disabled>Disabled</Button>);
		expect(screen.getByRole("button")).toBeDisabled();

		rerender(<Button isLoading>Loading</Button>);
		expect(screen.getByRole("button")).toBeDisabled();
	});

	it("calls onClick when clicked", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Click</Button>);
		await user.click(screen.getByRole("button"));

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("blocks onClick when disabled or loading", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		const { rerender } = render(
			<Button disabled onClick={onClick}>
				Disabled
			</Button>,
		);
		await user.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();

		rerender(
			<Button isLoading onClick={onClick}>
				Loading
			</Button>,
		);
		await user.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("is keyboard accessible with Enter", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn();

		render(<Button onClick={onClick}>Keyboard</Button>);

		const button = screen.getByRole("button");
		button.focus();
		await user.keyboard("{Enter}");

		expect(onClick).toHaveBeenCalledTimes(1);
	});

	it("accepts all variant and size props without error", () => {
		const variants = [
			"primary",
			"secondary",
			"outline",
			"ghost",
			"danger",
			"link",
		] as const;
		const sizes = ["sm", "md", "lg", "icon"] as const;

		variants.forEach((variant) => {
			sizes.forEach((size) => {
				const { unmount } = render(
					<Button variant={variant} size={size}>
						Test
					</Button>,
				);
				expect(screen.getByRole("button")).toBeInTheDocument();
				unmount();
			});
		});
	});

	it("forwards ref", () => {
		const ref = createRef<HTMLButtonElement>();
		render(<Button ref={ref}>Test</Button>);
		expect(ref.current).toBeInstanceOf(HTMLButtonElement);
	});

	it("provides className, disabled, isLoading, and ref to render function", () => {
		let receivedProps: {
			className?: string;
			disabled?: boolean;
			isLoading?: boolean;
		} = {};

		render(
			<Button variant="primary" isLoading>
				{({ className, disabled, isLoading }) => {
					receivedProps = { className, disabled, isLoading };
					return (
						<a href="/test" className={className}>
							Link
						</a>
					);
				}}
			</Button>,
		);

		expect(receivedProps.className).toBeDefined();
		expect(receivedProps.disabled).toBe(true);
		expect(receivedProps.isLoading).toBe(true);

		const link = screen.getByRole("link");
		expect(link).toHaveAttribute("href", "/test");
	});

	it("renders as different element via render props", () => {
		render(
			<Button variant="primary">
				{({ className }) => (
					<a href="/dashboard" className={className}>
						Go to Dashboard
					</a>
				)}
			</Button>,
		);

		const link = screen.getByRole("link", { name: "Go to Dashboard" });
		expect(link).toBeInTheDocument();
		expect(link).toHaveAttribute("href", "/dashboard");
	});
});
