import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils/cn";

const textareaVariants = cva(
	"flex min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm transition-colors placeholder:text-[rgb(var(--ui-fg-muted))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
	{
		variants: {
			variant: {
				default:
					"border-[rgb(var(--ui-border))] text-[rgb(var(--ui-fg))] focus-visible:ring-[rgb(var(--ui-primary))]",
				error:
					"border-[rgb(var(--ui-danger))] text-[rgb(var(--ui-fg))] focus-visible:ring-[rgb(var(--ui-danger))]",
			},
			size: {
				sm: "min-h-[60px] text-xs",
				md: "min-h-[80px]",
				lg: "min-h-[120px] text-base",
			},
		},
		defaultVariants: { variant: "default", size: "md" },
	}
);

type TextareaProps = ComponentPropsWithoutRef<"textarea"> &
	VariantProps<typeof textareaVariants> & {
		ref?: Ref<HTMLTextAreaElement>;
	};

function Textarea({ className, variant, size, ref, ...props }: TextareaProps) {
	return (
		<textarea
			ref={ref}
			className={cn(textareaVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Textarea, textareaVariants };
