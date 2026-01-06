"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../utils/cn";
import { toggleVariants } from "./toggle.variants";

type ToggleRenderProps = {
  className: string;
  pressed: boolean;
  "data-state": "on" | "off";
} & Omit<ComponentProps<"button">, "className" | "children">;

type ToggleProps = Omit<ComponentProps<"button">, "children"> &
  VariantProps<typeof toggleVariants> & {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    children?: ReactNode | ((props: ToggleRenderProps) => ReactNode);
  };

function Toggle({
  className,
  variant,
  size,
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  children,
  ref,
  ...props
}: ToggleProps) {
  const [pressed, setPressed] = useControllableState({
    value: controlledPressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  const computedClassName = cn(toggleVariants({ variant, size, className }));

  if (typeof children === "function") {
    return children({
      className: computedClassName,
      pressed,
      ref,
      type: "button",
      "aria-pressed": pressed,
      "data-state": pressed ? "on" : "off",
      onClick: () => setPressed(!pressed),
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      onClick={() => setPressed(!pressed)}
      className={computedClassName}
      {...props}
    >
      {children}
    </button>
  );
}

export { Toggle };
export type { ToggleProps, ToggleRenderProps };
