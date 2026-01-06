import { cva } from "class-variance-authority";

/**
 * Popover content panel variants
 */
export const popoverContentVariants = cva([
	"z-50 w-72 rounded-lg border p-4 shadow-lg",
	"bg-[rgb(var(--color-neutral-background-1))]",
	"text-[rgb(var(--color-neutral-foreground-1))]",
	"border-[rgb(var(--color-neutral-stroke-1))]",
]);

/**
 * Popover close button variants
 */
export const popoverCloseVariants = cva([
	"absolute right-2 top-2 rounded-sm opacity-70 transition-opacity",
	"hover:opacity-100",
	"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
]);
