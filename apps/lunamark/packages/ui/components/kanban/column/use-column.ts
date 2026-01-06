"use client";

import { useCallback, useId } from "react";
import { CollisionPriority } from "@dnd-kit/abstract";
import { useDroppable } from "@dnd-kit/react";
import { useControllableState } from "../../../hooks/use-controllable-state";

export type UseColumnOptions<TItem = unknown> = {
	// Identity (required for DnD)
	id: string;

	// DnD-kit configuration
	type?: string;
	accept?: string[];
	collisionPriority?: CollisionPriority;
	disabled?: boolean;

	// Collapse state (controlled/uncontrolled)
	defaultCollapsed?: boolean;
	collapsed?: boolean;
	onCollapsedChange?: (collapsed: boolean) => void;

	// Items (props-driven, parent manages state)
	items?: TItem[];
};

export type UseColumnReturn<TItem = unknown> = {
	// DnD state
	droppableRef: (element: HTMLElement | null) => void;
	isDropTarget: boolean;

	// Collapse state
	isCollapsed: boolean;
	setCollapsed: (collapsed: boolean) => void;
	toggleCollapsed: () => void;

	// Computed values
	itemCount: number;
	isEmpty: boolean;

	// Data attributes for styling/animations
	dataState: "default" | "active" | "collapsed";

	// IDs for accessibility
	contentId: string;

	// Prop getters (headless-first pattern)
	getColumnProps: () => {
		role: "region";
		"data-state": "default" | "active" | "collapsed";
		"data-drop-target": boolean;
	};

	getHeaderProps: () => {
		"aria-expanded": boolean;
		"data-state": "default" | "active" | "collapsed";
	};

	getContentProps: () => {
		id: string;
		"aria-hidden": boolean;
		"data-state": "expanded" | "collapsed";
	};

	getCollapseButtonProps: () => {
		"aria-expanded": boolean;
		"aria-controls": string;
		onClick: () => void;
	};
};

export function useColumn<TItem = unknown>(
	options: UseColumnOptions<TItem>
): UseColumnReturn<TItem> {
	const {
		id,
		type = "column",
		accept = ["item"],
		collisionPriority = CollisionPriority.Low,
		disabled = false,
		defaultCollapsed = false,
		collapsed: controlledCollapsed,
		onCollapsedChange,
		items = [],
	} = options;

	// Generate unique ID for aria-controls
	const contentId = useId();

	// Collapse state (controlled/uncontrolled pattern)
	const [isCollapsed, setCollapsed] = useControllableState({
		value: controlledCollapsed,
		defaultValue: defaultCollapsed,
		onChange: onCollapsedChange,
	});

	// DnD-kit integration (disabled when collapsed)
	const { ref: droppableRef, isDropTarget } = useDroppable({
		id,
		type,
		collisionPriority,
		accept,
		disabled: disabled || isCollapsed,
	});

	// Computed values
	const itemCount = items.length;
	const isEmpty = itemCount === 0;

	// Toggle helper
	const toggleCollapsed = useCallback(() => {
		setCollapsed(!isCollapsed);
	}, [isCollapsed, setCollapsed]);

	// Compute data-state for CSS animations
	const dataState = isCollapsed
		? "collapsed"
		: isDropTarget
			? "active"
			: "default";

	return {
		// DnD state
		droppableRef,
		isDropTarget,

		// Collapse state
		isCollapsed,
		setCollapsed,
		toggleCollapsed,

		// Computed
		itemCount,
		isEmpty,
		dataState,

		// IDs
		contentId,

		// Prop getters
		getColumnProps: () => ({
			role: "region" as const,
			"data-state": dataState,
			"data-drop-target": isDropTarget,
		}),

		getHeaderProps: () => ({
			"aria-expanded": !isCollapsed,
			"data-state": dataState,
		}),

		getContentProps: () => ({
			id: contentId,
			"aria-hidden": isCollapsed,
			"data-state": isCollapsed ? ("collapsed" as const) : ("expanded" as const),
		}),

		getCollapseButtonProps: () => ({
			"aria-expanded": !isCollapsed,
			"aria-controls": contentId,
			onClick: toggleCollapsed,
		}),
	};
}
