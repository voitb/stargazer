import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@ui/utils";
import { buttonVariants } from "./button.variants";
import { Spinner } from "../icons";

type ButtonRenderProps = {
  className: string;
  disabled: boolean;
  isLoading: boolean;
} & Omit<ComponentProps<"button">, "className" | "disabled" | "children">;

type ButtonProps = Omit<ComponentProps<"button">, "children"> &
  VariantProps<typeof buttonVariants> & {
    isLoading?: boolean;
    children?: ReactNode | ((props: ButtonRenderProps) => ReactNode);
  };

function Button({
  className,
  variant,
  size,
  isLoading = false,
  disabled = false,
  children,
  ref,
  ...props
}: ButtonProps) {
  const computedClassName = cn(buttonVariants({ variant, size, className }));
  const computedDisabled = disabled || isLoading;

  if (typeof children === "function") {
    return children({
      className: computedClassName,
      disabled: computedDisabled,
      isLoading,
      ref,
      ...props,
    });
  }

  return (
    <button
      ref={ref}
      type="button"
      className={computedClassName}
      disabled={computedDisabled}
      aria-busy={isLoading || undefined}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps, ButtonRenderProps };
