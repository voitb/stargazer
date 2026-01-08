"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@ui/utils";
import { useColumnContext } from "./column.context";
import { columnFooterVariants } from "./column.variants";

export type ColumnFooterProps = ComponentProps<"div"> &
	Omit<VariantProps<typeof columnFooterVariants>, "state">;

export function ColumnFooter({
	className,
	children,
	ref,
	...props
}: ColumnFooterProps) {
	const { isCollapsed } = useColumnContext("ColumnFooter");

	const state = isCollapsed ? "collapsed" : "expanded";

	return (
		<div
			ref={ref}
			data-slot="column-footer"
			data-state={state}
			className={cn(columnFooterVariants({ state }), className)}
			{...props}
		>
			{children}
		</div>
	);
}
