import { cva } from "class-variance-authority";

export const filterBarVariants = cva("flex items-center border-b", {
	variants: {
		size: {
			sm: "gap-4 px-4 py-2",
			md: "gap-6 px-6 py-3",
			lg: "gap-8 px-8 py-4",
		},
		variant: {
			default: "border-[rgb(var(--color-neutral-stroke-1)/0.5)]",
			elevated:
				"border-[rgb(var(--color-neutral-stroke-1)/0.5)] shadow-sm bg-[rgb(var(--color-neutral-background-1))]",
		},
	},
	defaultVariants: {
		size: "md",
		variant: "default",
	},
});
