import { cva } from "class-variance-authority";

export const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))] font-medium",
  {
    variants: {
      size: {
        sm: "w-6 h-6 text-[10px]",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm",
      },
    },
    defaultVariants: { size: "md" },
  }
);
