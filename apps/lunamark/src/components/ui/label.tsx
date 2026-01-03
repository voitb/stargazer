import type { ComponentPropsWithoutRef, Ref } from "react";
import { cn } from "@/lib/utils/cn";

type LabelProps = ComponentPropsWithoutRef<"label"> & {
	ref?: Ref<HTMLLabelElement>;
	required?: boolean;
};

function Label({ className, children, required, ref, ...props }: LabelProps) {
	return (
		<label
			ref={ref}
			className={cn(
				"text-sm font-medium leading-none text-[rgb(var(--ui-fg))] peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
				className
			)}
			{...props}
		>
			{children}
			{required && (
				<span className="ml-1 text-[rgb(var(--ui-danger))]" aria-hidden="true">
					*
				</span>
			)}
		</label>
	);
}

export { Label };
