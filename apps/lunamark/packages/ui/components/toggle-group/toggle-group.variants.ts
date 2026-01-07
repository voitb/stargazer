import { cva } from "class-variance-authority";

export const toggleGroupVariants = cva(
  "inline-flex",
  {
    variants: {
      orientation: {
        horizontal: "flex-row",
        vertical: "flex-col",
      },
      variant: {
        ring: "gap-1",
        contained: [
          "gap-1 p-1 rounded-lg",
          "bg-[rgb(var(--color-neutral-background-3))/0.5]",
          "border border-[rgb(var(--color-neutral-stroke-1))/0.3]",
        ],
      },
    },
    defaultVariants: {
      orientation: "horizontal",
      variant: "ring",
    },
  }
);

export const toggleGroupItemVariants = cva(
  [
    "inline-flex items-center justify-center font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
    "disabled:opacity-50 disabled:pointer-events-none",
  ],
  {
    variants: {
      size: {
        sm: "h-7 px-2 text-xs gap-1 rounded",
        md: "h-9 px-3 text-sm gap-1.5 rounded-md",
        lg: "h-11 px-4 text-base gap-2 rounded-lg",
      },
      variant: {
        ring: [
          "bg-[rgb(var(--color-neutral-background-2))]",
          "text-[rgb(var(--color-neutral-foreground-1))]",
          "hover:bg-[rgb(var(--color-neutral-background-3))]",
        ],
        contained: [
          "text-[rgb(var(--color-neutral-foreground-2))]",
          "hover:text-[rgb(var(--color-neutral-foreground-1))]",
          "hover:bg-[rgb(var(--color-neutral-background-1))/0.5]",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      variant: "ring",
    },
  }
);

export const toggleGroupItemSelectedVariants = {
  ring: "ring-2 ring-[rgb(var(--color-brand-background))] ring-offset-1 ring-offset-[rgb(var(--color-neutral-background-1))]",
  contained: [
    "bg-[rgb(var(--color-neutral-background-1))]",
    "text-[rgb(var(--color-neutral-foreground-1))]",
    "shadow-sm border border-[rgb(var(--color-neutral-stroke-1))/0.5]",
  ].join(" "),
};
