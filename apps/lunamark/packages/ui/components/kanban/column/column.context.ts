"use client";

import { createContext, useContext } from "react";

export type ColumnContextValue = {
	// DnD state
	isDropTarget: boolean;

	// Collapse state
	isCollapsed: boolean;
	toggleCollapsed: () => void;

	// Computed values
	itemCount: number;
	isEmpty: boolean;

	// Data attributes (for sub-component styling)
	dataState: "default" | "active" | "collapsed";

	// Sizing (passed from Column root)
	size: "sm" | "md" | "lg";

	// IDs for accessibility
	contentId: string;
};

export const ColumnContext = createContext<ColumnContextValue | null>(null);

export function useColumnContext(componentName: string): ColumnContextValue {
	const context = useContext(ColumnContext);
	if (!context) {
		throw new Error(
			`<${componentName}> must be used within a <Column> provider`
		);
	}
	return context;
}
