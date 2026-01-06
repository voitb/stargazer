import { cva } from "class-variance-authority";

export const checkboxVariants = cva(
  [
    "peer shrink-0 rounded border",
    "border-[rgb(var(--color-neutral-stroke-1))]",
    "accent-[rgb(var(--color-brand-background))]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "transition-colors",
    "data-[state=checked]:bg-[rgb(var(--color-brand-background))]",
    "data-[state=checked]:border-[rgb(var(--color-brand-background))]",
    "data-[state=indeterminate]:bg-[rgb(var(--color-brand-background))]",
    "data-[state=indeterminate]:border-[rgb(var(--color-brand-background))]",
  ],
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
