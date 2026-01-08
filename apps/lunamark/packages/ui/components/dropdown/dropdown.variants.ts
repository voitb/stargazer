import { cva } from "class-variance-authority";

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
