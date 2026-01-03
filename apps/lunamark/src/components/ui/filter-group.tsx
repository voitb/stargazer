import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils/cn";

type FilterGroupProps = ComponentPropsWithoutRef<"div"> & {
	ref?: Ref<HTMLDivElement>;
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
	if (!visible) return null;

	return (
		<div
			ref={ref}
			className={cn("flex items-center gap-3", className)}
			{...props}
		>
			<span className="text-xs font-medium text-[rgb(var(--ui-fg-muted))] uppercase tracking-wide">
				{label}
			</span>
			<div className="flex items-center gap-1">{children}</div>
		</div>
	);
}

export { FilterGroup };
