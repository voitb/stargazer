import { cva } from "class-variance-authority";

export const toggleButtonVariants = cva(
  [
    "inline-flex items-center justify-center rounded-md transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default: [
          "bg-[rgb(var(--color-neutral-background-2))] text-[rgb(var(--color-neutral-foreground-1))]",
          "hover:bg-[rgb(var(--color-neutral-background-3))]",
        ],
        ghost: [
          "bg-transparent text-[rgb(var(--color-neutral-foreground-2))]",
          "hover:bg-[rgb(var(--color-neutral-background-2))] hover:text-[rgb(var(--color-neutral-foreground-1))]",
        ],
        outline: [
          "border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent",
          "text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-2))]",
        ],
      },
      size: {
        sm: "h-7 px-2 text-xs gap-1",
        md: "h-9 px-3 text-sm gap-1.5",
        lg: "h-11 px-4 text-base gap-2",
      },
      pressed: {
        true: "ring-2 ring-[rgb(var(--color-brand-background))] ring-offset-1 ring-offset-[rgb(var(--color-neutral-background-1))]",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      pressed: false,
    },
  }
);
