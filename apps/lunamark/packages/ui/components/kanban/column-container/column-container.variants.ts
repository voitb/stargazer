import { cva } from "class-variance-authority";

export const columnContainerVariants = cva(
  [
    "flex flex-col rounded-xl h-full",
    "transition-all duration-200 ease-out",
    // Glass effect base
    "backdrop-blur-sm",
    // Border styling
    "border border-[rgb(var(--color-neutral-stroke-1))/0.3]",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "bg-[rgb(var(--color-neutral-background-2))/0.5]",
          "hover:bg-[rgb(var(--color-neutral-background-2))/0.7]",
          "hover:border-[rgb(var(--color-neutral-stroke-1))/0.5]",
        ].join(" "),
        active: [
          "bg-[rgb(var(--color-brand-background))/0.05]",
          "border-[rgb(var(--color-brand-background))/0.3]",
          "ring-2 ring-[rgb(var(--color-brand-background))/0.15]",
          "shadow-lg shadow-[rgb(var(--color-brand-background))/0.1]",
        ].join(" "),
      },
      size: {
        sm: "w-64 min-w-64",
        md: "w-80 min-w-80",
        lg: "w-96 min-w-96",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);
