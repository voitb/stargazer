import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "flex w-full rounded-md border bg-[rgb(var(--color-neutral-background-1))] px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--color-neutral-foreground-2))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--color-neutral-background-1))] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-[rgb(var(--color-status-danger))] aria-invalid:focus-visible:ring-[rgb(var(--color-status-danger))]",
  {
    variants: {
      variant: {
        default:
          "border-[rgb(var(--color-neutral-stroke-1))] text-[rgb(var(--color-neutral-foreground-1))] focus-visible:ring-[rgb(var(--color-brand-background))]",
        error:
          "border-[rgb(var(--color-status-danger))] text-[rgb(var(--color-neutral-foreground-1))] focus-visible:ring-[rgb(var(--color-status-danger))]",
      },
      size: {
        sm: "h-8 text-xs",
        md: "h-10",
        lg: "h-12 text-base",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
