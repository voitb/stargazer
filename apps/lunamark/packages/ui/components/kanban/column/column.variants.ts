import { cva } from "class-variance-authority";

export const columnVariants = cva(
  [
    "flex flex-col rounded-xl",
    "transition-all duration-200 ease-out",
    "backdrop-blur-sm",
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
      collapsed: {
        true: "h-auto",
        false: "h-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      collapsed: false,
    },
  }
);

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

export const columnContentVariants = cva(
  [
    "flex-1 p-3 space-y-3",
    "overflow-y-auto overflow-x-hidden",
    "scrollbar-thin",
    "transition-all duration-200 ease-out",
  ].join(" "),
  {
    variants: {
      state: {
        expanded: "min-h-37.5 opacity-100",
        collapsed: "h-0 min-h-0 opacity-0 overflow-hidden p-0",
      },
    },
    defaultVariants: {
      state: "expanded",
    },
  }
);

export const columnFooterVariants = cva(
  [
    "p-3 pt-2",
    "transition-all duration-200 ease-out",
  ].join(" "),
  {
    variants: {
      state: {
        expanded: "opacity-100",
        collapsed: "h-0 opacity-0 overflow-hidden p-0",
      },
    },
    defaultVariants: {
      state: "expanded",
    },
  }
);
