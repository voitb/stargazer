import { cva } from "class-variance-authority";

export const toggleVariants = cva(
  [
    "inline-flex items-center justify-center rounded-md transition-all",
    "text-[rgb(var(--color-neutral-foreground-1))]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-transparent hover:bg-[rgb(var(--color-neutral-background-2))] data-[state=on]:bg-[rgb(var(--color-neutral-background-3))]",
        outline:
          "border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent hover:bg-[rgb(var(--color-neutral-background-2))] data-[state=on]:bg-[rgb(var(--color-neutral-background-3))]",
      },
      size: {
        sm: "h-8 px-2 text-xs",
        md: "h-10 px-3 text-sm",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
