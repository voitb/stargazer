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

  it("shows spinner and disables when loading", () => {
    render(<Button isLoading>Loading</Button>);

    const button = screen.getByRole("button");
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(document.querySelector("svg")).toBeInTheDocument();
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

  it("provides className, disabled, and isLoading to render function", () => {
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
            <a href="/dashboard" className={className}>
              Dashboard
            </a>
          );
        }}
      </Button>,
    );

    expect(receivedProps.className).toBeDefined();
    expect(receivedProps.disabled).toBe(true);
    expect(receivedProps.isLoading).toBe(true);
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
