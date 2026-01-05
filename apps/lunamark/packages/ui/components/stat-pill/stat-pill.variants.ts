import { cva } from "class-variance-authority";

export const statPillVariants = cva(
  [
    "flex items-center gap-2 rounded-full font-medium",
    "transition-all duration-200",
    "bg-[rgb(var(--color-neutral-background-1))/0.6] backdrop-blur-sm",
    "border border-[rgb(var(--color-neutral-stroke-1))/0.5]",
    "hover:bg-[rgb(var(--color-neutral-background-1))/0.8]",
    "hover:shadow-sm",
  ],
  {
    variants: {
      variant: {
        default: [
          "text-[rgb(var(--color-neutral-foreground-2))]",
          "hover:border-[rgb(var(--color-neutral-stroke-focus))/0.3]",
        ],
        success: [
          "text-[rgb(var(--color-status-success))]",
          "hover:border-[rgb(var(--color-status-success))/0.3]",
        ],
        warning: [
          "text-[rgb(var(--color-status-warning))]",
          "hover:border-[rgb(var(--color-status-warning))/0.3]",
        ],
        danger: [
          "text-[rgb(var(--color-status-danger))]",
          "hover:border-[rgb(var(--color-status-danger))/0.3]",
        ],
      },
      size: {
        sm: "px-2 py-1 text-[10px]",
        md: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
