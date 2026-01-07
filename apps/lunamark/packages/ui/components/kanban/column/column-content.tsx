"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn";
import { useColumnContext } from "./column.context";
import { columnContentVariants } from "./column.variants";

export type ColumnContentProps = ComponentProps<"div"> &
	Omit<VariantProps<typeof columnContentVariants>, "state">;

export function ColumnContent({
	className,
	children,
	ref,
	...props
}: ColumnContentProps) {
	const { isCollapsed, contentId } = useColumnContext("ColumnContent");

	const state = isCollapsed ? "collapsed" : "expanded";

	return (
		<div
			ref={ref}
			id={contentId}
			aria-hidden={isCollapsed}
			data-slot="column-content"
			data-state={state}
			className={cn(columnContentVariants({ state }), className)}
			{...props}
		>
			{children}
		</div>
	);
}
