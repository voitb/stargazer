import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button";

type FilterBarProps = ComponentProps<"div"> & {
	children: ReactNode;
	hasActiveFilters?: boolean;
	onClear?: () => void;
	"aria-label"?: string;
};

function FilterBar({
	children,
	hasActiveFilters = false,
	onClear,
	className,
	ref,
	"aria-label": ariaLabel,
	...props
}: FilterBarProps) {
	return (
		<div
			ref={ref}
			role="toolbar"
			aria-label={ariaLabel}
			className={cn(
				"flex items-center gap-6 px-6 py-3",
				"border-b border-[rgb(var(--color-neutral-stroke-1)/0.5)]",
				className,
			)}
			data-filter-bar
			{...props}
		>
			{children}
			{hasActiveFilters && onClear && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="ml-auto text-[rgb(var(--color-neutral-foreground-2))] hover:text-[rgb(var(--color-brand-foreground-1))]"
				>
					Clear filters
				</Button>
			)}
		</div>
	);
}

export { FilterBar };
export type { FilterBarProps };
