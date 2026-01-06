import { cva } from "class-variance-authority";

/**
 * Dropdown content panel variants
 */
export const dropdownContentVariants = cva(
	[
		"z-50 min-w-[8rem] overflow-hidden rounded-md border p-1 shadow-lg",
		"bg-[rgb(var(--color-neutral-background-1))]",
		"text-[rgb(var(--color-neutral-foreground-1))]",
		"border-[rgb(var(--color-neutral-stroke-1))]",
	],
	{
		variants: {
			// Future: size variants if needed
		},
		defaultVariants: {},
	}
);

/**
 * Dropdown menu item variants
 */
export const dropdownItemVariants = cva(
	[
		"relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
		"transition-colors",
	],
	{
		variants: {
			variant: {
				default: [
					"text-[rgb(var(--color-neutral-foreground-1))]",
					"focus:bg-[rgb(var(--color-neutral-background-3))]",
				],
				destructive: [
					"text-[rgb(var(--color-status-danger))]",
					"focus:bg-[rgb(var(--color-status-danger-background))]",
				],
			},
			highlighted: {
				true: "bg-[rgb(var(--color-neutral-background-3))]",
				false: "",
			},
			disabled: {
				true: "opacity-50 pointer-events-none",
				false: "",
			},
			inset: {
				true: "pl-8",
				false: "",
			},
		},
		defaultVariants: {
			variant: "default",
			highlighted: false,
			disabled: false,
			inset: false,
		},
	}
);

/**
 * Dropdown label variants
 */
export const dropdownLabelVariants = cva(
	"px-2 py-1.5 text-xs font-semibold text-[rgb(var(--color-neutral-foreground-2))]",
	{
		variants: {
			inset: {
				true: "pl-8",
				false: "",
			},
		},
		defaultVariants: {
			inset: false,
		},
	}
);

/**
 * Dropdown separator variants
 */
export const dropdownSeparatorVariants = cva(
	"-mx-1 my-1 h-px bg-[rgb(var(--color-neutral-stroke-1))]"
);

/**
 * Checkbox/Radio indicator container variants
 */
export const dropdownIndicatorVariants = cva(
	"absolute left-2 flex h-3.5 w-3.5 items-center justify-center"
);

/**
 * Submenu trigger chevron variants
 */
export const dropdownSubTriggerChevronVariants = cva(
	"ml-auto h-4 w-4 text-[rgb(var(--color-neutral-foreground-2))]"
);

/**
 * Shortcut display variants
 */
export const dropdownShortcutVariants = cva(
	"ml-auto text-xs tracking-widest text-[rgb(var(--color-neutral-foreground-2))]"
);
