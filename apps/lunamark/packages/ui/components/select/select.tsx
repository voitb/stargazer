"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { selectVariants } from "./select.variants";

interface SelectProps
  extends Omit<ComponentProps<"select">, "onChange" | "size">,
    VariantProps<typeof selectVariants> {
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

function Select({
  className,
  variant,
  size,
  value,
  onValueChange,
  placeholder,
  children,
  ref,
  ...props
}: SelectProps) {
  return (
    <select
      ref={ref}
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      aria-invalid={variant === "error" || undefined}
      className={cn(selectVariants({ variant, size }), className)}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {children}
    </select>
  );
}

interface SelectGroupProps extends ComponentProps<"optgroup"> {}

function SelectGroup({ children, ref, ...props }: SelectGroupProps) {
  return (
    <optgroup ref={ref} {...props}>
      {children}
    </optgroup>
  );
}

export { Select, SelectGroup };
export type { SelectProps, SelectGroupProps };
