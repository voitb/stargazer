"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode, RefCallback } from "react";
import { cn } from "../../../utils/cn";
import { ColumnContext, type ColumnContextValue } from "./column.context";
import { columnVariants } from "./column.variants";
import { useColumn } from "./use-column";

export type ColumnProps = Omit<ComponentProps<"div">, "children"> &
	VariantProps<typeof columnVariants> & {
		id: string;
		type?: string;
		accept?: string[];
		disabled?: boolean;
		defaultCollapsed?: boolean;
		collapsed?: boolean;
		onCollapsedChange?: (collapsed: boolean) => void;
		items?: unknown[];
		fluid?: boolean;
		size?: "sm" | "md" | "lg";
		children: ReactNode;
	};

export function Column({
	id,
	className,
	variant: variantProp,
	fluid = true,
	size = "md",
	collapsed: collapsedProp,
	type,
	accept,
	disabled,
	defaultCollapsed,
	onCollapsedChange,
	items,
	children,
	ref,
	...props
}: ColumnProps) {
	const column = useColumn({
		id,
		type,
		accept,
		disabled,
		defaultCollapsed,
		collapsed: collapsedProp,
		onCollapsedChange,
		items,
	});

	const variant = column.isDropTarget ? "active" : (variantProp ?? "default");

	const contextValue: ColumnContextValue = {
		isDropTarget: column.isDropTarget,
		isCollapsed: column.isCollapsed,
		toggleCollapsed: column.toggleCollapsed,
		itemCount: column.itemCount,
		isEmpty: column.isEmpty,
		dataState: column.dataState,
		size,
		contentId: column.contentId,
	};

	const combinedRef: RefCallback<HTMLDivElement> = (node) => {
		column.droppableRef(node);
		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			ref.current = node;
		}
	};

	return (
		<ColumnContext.Provider value={contextValue}>
			<div
				ref={combinedRef}
				role="region"
				data-slot="column"
				data-state={column.dataState}
				data-drop-target={column.isDropTarget}
				className={cn(
					columnVariants({ variant, fluid, collapsed: column.isCollapsed }),
					className
				)}
				{...props}
			>
				{children}
			</div>
		</ColumnContext.Provider>
	);
}
