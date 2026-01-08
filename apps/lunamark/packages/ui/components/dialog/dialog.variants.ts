import { cva } from "class-variance-authority";

export const dialogContentVariants = cva(
	[
		"relative z-50 w-full gap-4 border p-6 shadow-lg",
		"bg-[rgb(var(--color-neutral-background-1))]",
		"text-[rgb(var(--color-neutral-foreground-1))]",
		"border-[rgb(var(--color-neutral-stroke-1))]",
		"rounded-lg",
	],
	{
		variants: {
			size: {
				sm: "max-w-sm",
				md: "max-w-lg",
				lg: "max-w-2xl",
				xl: "max-w-4xl",
				full: "max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]",
			},
		},
		defaultVariants: {
			size: "md",
		},
	}
);
