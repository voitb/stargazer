import { cva } from "class-variance-authority";

export const chipVariants = cva(
	[
		"inline-flex items-center rounded-full font-medium transition-all",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
		"focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]",
	],
	{
		variants: {
			variant: {
				selected: [
					"bg-[rgb(var(--color-brand-background)/0.15)] text-[rgb(var(--color-brand-foreground-1))]",
					"border border-[rgb(var(--color-brand-background)/0.3)]",
					"cursor-pointer",
				],
				unselected: [
					"border border-[rgb(var(--color-neutral-stroke-1))] bg-transparent",
					"text-[rgb(var(--color-neutral-foreground-2))]",
					"hover:bg-[rgb(var(--color-neutral-background-2))] hover:text-[rgb(var(--color-neutral-foreground-1))]",
					"cursor-pointer",
				],
			},
			size: {
				sm: "px-2 py-0.5 text-[10px] gap-1",
				md: "px-2.5 py-1 text-xs gap-1.5",
			},
		},
		defaultVariants: { variant: "unselected", size: "sm" },
	},
);

