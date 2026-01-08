import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { inputVariants } from "./input.variants";

type InputProps = Omit<ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>;

function Input({ className, variant, size, ref, ...props }: InputProps) {
  return (
    <input
      data-input
      ref={ref}
      className={cn(inputVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Input };
export type { InputProps };
