import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { textareaVariants } from "./textarea.variants";

type TextareaProps = ComponentProps<"textarea"> &
  VariantProps<typeof textareaVariants>;

function Textarea({ className, variant, size, ref, ...props }: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(textareaVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Textarea };
export type { TextareaProps };
