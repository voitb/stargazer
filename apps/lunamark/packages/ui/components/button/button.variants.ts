import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-[rgb(var(--color-brand-background))] text-[rgb(var(--color-brand-foreground-on-brand))] hover:bg-[rgb(var(--color-brand-background-hover))] focus-visible:ring-[rgb(var(--color-brand-background))]",
        secondary:
          "bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-3-hover))]",
        outline:
          "border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-2))]",
        ghost:
          "text-[rgb(var(--color-neutral-foreground-1))] hover:bg-[rgb(var(--color-neutral-background-2))]",
        danger:
          "bg-[rgb(var(--color-status-danger))] text-[rgb(var(--color-neutral-foreground-inverted))] hover:opacity-90 focus-visible:ring-[rgb(var(--color-status-danger))]",
        link: "text-[rgb(var(--color-brand-foreground-1))] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);
