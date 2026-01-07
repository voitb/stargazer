import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../utils/cn";
import { Button } from "../button";
import { filterBarVariants } from "./filter-bar.variants";

type FilterBarProps = ComponentProps<"div"> &
	VariantProps<typeof filterBarVariants> & {
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
	size,
	variant,
	ref,
	"aria-label": ariaLabel,
	...props
}: FilterBarProps) {
	return (
		<div
			ref={ref}
			role="toolbar"
			aria-label={ariaLabel}
			className={cn(filterBarVariants({ size, variant }), className)}
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
