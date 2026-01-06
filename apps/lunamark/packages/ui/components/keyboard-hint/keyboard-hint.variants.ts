import { cva } from "class-variance-authority";

export const keyboardHintVariants = cva(
	"inline-flex items-center justify-center font-medium rounded border",
	{
		variants: {
			variant: {
				default:
					"bg-[rgb(var(--color-neutral-background-3))] text-[rgb(var(--color-neutral-foreground-2))] border-[rgb(var(--color-neutral-stroke-1))]",
				inverted:
					"bg-[rgb(var(--color-neutral-foreground-inverted)/0.15)] text-[rgb(var(--color-neutral-foreground-inverted)/0.8)] border-[rgb(var(--color-neutral-foreground-inverted)/0.2)]",
			},
			size: {
				sm: "px-1 py-0.5 text-[9px]",
				md: "px-1.5 py-0.5 text-[10px]",
				lg: "px-2 py-1 text-xs",
			},
		},
		defaultVariants: { variant: "default", size: "md" },
	}
);
