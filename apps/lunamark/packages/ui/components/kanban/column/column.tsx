"use client";

import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode, RefCallback } from "react";
import { cn } from "../../../utils/cn";
import { ColumnContext, type ColumnContextValue } from "./column.context";
import { columnVariants } from "./column.variants";
import { useColumn } from "./use-column";

export type ColumnProps<TItem = unknown> = Omit<
	ComponentProps<"div">,
	"children"
> &
	VariantProps<typeof columnVariants> & {
		// Identity (required for DnD)
		id: string;

		// DnD configuration
		type?: string;
		accept?: string[];
		disabled?: boolean;

		// Collapse (controlled/uncontrolled)
		defaultCollapsed?: boolean;
		collapsed?: boolean;
		onCollapsedChange?: (collapsed: boolean) => void;

		// Items (for itemCount in context)
		items?: TItem[];

		// Legacy API (backward compatibility)
		header?: ReactNode;
		footer?: ReactNode;

		children: ReactNode;
	};

export function Column<TItem = unknown>({
	id,
	className,
	variant: variantProp,
	size = "md",
	collapsed: collapsedProp,
	type,
	accept,
	disabled,
	defaultCollapsed,
	onCollapsedChange,
	items,
	header,
	footer,
	children,
	ref,
	...props
}: ColumnProps<TItem>) {
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

	// Determine variant: active when drop target, otherwise use prop or default
	const variant = column.isDropTarget ? "active" : (variantProp ?? "default");

	// Context value for sub-components
	const contextValue: ColumnContextValue = {
		isDropTarget: column.isDropTarget,
		isCollapsed: column.isCollapsed,
		toggleCollapsed: column.toggleCollapsed,
		itemCount: column.itemCount,
		isEmpty: column.isEmpty,
		dataState: column.dataState,
		size: size ?? "md",
		contentId: column.contentId,
	};

	// Merge droppable ref with forwarded ref
	const combinedRef: RefCallback<HTMLDivElement> = (node) => {
		column.droppableRef(node);
		if (typeof ref === "function") {
			ref(node);
		} else if (ref) {
			(ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
		}
	};

	// Detect legacy API usage
	const isLegacyAPI = header !== undefined || footer !== undefined;

	return (
		<ColumnContext.Provider value={contextValue}>
			<div
				ref={combinedRef}
				role="region"
				data-state={column.dataState}
				data-drop-target={column.isDropTarget}
				className={cn(
					columnVariants({ variant, size, collapsed: column.isCollapsed }),
					className
				)}
				{...props}
			>
				{isLegacyAPI ? (
					// Legacy API: header/footer props with inline content area
					<>
						{header && <div className="p-4 pb-2">{header}</div>}
						<div className="flex-1 p-3 space-y-3 overflow-y-auto overflow-x-hidden min-h-37.5 scrollbar-thin">
							{children}
						</div>
						{footer && <div className="p-3 pt-2">{footer}</div>}
					</>
				) : (
					// New API: compound children (ColumnHeader, ColumnContent, ColumnFooter)
					children
				)}
			</div>
		</ColumnContext.Provider>
	);
}
