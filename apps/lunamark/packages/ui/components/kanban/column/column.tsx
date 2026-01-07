"use client";

import type { VariantProps } from "class-variance-authority";
import { useMemo, type ComponentProps, ReactNode } from "react";
import { cn } from "../../../utils/cn";
import { mergeRefs } from "../../../utils/merge-refs";
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
		children: ReactNode;
	};

export function Column({
	id,
	className,
	variant = "default",
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

	const {
		droppableRef,
		isDropTarget,
		isCollapsed,
		toggleCollapsed,
		itemCount,
		isEmpty,
		dataState,
		contentId,
	} = column;

	const internalVariant = isDropTarget ? "active" : variant;

	const contextValue: ColumnContextValue = useMemo(
		() => ({
			isDropTarget,
			isCollapsed,
			toggleCollapsed,
			itemCount,
			isEmpty,
			dataState,
			size,
			contentId,
		}),
		[
			isDropTarget,
			isCollapsed,
			toggleCollapsed,
			itemCount,
			isEmpty,
			dataState,
			size,
			contentId,
		]
	);

	const combinedRef = mergeRefs(droppableRef, ref);

	return (
		<ColumnContext.Provider value={contextValue}>
			<div
				ref={combinedRef}
				role="region"
				data-slot="column"
				data-state={dataState}
				data-drop-target={isDropTarget}
				className={cn(
					columnVariants({ variant: internalVariant, fluid, collapsed: column.isCollapsed }),
					className
				)}
				{...props}
			>
				{children}
			</div>
		</ColumnContext.Provider>
	);
}
