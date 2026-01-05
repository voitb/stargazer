import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "../../utils/cn";

type FilterGroupProps = ComponentProps<"div"> & {
	label: string;
	visible?: boolean;
	children: ReactNode;
};

function FilterGroup({
	label,
	visible = true,
	children,
	className,
	ref,
	...props
}: FilterGroupProps) {
	const labelId = useId();

	if (!visible) return null;

	return (
		<div
			ref={ref}
			role="group"
			aria-labelledby={labelId}
			className={cn("flex items-center gap-3", className)}
			{...props}
		>
			<span
				id={labelId}
				className="text-xs font-medium text-[rgb(var(--color-neutral-foreground-2))] uppercase tracking-wide"
			>
				{label}
			</span>
			<div className="flex items-center gap-1">{children}</div>
		</div>
	);
}

export { FilterGroup };
export type { FilterGroupProps };
