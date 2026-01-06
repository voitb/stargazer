import { cva } from "class-variance-authority";

export const selectVariants = cva(
  [
    "ui-select",
    "flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm",
    "bg-[rgb(var(--color-neutral-background-1))] text-[rgb(var(--color-neutral-foreground-1))]",
    "border-[rgb(var(--color-neutral-stroke-1))]",
    "hover:border-[rgb(var(--color-neutral-stroke-1-hover))]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-neutral-background-1))]",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-[rgb(var(--color-neutral-stroke-1))]",
    "transition-[color,background-color,border-color]",
  ],
  {
    variants: {
      variant: {
        default: "",
        error:
          "border-[rgb(var(--color-status-danger))] focus-visible:ring-[rgb(var(--color-status-danger))]",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
