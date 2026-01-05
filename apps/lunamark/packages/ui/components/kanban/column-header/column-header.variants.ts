import { cva } from "class-variance-authority";

export const columnHeaderVariants = cva("flex items-center gap-2.5", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export const countBadgeVariants = cva(
  [
    "font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center",
    "bg-[rgb(var(--color-neutral-background-3))/0.6]",
    "text-[rgb(var(--color-neutral-foreground-2))]",
    "border border-[rgb(var(--color-neutral-stroke-1))/0.2]",
  ],
  {
    variants: {
      size: {
        sm: "text-[9px]",
        md: "text-[10px]",
        lg: "text-xs",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);
