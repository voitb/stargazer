import type { ComponentProps } from "react";
import { cn } from "../../utils/cn";

type LabelProps = ComponentProps<"label"> & {
	required?: boolean;
};

function Label({ className, children, required, ref, ...props }: LabelProps) {
	return (
		<label
			ref={ref}
			className={cn(
				"text-sm font-medium leading-none text-[rgb(var(--color-neutral-foreground-1))] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className
			)}
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
