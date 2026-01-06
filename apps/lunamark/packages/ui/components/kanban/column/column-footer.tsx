"use client";

import type { ComponentProps } from "react";
import { cn } from "../../../utils/cn";
import { useColumnContext } from "./column.context";
import { columnFooterVariants } from "./column.variants";

export type ColumnFooterProps = ComponentProps<"div">;

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
