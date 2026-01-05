import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { buttonVariants } from "./button.variants";

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
      {isLoading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

export { Button };
export type { ButtonProps, ButtonRenderProps };
