import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-1))]",
        secondary:
          "bg-[rgb(var(--color-neutral-background-2))] text-[rgb(var(--color-neutral-foreground-2))]",
        success:
          "bg-[rgb(var(--color-status-success)/0.15)] text-[rgb(var(--color-status-success))]",
        warning:
          "bg-[rgb(var(--color-status-warning)/0.15)] text-[rgb(var(--color-status-warning))]",
        danger:
          "bg-[rgb(var(--color-status-danger)/0.15)] text-[rgb(var(--color-status-danger))]",
        outline:
          "border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent text-[rgb(var(--color-neutral-foreground-1))]",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-sm",
        lg: "px-3 py-1 text-base",
        icon: "h-5 w-5 justify-center p-0",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);
