import { cva } from "class-variance-authority";

export const emptyStateVariants = cva(
  "flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-colors duration-200",
  {
    variants: {
      variant: {
        default:
          "border-[rgb(var(--color-neutral-stroke-1))/0.6] bg-[rgb(var(--color-neutral-background-2))/0.3] text-[rgb(var(--color-neutral-foreground-2))]",
        active:
          "border-[rgb(var(--color-brand-stroke-2))] bg-[rgb(var(--color-brand-background-selected)/0.5)] text-[rgb(var(--color-brand-foreground-1))]",
      },
      size: {
        sm: "h-20 m-1",
        md: "h-32 m-1",
        lg: "h-48 m-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
