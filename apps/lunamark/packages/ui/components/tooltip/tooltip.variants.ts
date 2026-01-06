import { cva, type VariantProps } from "class-variance-authority";

export const tooltipContentVariants = cva(
	[
		"z-50 rounded-md px-3 py-1.5 text-xs shadow-md",
	],
	{
		variants: {
			variant: {
				default: [
					"bg-[rgb(var(--color-neutral-background-inverted))]",
					"text-[rgb(var(--color-neutral-foreground-inverted))]",
				],
			},
		},
		defaultVariants: {
			variant: "default",
		},
	}
);

export type TooltipContentVariants = VariantProps<typeof tooltipContentVariants>;
