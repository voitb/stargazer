import { cn } from "@/lib/utils/cn";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentPropsWithoutRef, Ref } from "react";

/**
 * Native HTML Select with appearance: base-select support (Chrome 134+)
 * Falls back gracefully in older browsers with custom chevron styling
 */

const selectVariants = cva(
	[
		"native-select",
		"flex h-10 w-full items-center rounded-md border px-3 py-2 text-sm",
		"bg-[rgb(var(--ui-bg))] text-[rgb(var(--ui-fg))]",
		"border-[rgb(var(--ui-border))]",
		"focus:outline-none focus:ring-2 focus:ring-[rgb(var(--ui-border-focus))] focus:ring-offset-2",
		"disabled:cursor-not-allowed disabled:opacity-50",
		"transition-colors",
	],
	{
		variants: {
			variant: {
				default: "",
				error: "border-[rgb(var(--ui-danger))] focus:ring-[rgb(var(--ui-danger))]",
			},
			size: {
				sm: "h-8 px-2 text-xs",
				md: "h-10 px-3",
				lg: "h-12 px-4 text-base",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "md",
		},
	}
);

interface SelectProps
	extends Omit<ComponentPropsWithoutRef<"select">, "onChange" | "size">,
		VariantProps<typeof selectVariants> {
	ref?: Ref<HTMLSelectElement>;
	onValueChange?: (value: string) => void;
	placeholder?: string;
}

function Select({
	className,
	variant,
	size,
	value,
	onValueChange,
	placeholder,
	children,
	ref,
	...props
}: SelectProps) {
	return (
		<select
			ref={ref}
			value={value}
			onChange={(e) => onValueChange?.(e.target.value)}
			className={cn(selectVariants({ variant, size }), className)}
			{...props}
		>
			{placeholder && (
				<option value="" disabled>
					{placeholder}
				</option>
			)}
			{children}
		</select>
	);
}

interface SelectItemProps extends ComponentPropsWithoutRef<"option"> {
	ref?: Ref<HTMLOptionElement>;
}

function SelectItem({ className, children, ref, ...props }: SelectItemProps) {
	return (
		<option ref={ref} className={cn("py-1.5", className)} {...props}>
			{children}
		</option>
	);
}

export { Select, SelectItem, selectVariants };
