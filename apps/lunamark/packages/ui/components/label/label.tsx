import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";
import { labelVariants } from "./label.variants";

type LabelProps = ComponentProps<"label"> &
	VariantProps<typeof labelVariants> & {
		required?: boolean;
	};

function Label({
	className,
	children,
	required,
	variant,
	size,
	ref,
	...props
}: LabelProps) {
	return (
		<label
			ref={ref}
			className={cn(labelVariants({ variant, size }), className)}
			{...props}
		>
			{children}
			{required && (
				<span className="ml-1 text-[rgb(var(--color-status-danger))]" aria-hidden="true">
					*
				</span>
			)}
		</label>
	);
}

export { Label };
export type { LabelProps };
