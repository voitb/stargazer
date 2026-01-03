import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils/cn";

const inputVariants = cva(
	"flex w-full rounded-md border bg-transparent px-3 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[rgb(var(--ui-fg-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"border-[rgb(var(--ui-border))] text-[rgb(var(--ui-fg))] focus-visible:ring-[rgb(var(--ui-primary))]",
				error:
					"border-[rgb(var(--ui-danger))] text-[rgb(var(--ui-fg))] focus-visible:ring-[rgb(var(--ui-danger))]",
			},
			size: {
				sm: "h-8 text-xs",
				md: "h-10",
				lg: "h-12 text-base",
			},
		},
		defaultVariants: { variant: "default", size: "md" },
	}
);

type InputProps = ComponentPropsWithoutRef<"input"> &
	VariantProps<typeof inputVariants> & {
		ref?: Ref<HTMLInputElement>;
	};

function Input({ className, variant, size, ref, ...props }: InputProps) {
	return (
		<input
			ref={ref}
			className={cn(inputVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Input, inputVariants };
