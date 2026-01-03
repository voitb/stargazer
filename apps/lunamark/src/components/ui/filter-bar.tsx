import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

type FilterBarProps = ComponentPropsWithoutRef<"div"> & {
	ref?: Ref<HTMLDivElement>;
	children: ReactNode;
	hasActiveFilters?: boolean;
	onClear?: () => void;
};

function FilterBar({
	children,
	hasActiveFilters = false,
	onClear,
	className,
	ref,
	...props
}: FilterBarProps) {
	return (
		<div
			ref={ref}
			className={cn(
				"flex items-center gap-6 px-6 py-3",
				"bg-[rgb(var(--ui-bg))] border-b border-[rgb(var(--ui-border))]",
				className,
			)}
			{...props}
		>
			{children}
			{hasActiveFilters && onClear && (
				<Button
					variant="ghost"
					size="sm"
					onClick={onClear}
					className="ml-auto text-[rgb(var(--ui-fg-muted))]"
				>
					Clear filters
				</Button>
			)}
		</div>
	);
}

export { FilterBar };
