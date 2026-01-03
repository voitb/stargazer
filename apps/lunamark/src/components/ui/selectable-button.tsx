import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils/cn";

const selectableButtonVariants = cva(
	[
		"inline-flex items-center justify-center rounded-md transition-all",
		"focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
		"focus-visible:ring-[rgb(var(--ui-border-focus))]",
		"disabled:opacity-50 disabled:pointer-events-none",
	],
	{
		variants: {
			variant: {
				default: [
					"bg-[rgb(var(--ui-bg-secondary))] text-[rgb(var(--ui-fg))]",
					"hover:bg-[rgb(var(--ui-bg-tertiary))]",
				],
				ghost: [
					"bg-transparent text-[rgb(var(--ui-fg-muted))]",
					"hover:bg-[rgb(var(--ui-bg-secondary))] hover:text-[rgb(var(--ui-fg))]",
				],
				outline: [
					"border border-[rgb(var(--ui-border))] bg-transparent",
					"text-[rgb(var(--ui-fg))] hover:bg-[rgb(var(--ui-bg-secondary))]",
				],
			},
			size: {
				sm: "h-7 px-2 text-xs gap-1",
				md: "h-9 px-3 text-sm gap-1.5",
				lg: "h-11 px-4 text-base gap-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	},
);

type SelectableButtonProps = Omit<
	ComponentPropsWithoutRef<"button">,
	"value"
> &
	VariantProps<typeof selectableButtonVariants> & {
		ref?: Ref<HTMLButtonElement>;
		value?: string;
		isSelected?: boolean;
		children: ReactNode;
	};

function SelectableButton({
	className,
	variant,
	size,
	isSelected = false,
	children,
	ref,
	...props
}: SelectableButtonProps) {
	return (
		<button
			ref={ref}
			type="button"
			aria-pressed={isSelected}
			data-state={isSelected ? "on" : "off"}
			className={cn(
				selectableButtonVariants({ variant, size }),
				isSelected &&
					"ring-2 ring-[rgb(var(--ui-primary))] ring-offset-1 ring-offset-[rgb(var(--ui-bg))]",
				className,
			)}
			{...props}
		>
			{children}
		</button>
	);
}

export { SelectableButton, selectableButtonVariants };
