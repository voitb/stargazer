import { cva } from "class-variance-authority";

export const taskCardVariants = cva(
  [
    "relative p-4 rounded-xl group",
    "bg-[rgb(var(--color-neutral-background-1))/0.95] backdrop-blur-sm",
    "border border-[rgb(var(--color-neutral-stroke-1))/0.5]",
    "shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]",
    "hover:bg-[rgb(var(--color-neutral-background-1))]",
    "hover:border-[rgb(var(--color-neutral-stroke-1))/0.8]",
    "hover:shadow-md hover:shadow-[rgb(0_0_0/0.08)]",
    "hover:-translate-y-0.5",
    "transition-all duration-200 ease-out",
  ],
  {
    variants: {
      isDragging: {
        true: "opacity-50 shadow-lg ring-2 ring-[rgb(var(--color-brand-background))/0.3]",
        false: "",
      },
      isDragOverlay: {
        true: [
          "shadow-2xl shadow-[rgb(var(--color-brand-background))/0.15]",
          "rotate-2 scale-105",
          "ring-1 ring-[rgb(var(--color-brand-background))/0.2]",
          "cursor-grabbing",
        ],
        false: "cursor-grab active:cursor-grabbing",
      },
    },
    defaultVariants: {
      isDragging: false,
      isDragOverlay: false,
    },
  }
);

export const taskCardHeaderVariants = cva(
  "flex items-start justify-between mb-3 gap-2 p-0"
);

export const taskCardContentVariants = cva("mb-3 p-0");

export const taskCardFooterVariants = cva(
  "flex items-center justify-between pt-3 p-0 border-t border-[rgb(var(--color-neutral-stroke-1))]/20"
);
