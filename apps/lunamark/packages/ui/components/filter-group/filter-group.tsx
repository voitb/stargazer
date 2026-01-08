"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { useId } from "react";
import { cn } from "@ui/utils";
import { filterGroupVariants } from "./filter-group.variants";

type FilterGroupProps = ComponentProps<"div"> &
	VariantProps<typeof filterGroupVariants> & {
		label: string;
		visible?: boolean;
		children: ReactNode;
	};

function FilterGroup({
	label,
	visible = true,
	children,
	className,
	size,
	variant,
	ref,
	...props
}: FilterGroupProps) {
	const labelId = useId();

	if (!visible) return null;

	return (
		<div
			data-filter-group
			ref={ref}
			role="group"
			aria-labelledby={labelId}
			className={cn(filterGroupVariants({ size, variant }), className)}
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
