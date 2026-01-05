import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useControllableState } from "../../hooks/use-controllable-state";
import { cn } from "../../utils/cn";
import { toggleButtonVariants } from "./toggle-button.variants";

type ToggleButtonProps = ComponentProps<"button"> &
  VariantProps<typeof toggleButtonVariants> & {
    pressed?: boolean;
    defaultPressed?: boolean;
    onPressedChange?: (pressed: boolean) => void;
    children: ReactNode;
  };

function ToggleButton({
  className,
  variant,
  size,
  pressed: controlledPressed,
  defaultPressed = false,
  onPressedChange,
  children,
  ref,
  onClick,
  ...props
}: ToggleButtonProps) {
  const [pressed, setPressed] = useControllableState({
    value: controlledPressed,
    defaultValue: defaultPressed,
    onChange: onPressedChange,
  });

  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={pressed}
      data-state={pressed ? "on" : "off"}
      onClick={(e) => {
        setPressed(!pressed);
        onClick?.(e);
      }}
      className={cn(toggleButtonVariants({ variant, size, pressed }), className)}
      {...props}
    >
      {children}
    </button>
  );
}

export { ToggleButton };
export type { ToggleButtonProps };
