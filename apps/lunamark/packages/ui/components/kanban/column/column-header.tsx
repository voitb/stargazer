"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../utils/cn";
import { useColumnContext } from "./column.context";
import { columnHeaderVariants, countBadgeVariants } from "./column.variants";

export type ColumnHeaderProps = Omit<ComponentProps<"div">, "children"> &
	VariantProps<typeof columnHeaderVariants> & {
		title: string;
		count?: number;
		dotColor?: string;
		showCollapseButton?: boolean;
		children?: ReactNode;
	};

export function ColumnHeader({
	className,
	size: sizeProp,
	title,
	count,
	dotColor,
	showCollapseButton = true,
	children,
	ref,
	...props
}: ColumnHeaderProps) {
	const {
		size: contextSize,
		itemCount,
		isCollapsed,
		toggleCollapsed,
		dataState,
		contentId,
	} = useColumnContext("ColumnHeader");

	const size = sizeProp ?? contextSize;
	const displayCount = count ?? itemCount;

	return (
		<div
			ref={ref}
			className={cn("p-4 pb-2", className)}
			data-slot="column-header"
			data-state={dataState}
			{...props}
		>
			<div className={cn(columnHeaderVariants({ size }))}>
				{dotColor && (
					<div className="relative" data-slot="column-dot" aria-hidden="true">
						<div
							className={cn(
								"w-2.5 h-2.5 rounded-full ring-2 ring-[rgb(var(--color-neutral-background-1))] shadow-sm",
								dotColor
							)}
						/>
						<div
							className={cn(
								"absolute inset-0 rounded-full blur-sm opacity-50",
								dotColor
							)}
						/>
					</div>
				)}
				<h2 className="font-semibold text-[rgb(var(--color-neutral-foreground-1))] tracking-tight">
					{title}
				</h2>
				<span className={cn(countBadgeVariants({ size }))}>{displayCount}</span>

				{showCollapseButton && (
					<button
						type="button"
						onClick={toggleCollapsed}
						aria-expanded={!isCollapsed}
						aria-controls={contentId}
						className={cn(
							"ml-auto p-1 rounded-md",
							"text-[rgb(var(--color-neutral-foreground-2))]",
							"hover:bg-[rgb(var(--color-neutral-background-3))/0.5]",
							"hover:text-[rgb(var(--color-neutral-foreground-1))]",
							"transition-all duration-150",
							"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--color-neutral-stroke-focus))]"
						)}
					>
						<ChevronDown
							className={cn(
								"w-4 h-4 transition-transform duration-200",
								isCollapsed && "-rotate-90"
							)}
						/>
					</button>
				)}
			</div>
			{children}
		</div>
	);
}
