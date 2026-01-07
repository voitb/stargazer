import { cva } from "class-variance-authority";

export const labelVariants = cva(
	"font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
	{
		variants: {
			variant: {
				default: "text-[rgb(var(--color-neutral-foreground-1))]",
				muted: "text-[rgb(var(--color-neutral-foreground-2))]",
			},
			size: {
				sm: "text-sm",
				md: "text-base",
				lg: "text-lg",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "sm",
		},
	}
);
