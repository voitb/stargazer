import { cva } from "class-variance-authority";

export const cardVariants = cva(
	"rounded-lg border text-[rgb(var(--color-neutral-foreground-1))]",
	{
		variants: {
			variant: {
				default:
					"bg-[rgb(var(--color-neutral-background-1))] border-[rgb(var(--color-neutral-stroke-1))] shadow-sm",
				elevated:
					"bg-[rgb(var(--color-neutral-background-1))] border-[rgb(var(--color-neutral-stroke-1))] shadow-md",
				outlined:
					"bg-transparent border-[rgb(var(--color-neutral-stroke-1))]",
				ghost: "bg-transparent border-transparent shadow-none",
			},
			size: {
				sm: "p-4",
				md: "p-6",
				lg: "p-8",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);
